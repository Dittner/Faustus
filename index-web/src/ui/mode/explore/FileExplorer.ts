import { RXObservableValue, RXSubject } from "flinker"
import { globalContext } from "../../../App"
import { IndexContext } from "../../IndexContext"
import { OperatingModeClass } from "../OperatingMode"
import { generateUID, Path, sortByKeys } from "../../../app/Utils"
import { TextFile } from "../../../domain/DomainModel"
import { InputBufferController } from "../../controls/Input"
import { FileNode } from "../FileNode"
import { parseKeyToCode } from "../Action"
import { log } from "../../../app/Logger"

const FILES_SORT = sortByKeys(['isDir', 'alias'], [false, true])
const PATH_ALLOWED_SYMBOLS: Set<string> = new Set('_0123456789/abcdefghijklmnopqrstuvwxyz'.split(''))

export class FileExplorer extends OperatingModeClass {
  readonly $openedDirPath = new RXSubject<string, never>('')
  readonly $openedDirFiles = new RXObservableValue<Array<FileNode>>([])
  readonly $selectedFilePath = new RXObservableValue<string>('')
  private readonly $allFiles = new RXObservableValue<Array<FileNode>>([])

  readonly $mode = new RXObservableValue<'explore' | 'create' | 'rename'>('explore')
  readonly bufferController = new InputBufferController(PATH_ALLOWED_SYMBOLS)

  private isFilesTreeLoaded = false
  filesAliasVoc: Record<string, string> = {}

  constructor(ctx: IndexContext) {
    super('explore', ctx)
    this.addKeybindings()

    this.$openedDirPath.pipe()
      .onReceive(openedDirPath => {
        log('openedDirPath has changed:', openedDirPath)
        this.$openedDirFiles.value = this.$allFiles.value.filter(f => {
          if (f.isDir) return (openedDirPath + f.id + '/') === f.path
          else return (openedDirPath + f.id) === f.path
        })

        //this.$selectedFilePath.value = this.$openedDirFiles.value.length > 0 ? this.$openedDirFiles.value[0].path : ''
      })
      .subscribe()
  }

  private addKeybindings() {
    this.actionsList.add('g', 'Select first file', () => this.moveCursorToTheFirst())
    this.actionsList.add('G', 'Select last file', () => this.moveCursorToTheLast())

    this.actionsList.add('j', 'Select next file', () => this.moveCursor(1))
    this.actionsList.add('k', 'Select prev file', () => this.moveCursor(-1))
    this.actionsList.add('h', 'Navigate back', () => this.moveCursorBack())
    this.actionsList.add('l', 'Navigate forward', () => this.moveCursorIntoDir())

    this.actionsList.add('<Down>', 'Select next file', () => this.moveCursor(1))
    this.actionsList.add('<Up>', 'Select prev file', () => this.moveCursor(-1))
    this.actionsList.add('<Left>', 'Navigate back', () => this.moveCursorBack())
    this.actionsList.add('<Right>', 'Navigate forward', () => this.moveCursorIntoDir())
    this.actionsList.add('<CR>', 'Open file', () => this.openFile())

    this.actionsList.add('n', 'New file', () => this.newFile())
    this.actionsList.add(':d<CR>', 'Delete file', () => this.deleteFile())
    this.actionsList.add('r', 'Rename file', () => this.renameFile())
    this.actionsList.add('/', 'Search file', () => this.searchFile())
  }

  private moveCursor(step: number) {
    const children = this.$openedDirFiles.value
    if (children.length === 0) return

    const curFilePath = this.$selectedFilePath.value
    for (let i = 0; i < children.length; i++) {
      if (curFilePath === children[i].path) {
        if ((i + step) >= 0 && (i + step) < children.length)
          this.$selectedFilePath.value = children[i + step].path
        return
      }
    }
    this.$selectedFilePath.value = children[0].path
  }

  private moveCursorBack() {
    const parentPath = Path.parentPathOf(this.$openedDirPath.value)
    if (parentPath !== this.$openedDirPath.value) {
      this.$selectedFilePath.value = this.$openedDirPath.value
      this.$openedDirPath.send(parentPath)
    }
  }

