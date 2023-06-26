<template>
  <div class="page">
    <h2>Configure Actions</h2>
    
    <div v-if="FeatureToggle.isEnabled('tagImages') && FeatureToggle.isEnabled('filterImagesByTag')">
      <div v-for="(action, key) in actions" :key="key" class="control-block">
        <button>{{ tags[key] || '🧽' }}</button>
        <div v-if="action.type === 'move'" class="action-description row">
          <label>Move files to</label>
          <input placeholder="./relative-path" v-model="action.to" />
        </div>
        <div v-if="action.type === 'delete'" class="action-description row">
          <label>Delete Files</label>
        </div>
      </div>
    </div>
  </div>
</template>
  
<script>
import FeatureToggle from '../models/FeatureToggles.ts'
import ImageTags from '../models/ImageTags.ts'
import ActionProcessor from '../models/ActionProcessor.ts'

import ToggleButton from '../components/ToggleButton.vue'

export default {
  components: { ToggleButton },
  data() {
    return {
      toggles: {},
      settings: {},
      actions: ImageTags.getActions(),
      tags: ImageTags.getTags()
    }
  },
  mounted() {
    this.initializeToggles()
  },
  computed: {
    imageTags() {
      return ImageTags.getTags()
    },
    FeatureToggle() {
      return FeatureToggle
    }
  },
  methods: {
    actionFor(tag) {
      return ImageTags.getActionByEmoji(tag) ?? { tag }
    },
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
    },
    selectedClass(value, currentValue) {
      return (value === currentValue) ? 'selected' : ''
    }
  }
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

.action-description {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  flex: 1 1;
  text-align: right;
  gap: 10px;
}

input {
  padding: 8px;
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

  .action-description {
    margin: 0;
    flex: 10 10;
    text-align: center;
  }
}
</style>