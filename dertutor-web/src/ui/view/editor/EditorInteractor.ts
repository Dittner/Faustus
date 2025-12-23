import { globalContext } from "../../../App";
import { DertutorContext } from "../../../DertutorContext";
import { DomainService, ILang, INote, IVoc } from "../../../domain/DomainModel";
import { UrlKeys } from "../../../app/URLNavigator";

export interface EditorState {
  allLangs?: ILang[]
  lang?: ILang
  voc?: IVoc
  note?: INote
}

export class EditorInteractor {
  private readonly ctx: DertutorContext
  constructor(ctx: DertutorContext) {
    this.ctx = ctx
  }

  async run(keys: UrlKeys): Promise<EditorState>  {
    const state: EditorState = {}
    await this.loadLangs(state, keys)
    await this.chooseLang(state, keys)
    await this.chooseVoc(state, keys)
    await this.loadNote(state, keys)
    return state
  }

  async loadLangs(state: EditorState, keys: UrlKeys) {
    if (this.ctx.$allLangs.value.length === 0)
      this.ctx.$allLangs.value = await globalContext.server.loadAllLangs().asAwaitable
    state.allLangs = this.ctx.$allLangs.value
  }

  async chooseLang(state: EditorState, keys: UrlKeys) {
    state.lang = state.allLangs && state.allLangs.find(l => l.code === keys.langCode)
  }

  async chooseVoc(state: EditorState, keys: UrlKeys) {
    if (state.lang && keys.vocCode)
      state.voc = state.lang.vocs.find(v => DomainService.encodeName(v.name) === keys.vocCode)
  }

  async loadNote(state: EditorState, keys: UrlKeys) {
    if (keys.noteId)
      state.note = await globalContext.server.loadNote(keys.noteId).asAwaitable
  }
}

