<template>
  <div class="page">

    <h2>Enabled Features</h2>
    <div class="control-block">
      <div class="toggle-title">
        <span class="toggle-icon">🔄</span>
        <b class="toggle-name">Reset features</b>
      </div>
      <p class="toggle-description">Reset the list of features to the defaults</p>
      <button @click="resetFeatures">Reset</button>
    </div>

    <p>Enable and disable features:</p>
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

    <h2>Settings</h2>
    <div v-if="toggles?.moveFiles?.enabled" class="control-block">
      <div class="toggle-title">
        <span class="toggle-icon">🚀</span>
        <b class="toggle-name">Tag actions</b>
      </div>
      <p class="toggle-description">Reset the list of features to the defaults</p>
      <input v-model="settings" placeholder="Move files to..." />
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
      toggles: {},
      settings: {}
    }
  },
  mounted() {
    this.initializeToggles()
  },
  computed: {
    FeatureToggle() {
      return FeatureToggle
    }
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
    resetFeatures() {
      FeatureToggle.reset()
      this.toggles = FeatureToggle.getAllToggles()
    }
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