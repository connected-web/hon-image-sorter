<template>
  <div class="page">
    <h2>Feature Toggles</h2>
    <div v-for="(toggle, toggleName) in toggles" :key="toggleName">
      <div class="control-block">
        <div>
          <span class="toggle-icon">{{ toggle.icon }}</span>
          <b class="toggle-name">{{ toggle.name }}</b>
        </div>
        <p class="toggle-description">{{ toggle.description }}</p>
        <ToggleButton @click.native="toggleFeature(toggleName)" :value="toggle" />
      </div>
    </div>
  </div>
</template>
  
<script>
import FeatureToggle from '../models/FeatureToggles.ts'
import ToggleButton from '../components/ToggleButton.vue'

export default {
  components: { ToggleButton },
  data() {
    return {
      toggles: {}
    }
  },
  mounted() {
    this.initializeToggles()
  },
  methods: {
    initializeToggles() {
      // Initialize the toggles using FeatureToggle class
      FeatureToggle.initializeToggles({
        newFeature: {
          enabled: true,
          name: 'New Feature',
          icon: '🚀',
          description: 'This is a new feature for users to enjoy.',
        },
        anotherFeature: {
          enabled: false,
          name: 'Another Feature',
          icon: '🎉',
          description: 'Try out this exciting feature!',
        },
      })

      this.toggles = FeatureToggle.getAllToggles()
    },
    toggleFeature(featureName) {
      // Toggle the feature using FeatureToggle class
      if (this.toggles.hasOwnProperty(featureName)) {
        if (this.toggles[featureName].enabled) {
          FeatureToggle.disableFeature(featureName)
        } else {
          FeatureToggle.enableFeature(featureName)
        }
        this.toggles[featureName].enabled = !this.toggles[featureName].enabled
      }
    },
  },
}
</script>

<style scoped>
.control-block {
  gap: 10px;
  margin: 5px 0;
}

.page {
  padding: 1em 2em;
}

.toggle-icon {
  margin: 0 10px;
}

.toggle-description {
  flex: 1 1;
  text-align: right;
}
</style>