  private moveCursorIntoDir() {
    if (this.$selectedFilePath.value.endsWith('/')) {
      this.$openedDirPath.send(this.$selectedFilePath.value)
      if (this.$openedDirFiles.value.length > 0)
        this.$selectedFilePath.value = this.$openedDirFiles.value[0].path
    }
  }

  private moveCursorUnder(path: string) {
    const children = this.$openedDirFiles.value
    for (let i = 0; i < children.length; i++) {
      if (children[i].path === path) {
        this.$selectedFilePath.value = path
        return
      }
    }
  }

  private moveCursorToTheFirst() {
    const children = this.$openedDirFiles.value
    if (children.length > 0)
      this.$selectedFilePath.value = children[0].path
  }

  private moveCursorToTheLast() {
    const children = this.$openedDirFiles.value
    if (children.length > 0)
      this.$selectedFilePath.value = children[children.length - 1].path
  }

  private openFile() {
    if (this.$selectedFilePath.value.endsWith('/')) {
      this.$openedDirPath.send(this.$selectedFilePath.value)
      const children = this.$openedDirFiles.value
      if (children.length > 0)
        this.$selectedFilePath.value = children[0].path
      globalContext.app.navigate(this.$openedDirPath.value)
    }
    else if (this.$selectedFilePath.value) {
      globalContext.app.navigate( this.$selectedFilePath.value)
      this.ctx.reader.activate()
    }
  }

  private newFile() {
    if (this.$mode.value === 'explore') {
      const path = this.$openedDirPath.value ? this.$openedDirPath.value + generateUID() : generateUID()
      this.bufferController.$buffer.value = path
      this.bufferController.$title.value = 'New:'
      this.$mode.value = 'create'
    }
  }

  private deleteFile() {
    if (this.$mode.value === 'explore') {
      const path = this.$selectedFilePath.value
      if (path) {
        globalContext.indexServer.removeFile(path).pipe()
          .onReceive(data => {
            this.ctx.$msg.value = { text: path + ', deleted', level: 'info' }

            this.moveCursor(1)
            if (this.$selectedFilePath.value == path)
              this.moveCursor(-1)

            if (path.endsWith('/')) {
              this.loadFilesTree()
            }
            else {
              this.$allFiles.value = this.$allFiles.value.filter(f => f.path !== path)
              this.addNewFiles(data)
              this.refreshFileList()
            }
          })
          .onError(e => {
            this.ctx.$msg.value = { text: e.message, level: 'error' }
          })
          .subscribe()
      } else {
        this.ctx.$msg.value = { text: 'File not selected', level: 'warning' }
      }
    }
  }

  private renameFile() {
    if (this.$mode.value === 'explore') {
      const path = this.$selectedFilePath.value
      if (path) {
        this.bufferController.$buffer.value = path
        this.bufferController.$title.value = 'Rename:'
        this.$mode.value = 'rename'
      } else {
        this.ctx.$msg.value = { text: 'File not selected', level: 'warning' }
      }
    }
  }

  private searchFile() {
    if (this.$mode.value === 'explore')
      this.ctx.searcher.activate()
  }

  override onKeyDown(e: KeyboardEvent): void {
    if (this.$mode.value !== 'explore') {
      const code = parseKeyToCode(e)
      if (code === '<ESC>') {
        this.$mode.value = 'explore'
      } else if (code === '<CR>') {
        this.applyInput()
      } else {
        this.bufferController.onKeyDown(e)
      }
    } else {
      super.onKeyDown(e)
    }
  }

