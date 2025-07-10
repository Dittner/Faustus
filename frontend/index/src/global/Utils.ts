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
