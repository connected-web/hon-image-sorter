
<template>
  <div class="app-boundary">
    <div v-if="FeatureToggle.isEnabled('filterImagesByText') || FeatureToggle.isEnabled('filterImagesByTag')" class="control-block">
      <label class="filter">Filter</label>
      <div v-if="FeatureToggle.isEnabled('filterImagesByText')" class="search-filter button row">
        <input v-model="textFilter" placeholder="🔍 Type to filter..." /><button v-if="textFilter" @click="textFilter = ''">🧽 Clear</button>
      </div>
      <div v-if="FeatureToggle.isEnabled('tagImages') && FeatureToggle.isEnabled('filterImagesByTag')" class="button row nowrap">
        <button v-for="tag in imageTags" :key="tag" @click="filterBasedOnTag(tag)"
          :class="selectedClass(tag, currentTagFilter)">{{ tag || '🧽' }} {{ tag ? filterableImages(tag, tags) : '' }}</button>
      </div>
    </div>

    <div class="control-block">
      <label>Current Folder:</label>
      <label>{{ folderPath }} ({{ imagesInFolder.length }}) ({{ (pageSize - imagesInFolder.length % pageSize) }} missing)</label>
    </div>

    <div v-if="FeatureToggle.isEnabled('pagination')" class="control-block center">
      <div class="button row pages">
        <button :disabled="!previousPageAvailable" @click="changePage(currentPage - 1)">⬅️</button>
        <button v-for="page in pages" :key="`select_page_${page}`" @click="changePage(page)"
          :class="selectedClass(page, pageNum)">{{ page }}</button>
        <button :disabled="!nextPageAvailable" @click="changePage(currentPage + 1)">➡️</button>
      </div>
    </div>

    <div class="image-browser">
      <div v-for="image in imagesInView" :key="image" class="image-container">
        <div v-if="image" class="image-with-buttons">
          <img :src="image" :alt="image" />
          <div v-if="FeatureToggle.isEnabled('tagImages')" class="bottom-half">
            <div class="image-actions">
              <button @click="markImageForRemoval(image)">{{ imageTags.remove }}</button>
              <button @click="markImageAsUnsure(image)">{{ imageTags.unsure }}</button>
              <button @click="markImageToKeep(image)">{{ imageTags.keep }}</button>
              <button @click="clearMark(image)">{{ imageTags.none || '🧽' }}</button>
            </div>
          </div>
          <div class="image-tag">{{ tagFor(image) }}</div>
          <div v-if="FeatureToggle.isEnabled('showFilePath')" class="caption">{{ captionFor(image) }}</div>
        </div>
        <div v-else class="no-image">
          🖼
        </div>
      </div>
    </div>

    <div v-if="loadingImages" class="control-block center">
      <LoadingSpinner>Loading images for <code>{{ folderPath }}</code>...</LoadingSpinner>
    </div>
    <p class="warning" style="text-align: center;" v-else-if="imagesInView.length === 0">⚠️ No images found matching filters in {{ folderPath }}</p>

    <div v-if="FeatureToggle.isEnabled('pagination')" class="bottom-bar">
      <div class="control-block center">
        <div class="button row pages">
          <button :disabled="!previousPageAvailable" @click="changePage(currentPage - 1)">⬅️</button>
          <button v-for="page in pages" :key="`select_page_${page}`" @click="changePage(page)"
            :class="selectedClass(page, pageNum)">{{ page }}</button>
          <button :disabled="!nextPageAvailable" @click="changePage(currentPage + 1)">➡️</button>
        </div>
      </div>
    </div>

    <div v-if="availableActions.length > 0" class="bottom-bar">
      <div class="control-block center">
        <span class="hidden">spacer</span>
      </div>
    </div>

    <div v-if="availableActions.length > 0" class="floating-bar">
      <div class="control-block">
        <label>Tagged images</label>
        <div v-if="processingAction">
          <LoadingSpinner>Processing action...</LoadingSpinner>
        </div>
        <div v-else-if="displayConfirmation" class="confirm-action">
          <label>Are you sure you want to <kbd>{{ displayConfirmation.icon }} {{ displayConfirmation.action?.type }}</kbd> {{ displayConfirmation.files.length }} files?</label>
          <button @click="activateAction(displayConfirmation)">Yes</button>
          <button @click="cancelAtConfirmation">Cancel</button>
        </div>
        <div v-else class="button row actions">
          <button v-for="action in availableActions" :key="`action_${action.id}`" @click="confirmAction(action)">{{
            action.icon }} ({{ action?.files?.length }})</button>
        </div>
      </div>
    </div>
  </div>
</template>
  
<script>
import HonClient from '../clients/HonClient.ts'
import TaggedImageStorage from '../models/TaggedImageStorage.ts'
import FeatureToggle from '../models/FeatureToggles'
import ImageTags from '../models/ImageTags.ts'
import ActionProcessor from '../models/ActionProcessor.ts'

