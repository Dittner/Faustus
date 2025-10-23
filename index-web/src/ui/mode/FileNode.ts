export class FileNode {
  id = ''
  path = ''
  alias = ''
  isDir = true
  isDamaged = false

  deserialize(data: any) {
    try {
      //console.log('FileNode: ' + data?.path)
      if (data.path && data.id && data.is_dir !== undefined) {
        this.path = data.path
        this.id = data.id
        this.isDir = data.is_dir
        this.isDamaged = false
      } else {
        console.log('File:deserialize, file is damaged, data:', data)
        this.isDamaged = true
      }
    } catch (e: any) {
      this.isDamaged = true
      console.log('FileNode:deserialize, err:', e.message, 'data:', data)
    }
  }
}