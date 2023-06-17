<template>
  <div class="page">
    <h2>Settings</h2>
    <p>The following features of the app can be configured...</p>
    <div v-for="(toggle, toggleName) in toggles" :key="toggleName">
      <div class="control-block">
        <div class="toggle-title">
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

@media only screen and (max-width: 1080px) {
  .control-block {
    flex-direction: column;
    flex-wrap: wrap;
    padding: 10px;
  }

  .toggle-title {
    font-size: 1.2em;
  }

  .toggle-description {
    margin: 0;
    flex: 10 10;
    text-align: center;
  }
}
</style>