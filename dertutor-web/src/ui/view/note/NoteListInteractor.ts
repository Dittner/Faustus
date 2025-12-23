import { globalContext } from "../../../App";
import { GetPageSchema } from "../../../backend/Schema";
import { DertutorContext } from "../../../DertutorContext";
import { DomainService, ILang, INote, IPage, IVoc } from "../../../domain/DomainModel";
import { UrlKeys } from "../../../app/URLNavigator";

export interface NoteListState {
  allLangs?: ILang[]
  lang?: ILang
  voc?: IVoc
  page?: IPage
  selectedNote?: INote
  searchKey?: string
  level?: number
  tagId?: number
}

export class NoteListInteractor {
  private readonly ctx: DertutorContext
  private prevState: NoteListState = {}

  constructor(ctx: DertutorContext) {
    console.log('new NoteListInteractor')
    this.ctx = ctx
  }

  async run(keys: UrlKeys): Promise<NoteListState> {
    console.log('NoteListInteractor, run, prev state', this.prevState)
    const state: NoteListState = {}
    await this.loadLangs(state, keys)
    await this.chooseLang(state, keys)
    await this.chooseVoc(state, keys)
    await this.chooseFilters(state, keys)
    await this.loadPage(state, keys)
    await this.chooseNote(state, keys)
    this.prevState = state

    return state
  }

  private async loadLangs(state: NoteListState, keys: UrlKeys) {
    if (this.ctx.$allLangs.value.length === 0)
      this.ctx.$allLangs.value = await globalContext.server.loadAllLangs().asAwaitable
    state.allLangs = this.ctx.$allLangs.value
  }

  private async chooseLang(state: NoteListState, keys: UrlKeys) {
    state.lang = state.allLangs && state.allLangs.find(l => l.code === keys.langCode)
  }

  private async chooseVoc(state: NoteListState, keys: UrlKeys) {
    if (state.lang && keys.vocCode)
      state.voc = state.lang.vocs.find(v => DomainService.encodeName(v.name) === keys.vocCode)
  }

  private async chooseFilters(state: NoteListState, keys: UrlKeys) {
    state.searchKey = keys.searchKey
    state.level = keys.level
    state.tagId = keys.tagId
  }

  private async loadPage(state: NoteListState, keys: UrlKeys) {
    if (!state.lang) return

    if (!this.prevState.page ||
      this.prevState.page.page !== (keys.page ?? 1) ||
      this.prevState.lang?.id !== state.lang.id ||
      this.prevState.voc?.id !== state.voc?.id ||
      this.prevState.level !== state.level ||
      this.prevState.tagId !== state.tagId ||
      this.prevState.searchKey !== state.searchKey) {

      const isGlobalSearhcing = keys.searchKey && keys.searchKey.length > 1

      const scheme = {} as GetPageSchema
      scheme.lang_id = state.lang.id
      scheme.page = keys.page && keys.page > 0 ? keys.page : 1
      scheme.size = DertutorContext.PAGE_SIZE
      scheme.voc_id = isGlobalSearhcing ? undefined : state.voc?.id
      scheme.key = isGlobalSearhcing ? keys.searchKey : undefined
      scheme.level = keys.level
      scheme.tag_id = keys.tagId

      console.log('Interactor.reloadPage, page:', keys.page)
      state.page = await globalContext.server.loadNotes(scheme).asAwaitable
    } else {
      state.page = this.prevState.page
    }
  }

  private async chooseNote(state: NoteListState, keys: UrlKeys) {
    if (state.page)
      state.selectedNote = state.page.items.find(n => n.id === keys.noteId)
  }

  clearCache() {
    this.prevState = {}
  }
}

