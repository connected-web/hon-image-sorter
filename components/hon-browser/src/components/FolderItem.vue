<template>
  <div class="folder-tree">
    <router-link :to="`${folder.fullPath}/`" class="folder-item">
      <label>/{{ folder.path }}/</label>
      <label>({{ folder?.fileCount ?? 0 }})</label>
    </router-link>
    <div class="folder-children">
      <folder-item v-for="subFolder in folder?.folders ?? []" :key="subFolder.fullPath" :folder="subFolder" :level="level + 1" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'FolderItem',
  props: {
    folder: {
      type: Object,
      required: true
    },
    level: {
      type: Number,
      default: 0
    }
  },
  methods: {
    filesInFolder(folder) {
      // Implement your logic to count files in a folder here
      return []
    }
  }
};
</script>

<style scoped>
.folder-item {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 5px 10px;
  font-size: 1.2em;
}
.folder-item:hover {
  background: #111;
}

.folder-item * {
  cursor: pointer;
}
.folder-children {
  margin-left: 1em;
}
</style>