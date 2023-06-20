export interface ActionType {
  type: 'move' | 'delete' | ''
  to: string
}

export interface ActionMap {
  [key: string]: ActionType
}

export class ImageTags {
  private static readonly STORAGE_KEY = 'imageTags'  

  private static readonly tags = {
    keep: '✅',
    remove: '❌',
    unsure: '🚧',
    none: ''
  }  

  private static readonly actions: ActionMap = {
    keep: {
      type: 'move',
      to: './keep'
    },
    remove: {
      type: 'delete',
      to: ''
    },
    unsure: {
      type: 'move',
      to: './review'
    },
    none: {
      type: '',
      to: ''
    }
  }

  static getTags(): { [key: string]: string } {
    const storedTags = localStorage.getItem(ImageTags.STORAGE_KEY)  
    if (storedTags) {
      return JSON.parse(storedTags)  
    }
    return {}  
  }

  static setTag(key: string, value: string): void {
    const tags = ImageTags.getTags()  
    tags[key] = value  
    localStorage.setItem(ImageTags.STORAGE_KEY, JSON.stringify(tags))  
  }

  static removeTag(key: string): void {
    const tags = ImageTags.getTags()  
    delete tags[key]  
    localStorage.setItem(ImageTags.STORAGE_KEY, JSON.stringify(tags))  
  }

  static getActions(): ActionMap {
    return { ...ImageTags.actions }  
  }

  static getTagByEmoji(emoji: string): string | undefined {
    const tags = ImageTags.getTags()  
    const tagKey = Object.keys(tags).find((key) => tags[key] === emoji)  
    return tagKey ? ImageTags.tags[tagKey] : undefined  
  }

  static getActionByEmoji(emoji: string): ActionType | undefined {
    const actions = ImageTags.getActions()  
    const actionKey = Object.keys(actions).find((key) => actions[key].type === emoji)  
    return actionKey ? ImageTags.actions[actionKey] : undefined  
  }
}
