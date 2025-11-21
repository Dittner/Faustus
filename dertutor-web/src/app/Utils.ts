const uidPrefix = 'u' + (Date.now() - (new Date(2020, 1, 1)).getTime()).toString(10) + 'x'
let uidNum = 0
export type UID = string

export const generateUID = (): UID => {
  return uidPrefix + (uidNum++).toString(36)
}

export const sortByKey = (key: string) => {
  return (a: any, b: any) => {
    if (a[key] < b[key]) return -1
    if (a[key] > b[key]) return 1
    return 0
  }
}

export const sortByKeys = (keys: string[], ascendingMask: boolean[] = []) => {
  return (a: any, b: any) => {
    let index = 0
    while (index < keys.length) {
      const key = keys[index]
      if (index >= ascendingMask.length || ascendingMask[index]) {
        if (a[key] < b[key]) return -1
        if (a[key] > b[key]) return 1
      } else {
        if (a[key] < b[key]) return 1
        if (a[key] > b[key]) return -1
      }
      index++
    }
    return 0
  }
}

export const indexOfFirstVisibleElement = (coll: HTMLElement[], scrollY: number, parentHeight: number): number => {
  let res = -1
  // at the end of the parent – we need to select the last element
  if (scrollY + window.innerHeight >= parentHeight) {
    for (let i = coll.length - 1; i >= 0; i--) {
      const elTop = coll[i].getBoundingClientRect().top
      if (elTop >= 0 && elTop < window.innerHeight) {
        return i
      }
    }
  } else {
    for (let i = 0; i < coll.length; i++) {
      const rect = coll[i].getBoundingClientRect()
      if (rect.top >= -50 && rect.top < window.innerHeight / 2) {
        return i
      } else if (res === -1 && rect.bottom > 0) {
        res = i
      }
    }
  }
  return res
}


export class Path {
  static parentPathOf(p: string) {
    const res = p.endsWith('/') ? p.slice(0, -1) : p
    const lastSlashIndex = res.lastIndexOf('/')
    return lastSlashIndex === -1 ? '' : res.slice(0, lastSlashIndex + 1)
  }

  static readonly stemReg = /([^/]+)\/*$/
  static stem(p: string) {
    const res = p.match(Path.stemReg)
    return res && res.length > 1 ? res[1] : p
  }


  static parseAdressBar(): AdressBarKeys {
    let path = document.location.pathname
    if (path.startsWith('/')) path = path.slice(1)
    const values = path.split('/')
    return {
      langCode: values.length > 0 ? values[0] : '',
      vocName: values.length > 1 ? values[1] : '',
      noteId: values.length > 2 ? Number(values[2]) : -1
    }
  }
}

interface AdressBarKeys {
  langCode: string
  vocName: string
  noteId: number
}