import LoadingSpinner from '../components/LoadingSpinner.vue'

const location = window.location
const serverPort = 8901
const serverUrl = location.protocol + '//' + location.hostname + ':' + serverPort

export default {
  components: { LoadingSpinner },
  props: {
    folderPath: {
      type: String,
      default: null
    },
    filter: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      loadingImages: false,
      localFilePath: '',
      images: [],
      folders: [],
      serverUrl,
      honClient: new HonClient(serverUrl),
      currentPage: this.$route.query.page ? Number.parseInt(this.$route.query.page) : 1,
      pageSize: 40,
      tags: {},
      currentTagFilter: '',
      textFilter: this.$route.query.textFilter ?? '',
      FeatureToggle,
      displayConfirmation: null,
      processingAction: false
    }
  },
  async mounted() {
    this.reloadImageData()
    this.tags = TaggedImageStorage.getAll()
    this.features = FeatureToggle.getAllToggles()
  },
  computed: {
    actionProcessor() {
      return new ActionProcessor()
    },
    imageTags() {
      return ImageTags.getTags()
    },
    pageNum() {
      const { filteredImages, pageSize, currentPage } = this
      const maxPage = Math.ceil(filteredImages.length / pageSize)
      return Math.min(maxPage, currentPage)
    },
    imagesInFolder() {
      const { images, folderPath, currentTagFilter } = this
      return images.filter(imagepath => imagepath.includes(folderPath) && !imagepath.replace(`${serverUrl}/${folderPath}`, '').includes('/'))
    },
    filteredImages() {
      const { images, folderPath, currentTagFilter, textFilter, tags } = this

      if (!folderPath) {
        return images
      }
      let filteredImages = images
        .filter(imagepath => imagepath.includes(folderPath) && !imagepath.replace(`${serverUrl}/${folderPath}`, '').includes('/'))

      if (currentTagFilter) {
        filteredImages = filteredImages.filter(imagepath => {
          const tag = tags[imagepath]
          return tag === currentTagFilter
        })
      }

      if (textFilter) {
        filteredImages = filteredImages.filter(imagepath => {
          return imagepath?.toLowerCase()?.includes(textFilter?.toLowerCase())
        })
      }

      return filteredImages
    },
    imagesInView() {
      const { filteredImages, pageSize, pageNum } = this

      if (FeatureToggle.isEnabled('pagination')) {
        const page = []
        let i = 0
        while (i < pageSize) {
          const image = filteredImages[((pageNum - 1) * pageSize) + i]
          if (image) {
            page.push(image)
          }
          i++
        }
        return page.filter(n => n)
      } else {
        return filteredImages
      }
    },
    pages() {
      const { filteredImages, pageSize } = this
      return Math.ceil(filteredImages.length / pageSize)
    },
    availableActions() {
      const { filteredImages, imageTags, tags } = this
      return Object.keys(imageTags).map(tagName => {
        const icon = imageTags[tagName]
        const action = ImageTags.getActionByName(tagName)
        return {
          id: tagName,
          action,
          icon,
          files: Object.entries(tags).filter(([image, tag]) => tag === icon && filteredImages.includes(image)).map(([image, tag]) => image)
        }
      }).filter(action => action.files?.length > 0)
    },
    nextPageAvailable() {
      const { currentPage, pages } = this
      return currentPage < pages
    },
    previousPageAvailable() {
      const { currentPage } = this
      return currentPage > 1
    }
  },
  methods: {
    async confirmAction(action) {
      console.log('Activating', action)
      this.filterBasedOnTag(action.icon)
      this.displayConfirmation = action
    },
    cancelAtConfirmation() {
      this.displayConfirmation = null
      this.currentTagFilter = ''
    },
    async activateAction(action) {
      const { displayConfirmation } = this
      this.processingAction = true
      const actionResult = await this.actionProcessor.processFiles(displayConfirmation.files, displayConfirmation?.action)
      this.tags = TaggedImageStorage.getAll()
      this.images = (actionResult?.images ?? []).map(imagePath => `${serverUrl}${imagePath}`).sort((a, b) => {
        return a.localeCompare(b, 'en', { numeric: true })
      })
      this.processingAction = false
      this.cancelAtConfirmation()
    },
    async reloadImageData() {
      this.loadingImages = true
      const fileDetails = await this.honClient.listFilesInFolder(this.folderPath)
      this.localFilePath = fileDetails?.sourcePath
      this.images = (fileDetails?.images ?? []).map(imagePath => `${serverUrl}${imagePath}`).sort((a, b) => {
        return a.localeCompare(b, 'en', { numeric: true })
      })
      this.folders = (fileDetails?.folders ?? [])
      this.loadingImages = false
    },
    changePage(newPage) {
      const { pages } = this
      const limit = Math.min(Math.max(1, newPage ?? 1), pages)
      this.currentPage = limit
      this.$forceUpdate()
    },
    selectedClass(value, currentValue) {
      return (value === currentValue) ? 'selected' : ''
    },
    markImageForRemoval(image) {
      const { imageTags } = this
      this.markImageTag(image, imageTags.remove)
    },
    markImageAsUnsure(image) {
      const { imageTags } = this
      this.markImageTag(image, imageTags.unsure)
    },
    markImageToKeep(image) {
      const { imageTags } = this
      this.markImageTag(image, imageTags.keep)
    },
    markImageTag(image, tag) {
      if (this.tags[image] !== tag) {
        TaggedImageStorage.addTaggedImage(image, tag)
      } else {
        TaggedImageStorage.removeTaggedImage(image)
      }
      this.tags = TaggedImageStorage.getAll()
    },
    clearMark(image) {
      TaggedImageStorage.removeTaggedImage(image)
      this.tags = TaggedImageStorage.getAll()
    },
    tagFor(image) {
      const { imageTags } = this
      return this.tags[image] ?? imageTags.none
    },
    captionFor(image) {
      return (image + '').replace(serverUrl, '')
    },
    filesInFolder(folder) {
      const { images } = this
      return images.filter(imagepath => imagepath.includes(folder) && !imagepath.replace(`${serverUrl}${folder}`, '').includes('/')).length
    },
    filterBasedOnTag(tag) {
      this.currentTagFilter = tag
      this.$forceUpdate()
    },
    filterableImages(tag, tags) {
      const { folderPath } = this
      return Object.entries(tags).filter(([key, item]) => item === tag && key.includes(folderPath))?.length
    }
  },
  watch: {
    textFilter(newVal) {
      this.$router.replace({ query: { ...this.$route.query, textFilter: newVal }})
    },
    currentPage(newVal) {
      this.$router.replace({ query: { ...this.$route.query, page: newVal }})
    }
  }
}
</script>
  
