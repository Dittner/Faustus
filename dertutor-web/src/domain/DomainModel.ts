export interface ILang {
  readonly id: number
  readonly code: string
  readonly name: string
  readonly vocs: IVoc[]
  readonly tags: ITag[]
}

export interface IVoc {
  readonly id: number
  readonly lang_id: number
  readonly name: string
}

export interface ITag {
  readonly id: number
  readonly lang_id: number
  readonly name: string
}

export interface IPage {
  readonly items: INote[]
  readonly total: number
  readonly page: number
  readonly size: number
  readonly pages: number
}

export interface INote {
  readonly id: number
  readonly name: string
  readonly text: string
  readonly level: number
  readonly voc_id: number
  readonly audio_url: string
  readonly tag_id: number | undefined
  readonly media: IMediaFile[] | undefined
}

export interface IMediaFile {
  readonly uid: string
  readonly note_id: number
  readonly name: string
  readonly media_type: string
}

export const AVAILABLE_LEVELS = ['', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']

export class DomainService {
  private static readonly cache: Record<string, string> = {}
  static encodeName(name: string): string {
    if (DomainService.cache[name]) return DomainService.cache[name]
    const res = name.toLowerCase()
      .replaceAll('ö', 'oe')
      .replaceAll('ä', 'ae')
      .replaceAll('ü', 'ue')
      .replaceAll(' ', '_')
      .split('').filter(c => (c >= 'a' && c <= 'z') || (c >= '0' && c <= '9') || c === '_').join('')

    DomainService.cache[name] = res
    return res
  }
}