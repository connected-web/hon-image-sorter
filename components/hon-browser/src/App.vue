<template>
  <div :class="[currentMode.class, 'app-boundary'].join(' ')">
    <div class="title-bar">
      <h1>HON Image Sorter</h1>
      <p>Server is configured to read from: {{ localFilePath }}</p>
    </div>

    <div class="control-block">
      <label>Folders</label>
      <div class="button row">
        <button v-for="folder in folders" :key="folder" @click="changeFolder(folder)" :class="selectedClass(folder, currentFolder)">{{ folder }} ({{ filesInFolder(folder) }})</button>
      </div>
    </div>

    <div class="control-block">
      <div class="control-block">
        <label>Filter</label>
        <div class="search-filter">
          <input v-model="textFilter" placeholder="🔍 Type to filter..." />
        </div>
        <div class="button row">
          <button v-for="tag in imageTags" :key="tag" @click="filterBasedOnTag(tag)" :class="selectedClass(tag, currentTagFilter)">{{ tag || '🧽' }}</button>
        </div>
      </div>
      <div class="control-block">
        <label>Image Size</label>
        <div class="button row">
          <button v-for="mode in modes" :key="mode.name" @click="changeMode(mode)" :class="selectedClass(mode, currentMode)">{{ mode.name }}</button>
        </div>
      </div>
    </div>

    <div class="control-block center">
      <div class="button row pages">
        <button :disabled="!previousPageAvailable" @click="changePage(currentPage - 1)">⬅️</button>
        <button v-for="page in pages" :key="`select_page_${page}`" @click="changePage(page)" :class="selectedClass(page, currentPage)">{{ page }}</button>
        <button :disabled="!nextPageAvailable" @click="changePage(currentPage + 1)">➡️</button>
      </div>
    </div>

    <div class="image-browser">
      <div v-for="image in imagesInView" :key="image" class="image-container">
        <div v-if="image" class="image-with-buttons">
          <img :src="image" :alt="image" />
          <div class="bottom-half">
            <div class="image-actions">
              <button @click="markImageForRemoval(image)">{{ imageTags.remove }}</button>
              <button @click="markImageAsUnsure(image)">{{ imageTags.unsure }}</button>
              <button @click="markImageToKeep(image)">{{ imageTags.keep }}</button>
            </div>
          </div>
          <div class="image-tag">{{ tagFor(image) }}</div>
        </div>
        <div v-else class="no-image">
          🖼
        </div>
      </div>
    </div>

    <pre v-if="imagesInView.length === 0"><code>No images found</code></pre>

    <div class="scroll-footer" />

    <div class="bottom-bar">
      <div class="control-block center">
        <div class="button row pages">
          <button :disabled="!previousPageAvailable" @click="changePage(currentPage - 1)">⬅️</button>
          <button v-for="page in pages" :key="`select_page_${page}`" @click="changePage(page)" :class="selectedClass(page, currentPage)">{{ page }}</button>
          <button :disabled="!nextPageAvailable" @click="changePage(currentPage + 1)">➡️</button>
        </div>
      </div>
      <div class="control-block">
        <label>Actions</label>
        <div class="button row">
          <button v-for="action in availableActions" :key="`action_${action.id}`" @click="activate(action)">{{ action.icon }} ({{ action?.files?.length }})</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import HonClient from './clients/honClient.js'

const serverUrl = 'http://localhost:8901'

const viewModes = [{
  name: '256px',
  class: 'mode-256'
}, {
  name: '512px',
  class: 'mode-512'
}, {
  name: '768px',
  class: 'mode-768'
}]

const imageTags = {
  keep: '✅',
  remove: '❌',
  unsure: '🚧',
  none: ''
}

