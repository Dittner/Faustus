export interface RequestBody {
  serialize: () => string
}

export class FileDto implements RequestBody {
  id: string
  content: string
  constructor(id: string, content: string) {
    this.id = id
    this.content = content
  }

  serialize() {
    return JSON.stringify(this)
  }
}