<style scoped>
.app-boundary {
  display: relative;
  width: 100%;
  overflow-x: hidden;
}

.title-bar {
  padding: 0 1em;
  background: #111;
  color: white;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 4em;
}

.title-bar h1 {
  font-size: 1.5em;
  font-weight: bold;
  margin: 0;
  padding: 0 0.5em;
}

.title-bar p {
  font-size: 1.0em;
  margin: 0;
  padding: 0 0.5em;
}

.search-filter input {
  padding: 0.5em;
}

.image-browser {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
  gap: 0;
}

.image-container {
  position: relative;
  display: flex;
  place-content: center;
  background: #333;
  font-size: 0;
  width: 25%;
  overflow: hidden;
}

.no-image {
  display: flex;
  width: 100%;
  height: 100%;
  place-content: center;
  flex-direction: column;
  outline: 2px solid #111;
  outline-offset: -2px;
}

.image-with-buttons {
  width: 100%;
  height: 100%;
}

.image-container img {
  width: 100%;
}

.confirm-action {
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
}

@media screen and (max-width: 1024px) {
  .image-container {
    width: 50%;
  }
}

@media screen and (max-width: 768px) {
  .image-container {
    width: 100%;
  }
  label.filter {
    display: none;
  }
  .search-filter {
    display: flex;
  }
  .search-filter input {
    flex: 1 1;
    margin: 0.5em 0;
    padding: 12px;
  }

}

.image-tag {
  position: absolute;
  top: 0;
  right: 0;
  font-size: 40px;
}

.caption {
  display: none;
  position: absolute;
  top: 0;
  right: 0;
  font-size: 20px;
  background: rgba(0,0,0,0.4);
  padding: 2px 10px;
  white-space: nowrap;
  overflow: hidden;
  text-align: right;
}

.image-container:hover .caption {
  display: inline-block;
}

.bottom-half {
  position: absolute;
  width: 100%;
  height: 50%;
  top: 50%;
  overflow: hidden;
}

.image-actions {
  position: absolute;
  bottom: 0;
  display: flex;
  width: 100%;
  flex-direction: row;
  justify-content: space-evenly;
  background: rgba(0, 0, 0, 0.2);
  padding: 0.5em 0;
  opacity: 0;
  transition: opacity 100ms ease-in-out;
  font-size: 30px;
}

.bottom-half:hover .image-actions {
  opacity: 1.0;
  transition: opacity 200ms ease-in-out;
}

.scroll-footer {
  display: block;
  margin-bottom: 6em;
}

.bottom-bar {
  width: inherit;
}

.floating-bar {
  position: fixed;
  width: 100%;
  bottom: 0;
  right: 0;
}

kbd {
  padding: 5px;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 5px;
  font-size: 16px;
}
</style>
  