export default {
  data() {
    return {
      localFilePath: '',
      images: [],
      folders: [],
      serverUrl,
      honClient: new HonClient(serverUrl),
      currentMode: viewModes[0],
      currentFolder: null,
      currentPage: 1,
      modes: viewModes,
      offset: 0,
      pageSize: 40,
      tags: {},
      imageTags,
      currentTagFilter: '',
      textFilter: ''
    }
  },
  async mounted() {
    const fileDetails = await this.honClient.listFiles()
    console.log('File details:', { fileDetails })
    this.localFilePath = fileDetails?.sourcePath
    this.images = (fileDetails?.images ?? []).map(imagePath => `${serverUrl}${imagePath}`).sort((a, b) => {
      return a.localeCompare(b, 'en', { numeric: true })
    })
    this.folders = (fileDetails?.folders ?? [])
    this.currentFolder = this.folders[0]
  },
  computed: {
    filteredImages() {
      const { images, currentFolder, currentTagFilter, textFilter, tags } = this

      if  (!currentFolder) {
        return images
      }
      let filteredImages = images
        .filter(imagepath => imagepath.includes(currentFolder) && !imagepath.replace(`${serverUrl}${currentFolder}`, '').includes('/'))

      if (currentTagFilter) {
        filteredImages = filteredImages.filter(imagepath => {
          const tag = tags[imagepath]
          return tag === currentTagFilter
        })
      }

      if (textFilter) {
        filteredImages = filteredImages.filter(imagepath => {
          return imagepath.includes(textFilter)
        })
      }

      return filteredImages
    },
    imagesInView() {
      const { filteredImages, offset, pageSize, currentPage } = this
      while (this.offset < 0) {
        this.offset += filteredImages.length
      }

      const page = []
      const practicalPageSize = Math.min(pageSize, filteredImages.length)
      while (page.length < practicalPageSize) {
        const image = filteredImages[((currentPage * pageSize) + offset + page.length) % filteredImages.length]
        page.push(image)
      }
      return page.filter(n => n)
    },
    pages() {
      const { filteredImages, pageSize } = this
      return Math.ceil(filteredImages.length / pageSize)
    },
    availableActions() {
      const { imagesInView, imageTags, tags } = this
      return Object.keys(imageTags).map(actionType => {
        const icon = imageTags[actionType]
        return {
          id: actionType,
          icon,
          files: Object.entries(tags).filter(([image, tag]) => tag === icon && imagesInView.includes(image))
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
    changeMode(newMode) {
      this.currentMode = newMode
    },
    changeFolder(newFolder) {
      this.currentFolder = newFolder
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
      this.tags[image] = imageTags.remove
    },
    markImageAsUnsure(image) {
      this.tags[image] = imageTags.unsure
    },
    markImageToKeep(image) {
      this.tags[image] = imageTags.keep
    },
    tagFor(image) {
      return this.tags[image] ?? imageTags.none
    },
    filesInFolder(folder) {
      const { images } = this
      return images.filter(imagepath => imagepath.includes(folder) && !imagepath.replace(`${serverUrl}${folder}`, '').includes('/')).length
    },
    filterBasedOnTag(tag) {
      this.currentTagFilter = tag
      this.$forceUpdate()
    }
  }
}
</script>

<style scoped>
.app-boundary {
  width: 100%;
  overflow-x: hidden;
}
.title-bar {
  margin: 0;
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

.control-block {
  flex: 1 1;
  margin: 0;
  background: #333;
  color: white;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0 0.5em;
  transition: background-color 200ms ease-in-out;
  min-height: 4em;
}
.control-block.center {
  justify-content: center;
}
.control-block:hover {
  background: #222;
  transition: background-color 200ms ease-in-out;
}
.control-block label {
  font-weight: bold;
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
  font-size: 15px;
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

.mode-256 .image-container,
.mode-256 .image-container img {
  max-width: 256px;
  max-height: 256px;
  font-size: 1.0em;
}
.mode-256 .no-image {
  min-width: 256px;
  min-height: 256px;
}
.mode-512 .image-container,
.mode-512 .image-container img {
  max-width: 512px;
  max-height: 512px;
  font-size: 1.2em;
}
.mode-512 .no-image {
  min-width: 512px;
  min-height: 512px;
}
.mode-768 .image-container,
.mode-768 .image-container img {
  max-width: 768px;
  max-height: 768px;
  font-size: 1.5em;
}
.mode-768 .no-image {
  min-width: 768px;
  min-height: 768px;
}
.image-with-buttons {
  width: 100%;
  height: 100%;
}

.image-container > img {
  width: 100%;
}

.image-tag {
  position: absolute;
  top: 0;
  right: 0;
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
}

.bottom-half:hover .image-actions {
  opacity: 1.0;
  transition: opacity 200ms ease-in-out;
}
button.selected {
  background: cornflowerblue;
}
.button.row {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  margin: 0.5em 0;
}
button {
  padding: 0.5em;
  background: #ddd;
  border: none;
  transition: background-color 200ms ease-in-out;
}
button:hover {
  background: #fff;
  border: none;
  transition: background-color 200ms ease-in-out;
}
button:active {
  background: #999;
  border: none;
  transition: background-color 200ms ease-in-out;
}
button:disabled, button.disabled {
  cursor: default;
  background: #ccc;
}

.scroll-footer {
  display: block;
  margin-bottom: 6em;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  width: 100%;
}
</style>
