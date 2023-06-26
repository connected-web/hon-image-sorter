import isString from '@/lang/isString'

export interface ActionType {
  type: 'move' | 'delete' | ''
  to: string
}

export interface ActionMap {
  [key: string]: ActionType
}

type TagKey = 'keep' | 'remove' | 'unsure' | 'none'

class ImageTags {
  private readonly STORAGE_KEY = 'imageTags'
  private static instance: ImageTags | null = null

  private readonly tags: { [key in TagKey]: string } = {
    keep: '✅',
    unsure: '🚧',
    remove: '❌',
    none: ''
  }

  private readonly actions: ActionMap = {
    keep: {
      type: 'move',
      to: './keep'
    },
    unsure: {
      type: 'move',
      to: './review'
    },
    remove: {
      type: 'delete',
      to: ''
    },
    none: {
      type: '',
      to: ''
    }
  }

  private constructor () {}

  static getInstance (): ImageTags {
    if (ImageTags.instance == null) {
      ImageTags.instance = new ImageTags()
    }
    return ImageTags.instance
  }

  getTags (): { [key in TagKey]: string } {
    const storedTags = localStorage.getItem(this.STORAGE_KEY)
    if (isString(storedTags)) {
      return JSON.parse(storedTags)
    }
    return this.tags
  }

  setTag (key: TagKey, value: string): void {
    const tags = this.getTags()
    tags[key] = value
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tags))
  }

  removeTag (key: TagKey): void {
    const tags = this.getTags()
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete tags[key]
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tags))
  }

  getActions (): ActionMap {
    return { ...this.actions }
  }

  getTagByEmoji (emoji: string): string | undefined {
    const tags = this.getTags()
    const tagKey: TagKey = Object.keys(tags).find((key) => tags[key as TagKey] === emoji) as TagKey ?? 'none'
    return isString(tagKey) ? this.tags[tagKey] : undefined
  }

  getActionByName (name: TagKey): ActionType | undefined {
    const actions = this.getActions()
    return actions[name]
  }

  getActionByEmoji (emoji: string): ActionType | undefined {
    const tags = this.getTags()
    const tagKey: TagKey = Object.keys(tags).find((key) => tags[key as TagKey] === emoji) as TagKey ?? 'none'
    const actions = this.getActions()
    return isString(tagKey) ? actions[tagKey] : undefined
  }
}

const imageTagsInstance = ImageTags.getInstance()
export default imageTagsInstance
