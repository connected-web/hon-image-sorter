import isString from '@/lang/isString'

class LocalStorage {
  private static instance: LocalStorage | null = null

  private constructor () {}

  static getInstance (): LocalStorage {
    if (LocalStorage.instance == null) {
      LocalStorage.instance = new LocalStorage()
    }
    return LocalStorage.instance
  }

  getItem (key: string): any {
    const item = localStorage.getItem(key)
    if (isString(item)) {
      try {
        return JSON.parse(item)
      } catch (error) {
        console.error(`Error parsing localStorage item: ${key}`, error)
        return null
      }
    }
    return null
  }

  setItem (key: string, value: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error setting localStorage item: ${key}`, error)
    }
  }

  removeItem (key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing localStorage item: ${key}`, error)
    }
  }
}

const localStorageInstance = LocalStorage.getInstance()
export default localStorageInstance
