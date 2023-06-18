
<template>
    <div :class="[currentMode.class, 'app-boundary'].join(' ')">
        <div class="control-block">
            <label>Folders</label>
            <button @click="reloadImageData">Reload</button>
        </div>
        
        <div class="folder-list">
            <router-link :to="folder" v-for="folder in folders" :key="folder" @click="changeFolder(folder)" class="folder-item">
                <label>{{ folder }}</label>
                <label>({{ filesInFolder(folder) }})</label>
            </router-link>
        </div>
    </div>
</template>
  
<script>
import HonClient from '../clients/honClient.js'

const location = window.location
const serverPort = 8901
const serverUrl = location.protocol + '//' + location.hostname + ':' + serverPort

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
        this.reloadImageData()
    },
    computed: {
        filteredImages() {
            const { images, currentFolder, currentTagFilter, textFilter, tags } = this

            if (!currentFolder) {
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
        async reloadImageData() {
            const fileDetails = await this.honClient.listFiles()
            this.localFilePath = fileDetails?.sourcePath
            this.images = (fileDetails?.images ?? []).map(imagePath => `${serverUrl}${imagePath}`).sort((a, b) => {
                return a.localeCompare(b, 'en', { numeric: true })
            })
            this.folders = (fileDetails?.folders ?? [])
            this.currentFolder = this.folders[0]
        },
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

.folder-list {
    display: flex;
    flex-direction: column;
}

.folder-item {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 5px 10px;
}
.folder-item:hover {
    background: #111;
}

.folder-item * {
    cursor: pointer;
}

</style>
  