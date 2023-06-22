import isString from '@/lang/isString'

class TaggedImageStorage {
  private readonly storageKey = 'taggedImages'
  private static instance: TaggedImageStorage | null = null

  private constructor () {}

  static getInstance (): TaggedImageStorage {
    if (TaggedImageStorage.instance == null) {
      TaggedImageStorage.instance = new TaggedImageStorage()
    }
    return TaggedImageStorage.instance
  }

  getAll (): { [key: string]: string } {
    const storedData = localStorage.getItem(this.storageKey)
    if (isString(storedData)) {
      try {
        return JSON.parse(storedData)
      } catch (error) {
        console.error('Error parsing stored tagged images:', error)
      }
    }
    return {}
  }

  addTaggedImage (imagePath: string, tag: string): void {
    const taggedImages = this.getAll()
    taggedImages[imagePath] = tag
    this.save(taggedImages)
  }

  removeTaggedImage (imagePath: string): void {
    const taggedImages = this.getAll()
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete taggedImages[imagePath]
    this.save(taggedImages)
  }

  clearAllTags (): void {
    this.save({})
  }

  private save (data: { [key: string]: string }): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data))
    } catch (error) {
      console.error('Error saving tagged images to localStorage:', error)
    }
  }
}

const taggedImageStorageInstance = TaggedImageStorage.getInstance()
export default taggedImageStorageInstance
