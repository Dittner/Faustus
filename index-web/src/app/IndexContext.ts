import { RXObservableValue } from 'flinker'
import { globalContext } from '../App'
import { StoreService } from '../backend/StoreService'
import { RootTextFile, TextFile } from '../domain/DomainModel'
import { Editor } from '../ui/editor/Editor'
import { GlobalContext } from './GlobalContext'

export class IndexContext {
  readonly $selectedFile: RXObservableValue<TextFile>
  readonly $isSelectedFileEditing = new RXObservableValue(false)
  readonly $selectedFileChapter = new RXObservableValue('')
  readonly $isFileTreeShown = new RXObservableValue(true)
  readonly $isLoading = new RXObservableValue(false)

  readonly directoriesUID: string[]
  readonly editor: Editor
  readonly storeService: StoreService
  readonly root: TextFile
  static self: IndexContext

  static init() {
    if (IndexContext.self === undefined) {
      IndexContext.self = new IndexContext()
    }
    return IndexContext.self
  }

  private constructor() {
    console.log('new IndexContext')
    this.storeService = new StoreService(globalContext.restApi)
    console.log('creating root text file, ss:', this.storeService)
    this.root = new RootTextFile()
    this.$selectedFile = new RXObservableValue(this.root)
    this.directoriesUID = []
    this.editor = new Editor(this)
    
    this.$selectedFile.pipe()
      .skipNullable()
      .flatMap(f => f)
      .map(f => f.isEditing)
      .removeDuplicates()
      .onReceive(v => this.$isSelectedFileEditing.value = v)
      .subscribe()

    this.$selectedFileChapter.pipe()
      .debounce(100)
      .onReceive(v => {
        if (v) {
          const element = document.getElementById(v)
          //console.log('selectedFileChapter:onRecieved:value:', v)
          if (element) {
            const elementPos = Math.round(element.getBoundingClientRect().top + document.documentElement.scrollTop)
            // element.scrollIntoView();
            //console.log('elementPos=', elementPos)
            window.scrollTo(0, elementPos - 40)
          }
        }
      })
      .subscribe()

    this.loadRootDir()
  }

  private loadRootDir() {
    console.log('IndexContext:loadRootDir')
    this.$isLoading.value = true
    globalContext.restApi.loadChildrenFiles('').pipe()
      .onReceive((files: any) => {
        console.log('IndexContext:loadRootDir:onReceive, files count:', files.length)
        this.$isLoading.value = false
        if (files.length === 1) {
          this.root.deserialize(files[0])
          if (this.root.isDamaged) globalContext.app.$errorMsg.value = 'Root dir is damaged!'

          this.$selectedFile.value = this.root
          this.subscribeToBrowserLocation()
        } else if (files.length > 1) {
          throw new Error(files.length + 'root dirs have been loaded. One is expected.')
        }
      })
      .onError(_ => {
        this.$isLoading.value = false
        globalContext.app.$errorMsg.value = 'Failed to load root directories'
      })

      .subscribe()
  }

  private subscribeToBrowserLocation() {
    GlobalContext.self.app.$location.pipe()
      .onReceive(_ => {
        this.parseBrowserLocation()
      })
      .subscribe()
  }

  private parseBrowserLocation() {
    const path = document.location.pathname //'/directoryId/fileId
    const selectedChapter = document.location.hash //#hash
    const vv = path.split('/') //[ 'index', 'directoryId', 'fileId', 'hash' ]
    console.log('IndexContext:parseBrowserLocation, vv:', vv)
    if (vv[vv.length - 1] === selectedChapter) {
      vv.pop()
    }

    let selectedFile = this.root
    while (vv.length > 0) {
      const id = vv.shift()
      const files: TextFile[] = selectedFile?.children ?? []
      for (let i = 0; i < files.length; i++) {
        if (files[i].id === id) {
          selectedFile = files[i]
          break
        }
      }

      if (selectedFile?.isDirectory) {
        if (!selectedFile.filesLoaded) {
          this.$isLoading.value = true
          selectedFile.loadChildrenFiles().pipe()
            .onReceive(() => {
              this.$isLoading.value = false
              this.parseBrowserLocation()
            })
            .onError(_ => {
              this.$isLoading.value = false
              globalContext.app.$errorMsg.value = 'Failed to load files for selected directory/file with id: ' + this.$selectedFile.value.id
            })
            .subscribe()

          break
        }
      } else {
        break
      }
    }

    this.$selectedFile.value = selectedFile
    console.log('selectedChapter:', selectedChapter, ', path:', path, ', selectedFile.id:', selectedFile.id)
    this.$selectedFileChapter.value = selectedChapter && path.endsWith(selectedFile.id) ? selectedChapter : ''
  }

  navigate(to: string) {
    globalContext.app.navigate(to)
  }

  createNewFile() {
    const f = this.$selectedFile.value
    if (f) {
      const res = f.createAndAddFile()
      if (res) this.navigate(res.link)
    }
  }

  createNewDir = () => {
    const f = this.$selectedFile.value
    if (f && f.isDirectory) {
      const res = f.createAndAddDirectory()
      if (res) this.navigate(res.link)
    }
  }

  add(f: TextFile) {
    this.root?.children.push(f)
  }

  remove(f: TextFile) {
    const ind = f.parent?.children.indexOf(f) ?? -1
    if (ind !== -1) {
      this.$isLoading.value = true
      globalContext.restApi.removeFile(f).pipe()
        .onReceive(() => {
          console.log('User:remove:onReceive')
          f.parent?.children.splice(ind, 1)
          if (this.$selectedFile.value === f) {
            this.$selectedFile.value = f.parent ?? this.root
          }
        })
        .onError(_ => {
          globalContext.app.$errorMsg.value = 'Failed to remove the directory/file with id: ' + f.id
        })
        .onComplete(() => {
          this.$isLoading.value = false
        })
        .subscribe()
    } else {
      console.warn('Removing file not found')
    }
  }
}

