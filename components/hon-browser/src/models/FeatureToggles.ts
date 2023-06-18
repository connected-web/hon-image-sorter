interface FeatureToggleConfig {
  enabled: boolean,
  name: string;
  icon: string;
  description: string;
}

type FeatureToggles = { [key: string]: FeatureToggleConfig }

export default class FeatureToggle {
  private static storageKey = 'featureToggles';

  public static defaultFeatures: FeatureToggles

  static initializeToggles(config: FeatureToggles): void {
    const toggles = FeatureToggle.getAllToggles();
    for (const key in config) {
      toggles[key] = {
        enabled: toggles[key]?.enabled ?? config[key]?.enabled ?? false,
        name: config[key]?.name ?? 'Unnamed',
        icon: config[key]?.icon ?? '💀',
        description: config[key]?.description ?? 'No description',
      };
    }
    FeatureToggle.saveToggles(toggles);
  }

  static isEnabled(featureName: string): boolean {
    const toggles = FeatureToggle.getAllToggles();
    return toggles[featureName]?.enabled === true;
  }

  static enableFeature(featureName: string): void {
    const toggles = FeatureToggle.getAllToggles();
    toggles[featureName].enabled = true;
    FeatureToggle.saveToggles(toggles);
  }

  static disableFeature(featureName: string): void {
    const toggles = FeatureToggle.getAllToggles();
    toggles[featureName].enabled = false;
    FeatureToggle.saveToggles(toggles);
  }

  static getToggleInfo(featureName: string): FeatureToggleConfig {
    const toggles = FeatureToggle.getAllToggles();
    return toggles[featureName] || null;
  }

  static getAllToggles(): FeatureToggles {
    const storedData = localStorage.getItem(FeatureToggle.storageKey);
    if (storedData) {
      try {
        return JSON.parse(storedData);
      } catch (error) {
        console.error('Error parsing stored feature toggles:', error);
      }
    }
    return {};
  }

  static reset() {
    localStorage.removeItem(this.storageKey)
    FeatureToggle.initializeToggles(FeatureToggle.defaultFeatures ?? {})
  }

  private static saveToggles(toggles: FeatureToggles): void {
    try {
      localStorage.setItem(FeatureToggle.storageKey, JSON.stringify(toggles));
    } catch (error) {
      console.error('Error saving feature toggles to localStorage:', error);
    }
  }
}