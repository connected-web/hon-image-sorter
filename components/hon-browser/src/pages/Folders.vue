
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
      images: [],
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
      this.images = (fileDetails?.images ?? []).map(imagePath => `${serverUrl}${imagePath}`).sort((a, b) => {
        return a.localeCompare(b, 'en', { numeric: true })
      })
      const folders = (fileDetails?.folders ?? [])
      this.folders = folders
    },
    filesInFolder(folder) {
      const { images, serverUrl } = this
      return images.filter(imagepath => imagepath.includes(folder) && !imagepath.replace(`${serverUrl}${folder}/`, '').includes('/'))
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
  