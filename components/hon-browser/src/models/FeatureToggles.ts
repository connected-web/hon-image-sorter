import isString from '@/lang/isString'

export interface FeatureToggleConfig {
  enabled: boolean
  name: string
  icon: string
  description: string
}

export interface FeatureToggles {
  [key: string]: FeatureToggleConfig
}

class FeatureToggle {
  private readonly storageKey = 'featureToggles'
  private static instance: FeatureToggle | null = null

  private readonly defaultFeatures: FeatureToggles = {}

  private constructor () {}

  static getInstance (): FeatureToggle {
    if (FeatureToggle.instance == null) {
      FeatureToggle.instance = new FeatureToggle()
    }
    return FeatureToggle.instance
  }

  initializeToggles (config: FeatureToggles): void {
    const toggles = this.getAllToggles()
    for (const key in config) {
      toggles[key] = {
        enabled: toggles[key]?.enabled ?? config[key]?.enabled ?? false,
        name: config[key]?.name ?? 'Unnamed',
        icon: config[key]?.icon ?? '💀',
        description: config[key]?.description ?? 'No description'
      }
    }
    this.saveToggles(toggles)
  }

  isEnabled (featureName: string): boolean {
    const toggles = this.getAllToggles()
    return toggles[featureName]?.enabled
  }

  enableFeature (featureName: string): void {
    const toggles = this.getAllToggles()
    toggles[featureName].enabled = true
    this.saveToggles(toggles)
  }

  disableFeature (featureName: string): void {
    const toggles = this.getAllToggles()
    toggles[featureName].enabled = false
    this.saveToggles(toggles)
  }

  getToggleInfo (featureName: string): FeatureToggleConfig | null {
    const toggles = this.getAllToggles()
    const toggle = toggles[featureName]
    return toggle
  }

  getAllToggles (): FeatureToggles {
    const storedData = localStorage.getItem(this.storageKey)
    if (isString(storedData)) {
      try {
        return JSON.parse(storedData)
      } catch (error) {
        console.error('Error parsing stored feature toggles:', error)
      }
    }
    return {}
  }

  reset (): void {
    localStorage.removeItem(this.storageKey)
    this.initializeToggles(this.defaultFeatures)
  }

  private saveToggles (toggles: FeatureToggles): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(toggles))
    } catch (error) {
      console.error('Error saving feature toggles to localStorage:', error)
    }
  }
}

const featureToggleInstance = FeatureToggle.getInstance()
export default featureToggleInstance
