import { RX, RXObservableValue } from "flinker"
import { globalContext } from "../../../App"
import { IndexContext } from "../../IndexContext"
import { OperatingModeClass } from "../OperatingMode"
import { sortByKeys } from "../../../app/Utils"
import { FileNode } from "../FileNode"

const FILES_SORT = sortByKeys(['isDir', 'alias'], [false, true])

export class FileSearcher extends OperatingModeClass {
  readonly $selectedFilePath = new RXObservableValue('')
  readonly $availableFiles = new RXObservableValue<Array<FileNode>>([])
  readonly $buffer = new RXObservableValue('')
  readonly $cursorPos = new RXObservableValue(-1)
  readonly allowedSymbols: Set<string>
  readonly $allFiles = new RXObservableValue<Array<FileNode>>([])

  filesAliasVoc = new Map<string, string>()
  filesAliasLowerCasedVoc = new Map<string, string>()

  constructor(ctx: IndexContext) {
    super('search', ctx)
    this.allowedSymbols = new Set('_0123456789/abcdefghijklmnopqrstuvwxyz'.split(''))
    this.actionsList.clear()

    RX.combine(this.$allFiles, this.$buffer).pipe()
      .onReceive(values => {
        const files = values[0]
        const ss = values[1]
        const res = files.filter((f: FileNode) => {
          return f.path.includes(ss) || this.filesAliasLowerCasedVoc.get(f.path)?.includes(ss)
        })

        this.$availableFiles.value = res
        this.$selectedFilePath.value = this.$availableFiles.value.length > 0 ? this.$availableFiles.value[0].path : ''
      })
      .subscribe()
  }

  override onKeyDown(e: KeyboardEvent): void {
    const code = this.actionsList.parser.keyToCode(e)
    e.preventDefault()
    if (code === '<ESC>') {
      this.cancel()
    } else if (code === '<CR>') {
      this.openFile()
    } else if (code === '<BS>') {
      this.$buffer.value = this.$buffer.value.length > 0 ? this.$buffer.value.slice(0, -1) : ''
    } else if (code === '<Up>') {
      this.selectFile(-1)
    } else if (code === '<Down>') {
      console.log('Selecting!!!')
      this.selectFile(1)
    }
    else if (e.key.length === 1) {
      if (this.$cursorPos.value === -1)
        this.$buffer.value += e.key.toLocaleLowerCase()
      else {
        this.$buffer.value = this.$buffer.value.slice(0, this.$cursorPos.value) + e.key.toLocaleLowerCase() + this.$buffer.value.slice(this.$cursorPos.value)
        this.$cursorPos.value++
      }
    }
  }


  private selectFile(step: number) {
    const children = this.$availableFiles.value
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

  private selectFileWith(path: string) {
    const children = this.$availableFiles.value
    for (let i = 0; i < children.length; i++) {
      if (children[i].path === path) {
        this.$selectedFilePath.value = path
        return
      }
    }
  }

  private openFile() {
    if (this.$selectedFilePath.value.endsWith('/')) {
      globalContext.app.navigate('/' + this.$selectedFilePath.value)
      this.ctx.explorer.activate()
    }
    else if (this.$selectedFilePath.value) {
      globalContext.app.navigate('/' + this.$selectedFilePath.value)
      this.ctx.reader.activate()
    }
  }

  private cancel() {
    const path = document.location.pathname.split('#')[0]
    if (path.endsWith('/')) this.ctx.explorer.activate()
    else this.ctx.reader.activate()
  }


  /*
  *
  * ACTIVATE
  *
  */

  override activate(): void {
    super.activate()
    this.$buffer.value = ''
    this.loadAliasVoc()
  }

  private loadAliasVoc() {
    if (!this.isActive) return
    console.log('FileSearcher:loadAliasVoc')
    this.ctx.$msg.value = { text: 'Loading...', level: 'info' }
    globalContext.restApi.loadAliasVoc().pipe()
      .onReceive((data: any) => {
        this.ctx.$msg.value = undefined
        console.log('FileSearcher:loadAliasVoc, complete, data: ', data)
        this.filesAliasVoc.clear()
        this.filesAliasLowerCasedVoc.clear()
        for (const path in data) {
          this.filesAliasVoc.set(path, data[path])
          this.filesAliasLowerCasedVoc.set(path, data[path].toLowerCase())
        }

        const diary = this.filesAliasLowerCasedVoc.get('index/dittner/diary') ?? ''
        console.log('TAGEBUCH ', diary, ', includes buch:', diary.includes('buch'))
        this.loadFilesTree()
      })
      .onError(e => {
        this.ctx.$msg.value = { text: e.message, level: 'error' }
      })
      .subscribe()
  }

  private loadFilesTree() {
    if (!this.isActive) return
    console.log('FileExplorer:loadTree')
    globalContext.restApi.loadFilesTree().pipe()
      .onReceive((data: []) => {
        this.parseFilesTree(data)
      })
      .onError(e => {
        this.ctx.$msg.value = { text: e.message, level: 'error' }
      })
      .subscribe()
  }

  private parseFilesTree(data: []) {
    const res: Array<FileNode> = []
    data.forEach((d: any) => {
      const f = new FileNode()
      f.deserialize(d)
      f.alias = this.filesAliasVoc.get(f.path) ?? f.id
      if (d.isDamaged) {
        this.ctx.$msg.value = { text: 'File is damaged', level: 'error' }
      } else {
        res.push(f)
      }
    })
    this.$allFiles.value = res.sort(FILES_SORT)
  }
}