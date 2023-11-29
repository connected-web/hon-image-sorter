
<template>
  <div :class="['app-boundary'].join(' ')">
    <div class="control-block">
      <label>Folders</label>
      <button @click="reloadImageData">Reload</button>
    </div>
    
    <div class="folder-list">
      <div v-for="folder in folderTree" :key="folder.fullPath">
        <FolderItem :folder="folder" />
        <pre v-if="false"><code>{{ folder }}</code></pre>
      </div>
    </div>
  </div>
</template>
  
<script>
import HonClient from '../clients/HonClient.ts'
import FolderItem from '../components/FolderItem.vue'
import FeatureToggle from '../models/FeatureToggles.ts'

const honClient = new HonClient()

const imageTags = {
  keep: '✅',
  remove: '❌',
  unsure: '🚧',
  none: ''
}

export default {
  components: { FolderItem },
  data() {
    return {
      localFilePath: '',
      folders: [],
      serverUrl: honClient.serverUrl,
      honClient
    }
  },
  async mounted() {
    this.reloadImageData()
  },
  computed: {
    folderTree() {
      const tree = this.buildFolderTree(this.folders)
      return tree?.folders?.[0]?.folders ?? []
    }
  },
  methods: {
    buildFolderTree(folders) {
      const folderTree = {}
      folders.forEach(folder => {
        const pathParts = folder.path.split('/').filter(part => part !== '')
        let currentFolder = folderTree
        pathParts.forEach(part => {
          if (!currentFolder.folders) {
            currentFolder.folders = []
          }
          let subfolder = currentFolder.folders.find(f => f.path === part)
          if (!subfolder) {
            const fullPath = currentFolder.fullPath ? `${currentFolder.fullPath}/${part}` : `/${part}`
            subfolder = { path: part, fullPath, folders: [], fileCount: folder.fileCount }
            currentFolder.folders.push(subfolder)
          }
          currentFolder = subfolder
        })
      })
      return folderTree
    },
    async reloadImageData() {
      const { serverUrl } = this
      const fileDetails = await this.honClient.listFiles()
      this.localFilePath = fileDetails?.sourcePath
      const folders = (fileDetails?.folders ?? [])
      this.folders = folders.sort((a, b) => {
        if (FeatureToggle.isEnabled('sortFoldersView')) {
          return b.path.localeCompare(a.path, 'en', { numeric: true })
        } else {
          return a.path.localeCompare(b.path, 'en', { numeric: true })
        }
      })
    }
  }
}
</script>
  
<style scoped>
.app-boundary {
  width: 100%;
  overflow-x: hidden;
}

.folder-list {
  display: flex;
  flex-direction: column;
}

</style>
  