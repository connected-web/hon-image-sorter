
<template>
    <div :class="[currentMode.class, 'app-boundary'].join(' ')">
        <div class="control-block">
            <div class="control-block">
                <label>Filter</label>
                <div class="search-filter">
                    <input v-model="textFilter" placeholder="🔍 Type to filter..." />
                </div>
                <div class="button row">
                    <button v-for="tag in imageTags" :key="tag" @click="filterBasedOnTag(tag)"
                        :class="selectedClass(tag, currentTagFilter)">{{ tag || '🧽' }}</button>
                </div>
            </div>
        </div>

        <div class="control-block center">
            <div class="button row pages">
                <button :disabled="!previousPageAvailable" @click="changePage(currentPage - 1)">⬅️</button>
                <button v-for="page in pages" :key="`select_page_${page}`" @click="changePage(page)"
                    :class="selectedClass(page, currentPage)">{{ page }}</button>
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
                    <div class="caption">{{ captionFor(image) }}</div>
                </div>
                <div v-else class="no-image">
                    🖼
                </div>
            </div>
        </div>

        <pre v-if="imagesInView.length === 0"><code>No images found in {{ folderPath }}, {{ filteredImages }}</code></pre>

        <div class="scroll-footer" />

        <div class="bottom-bar">
            <div class="control-block center">
                <div class="button row pages">
                    <button :disabled="!previousPageAvailable" @click="changePage(currentPage - 1)">⬅️</button>
                    <button v-for="page in pages" :key="`select_page_${page}`" @click="changePage(page)"
                        :class="selectedClass(page, currentPage)">{{ page }}</button>
                    <button :disabled="!nextPageAvailable" @click="changePage(currentPage + 1)">➡️</button>
                    <label>(IIV {{ imagesInView.length }} / CP {{ currentPage }} / PS {{ pageSize }} / FIC {{ filteredImages.length }})</label>
                </div>
            </div>
            <div class="control-block">
                <label>Actions</label>
                <div class="button row">
                    <button v-for="action in availableActions" :key="`action_${action.id}`" @click="activate(action)">{{
                        action.icon }} ({{ action?.files?.length }})</button>
                </div>
            </div>
        </div>
    </div>
</template>
  
<script>
import HonClient from '../clients/honClient.js'

const serverUrl = 'http://192.168.0.37:8901'

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
    props: {
        folderPath: {
            type: String,
            default: null
        }
    },
    data() {
        return {
            localFilePath: '',
            images: [],
            folders: [],
            serverUrl,
            honClient: new HonClient(serverUrl),
            currentMode: viewModes[0],
            currentPage: 1,
            modes: viewModes,
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
                    return imagepath.includes(textFilter)
                })
            }

            return filteredImages
        },
        imagesInView() {
            const { filteredImages, pageSize, currentPage } = this

            const page = []
            let i = 0
            while (i < pageSize) {
                const image = filteredImages[((currentPage - 1) * pageSize) + i]
                if (image) {
                    page.push(image)
                }
                i++
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
            console.log('File details:', { fileDetails })
            this.localFilePath = fileDetails?.sourcePath
            this.images = (fileDetails?.images ?? []).map(imagePath => `${serverUrl}${imagePath}`).sort((a, b) => {
                return a.localeCompare(b, 'en', { numeric: true })
            })
            this.folders = (fileDetails?.folders ?? [])
        },
        changeMode(newMode) {
            this.currentMode = newMode
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
    width: 33%;
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

@media screen and (max-width: 1024px) {
    .image-container {
        width: 50%;
    }
}

@media screen and (max-width: 768px) {
    .image-container {
        width: 100%;
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
    position: fixed;
    bottom: 0;
    width: 100%;
}
</style>
  