  private applyInput() {
    if (this.$mode.value === 'create') {
      const path = this.bufferController.$buffer.value
      const f = TextFile.createFile(path)
      globalContext.indexServer.createFile(f).pipe()
        .onReceive(data => {
          this.ctx.$msg.value = { text: f.path + ', written', level: 'info' }
          this.addNewFiles(data)
          this.$mode.value = 'explore'
          this.refreshFileList()
          this.moveCursorUnder(path)
        })
        .onError(e => {
          this.ctx.$msg.value = { text: e.message, level: 'error' }
          this.$mode.value = 'explore'
        })
        .subscribe()
    } else if (this.$mode.value === 'rename') {
      const fromPath = this.$selectedFilePath.value ?? ''
      const toPath = this.bufferController.$buffer.value
      if (fromPath && toPath && fromPath !== toPath) {
        globalContext.indexServer.renameFile(fromPath, toPath).pipe()
          .onReceive(_ => {
            // when only file name is changed
            if (!fromPath.endsWith('/') && Path.parentPathOf(fromPath) === Path.parentPathOf(toPath)) {
              for (const f of this.$allFiles.value) {
                if (f.path === fromPath) {
                  f.path = toPath
                  f.id = Path.stem(toPath)
                  this.$selectedFilePath.value = toPath
                  this.filesAliasVoc[toPath] = this.filesAliasVoc[fromPath]
                  break
                }
              }
            } else {
              this.loadFilesTree()
            }
            this.ctx.$msg.value = { text: fromPath + ', renamed to ' + toPath, level: 'info' }
            this.$mode.value = 'explore'
          })
          .onError(e => {
            this.ctx.$msg.value = { text: e.message, level: 'error' }
            this.$mode.value = 'explore'
          })
          .subscribe()
      } else {
        this.ctx.$msg.value = { text: 'File not selected', level: 'warning' }
      }
    }
  }

  private addNewFiles(data: []) {
    //log('parseRawFiles: data=', data)
    const hash = new Set<string>()
    this.$allFiles.value.forEach(f => hash.add(f.path))
    data.forEach((d: any) => {
      if (!hash.has(d.path)) {
        hash.add(d.path)
        const f = new FileNode()
        f.deserialize(d)
        f.alias = this.filesAliasVoc[f.path] ?? f.id
        if (d.isDamaged) {
          this.ctx.$msg.value = { text: 'File is damaged', level: 'error' }
        } else {
          this.$allFiles.value.push(f)
        }
      }
    })
    this.$allFiles.value = this.$allFiles.value.sort(FILES_SORT)
  }

  /*
  *
  * ACTIVATE
  *
  */

  override activate(): void {
    super.activate()
    if (!this.isFilesTreeLoaded) {
      this.isFilesTreeLoaded = true
      this.loadAliasVoc()
    } else {
      this.selectFileSpecifiedInAdressBar()
    }
  }

  private loadAliasVoc() {
    if (!this.isActive) return
    log('FileExplorer:loadAliasVoc')
    this.ctx.$msg.value = { text: 'Loading...', level: 'info' }
    globalContext.indexServer.loadAliasVoc().pipe()
      .onReceive((data: any) => {
        this.ctx.$msg.value = undefined
        log('FileExplorer:loadAliasVoc, complete, data: ', data)
        this.filesAliasVoc = data
        this.loadFilesTree()
      })
      .onError(e => {
        this.ctx.$msg.value = { text: e.message, level: 'error' }
      })
      .subscribe()
  }

  private loadFilesTree() {
    if (!this.isActive) return
    log('FileExplorer:loadTree')
    // document.location.pathname === directoryId/fileId#hash
    //const path = document.location.pathname.split('#')[0]
    //const selectedChapter = document.location.hash //#hash
    globalContext.indexServer.loadFilesTree().pipe()
      .onReceive((data: []) => {
        this.$allFiles.value = []
        this.addNewFiles(data)
        this.refreshFileList()
        this.selectFileSpecifiedInAdressBar()
      })
      .onError(e => {
        this.ctx.$msg.value = { text: e.message, level: 'error' }
      })
      .subscribe()
  }

  // private * flatGenerator(f: FileNode): Generator<FileNode> {
  //   yield f
  //   for (const child of f.children)
  //     yield* this.flatGenerator(child)
  // }

  private selectFileSpecifiedInAdressBar() {
    let path = document.location.pathname.split('#')[0]
    //if (path.startsWith('/')) path = path.slice(1)
    let isDir = path.endsWith('/')
    const dirPath = isDir ? path : Path.parentPathOf(path)
    for (const f of this.$allFiles.value)
      if (f.path === dirPath) {
        this.$openedDirPath.send(dirPath)
        break
      }

    if (isDir) {
      if (this.$openedDirFiles.value.length > 0)
        this.$selectedFilePath.value = this.$openedDirFiles.value[0].path
    } else {
      this.$selectedFilePath.value = path
    }
  }

  private refreshFileList() {
    this.$openedDirPath.resend()
  }
}