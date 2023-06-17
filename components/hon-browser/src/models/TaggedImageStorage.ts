export default class TaggedImageStorage {
  private static storageKey = 'taggedImages'

  static getAll(): { [key: string]: string } {
    const storedData = localStorage.getItem(TaggedImageStorage.storageKey)
    if (storedData) {
      try {
        return JSON.parse(storedData)
      } catch (error) {
        console.error('Error parsing stored tagged images:', error)
      }
    }
    return {}
  }

  static addTaggedImage(imagePath: string, tag: string): void {
    const taggedImages = TaggedImageStorage.getAll()
    taggedImages[imagePath] = tag
    TaggedImageStorage.save(taggedImages)
  }

  static removeTaggedImage(imagePath: string): void {
    const taggedImages = TaggedImageStorage.getAll()
    delete taggedImages[imagePath]
    TaggedImageStorage.save(taggedImages)
  }

  static clearAllTags(): void {
    const taggedImages = TaggedImageStorage.getAll()
    for (const imagePath in taggedImages) {
      delete taggedImages[imagePath]
    }
    TaggedImageStorage.save(taggedImages)
  }

  private static save(data: { [key: string]: string }): void {
    try {
      localStorage.setItem(TaggedImageStorage.storageKey, JSON.stringify(data))
    } catch (error) {
      console.error('Error saving tagged images to localStorage:', error)
    }
  }
}