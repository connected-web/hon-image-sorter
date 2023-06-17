import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './routes.js'

import FeatureToggle from './models/FeatureToggles'

const defaultFeatures = {
  tagImages: {
    enabled: true,
    name: 'Tag Images with Emoticons',
    icon: '🏷️',
    description: 'Allows users to tag images with emoticons.',
  },
  filterImages: {
    enabled: true,
    name: 'Filter Images by Tag',
    icon: '🔍',
    description: 'Enables users to filter images based on tags.',
  },
  thumbnailPagination: {
    enabled: true,
    name: 'Thumbnail Pagination',
    icon: '📄',
    description: 'Provides thumbnail pagination functionality.',
  },
  thumbnailScaling: {
    enabled: true,
    name: 'Thumbnail Scaling',
    icon: '🖼️',
    description: 'Scale thumbnails to fit available space.',
  },
  moveFiles: {
    enabled: false,
    name: 'Move Files based on Filters',
    icon: '🚀',
    description: 'Enables moving files based on tag and filter conditions.',
  },
  deleteFiles: {
    enabled: false,
    name: 'Delete Files based on Filters',
    icon: '🗑️',
    description: 'Enables deleting files based on tag and filter conditions.',
  },
  configureSourceDirectory: {
    enabled: false,
    name: 'Dynamically Configure Source Directory',
    icon: '📂',
    description: 'Allows dynamically configuring the source directory.',
  },
  singleOperationStartup: {
    enabled: false,
    name: 'Make Server Startup a Single Operation',
    icon: '🚀',
    description: 'Makes the server startup process a single operation.',
  },
  installablePackage: {
    enabled: false,
    name: 'Make Server Startup an Installable Package',
    icon: '📦',
    description: 'Provides an installable package for server startup.',
  },
  modifyEmoticons: {
    enabled: false,
    name: 'Allow Emoticon Icons to be changed',
    icon: '⚙️',
    description: 'Adds settings to configure emoticon icons.',
  },
  configurableActionTags: {
    enabled: false,
    name: 'Allow Configurable Action Tags',
    icon: '🔧',
    description: 'Allows configurable action tags such as delete, move, or rename.',
  },
  singleImageView: {
    enabled: false,
    name: 'Single Image View Mode',
    icon: '🖼️',
    description: 'Allow images to be viewed one image at a time for faster tagging.',
  },
  folderBreadcrums: {
    enabled: false,
    name: 'Folder Breadcrumbs',
    icon: '📁',
    description: 'Show breadcrumbs for navigating to parent folders',
  },
  compactMode: {
    enabled: false,
    name: 'Compact Mode',
    icon: '🔍',
    description: 'Implements a compact mode for the application.',
  },
  lightDarkMode: {
    enabled: false,
    name: 'Light Mode / Dark Mode Support',
    icon: '🌞🌛',
    description: 'Adds support for light and dark modes.',
  },
}

// Initialize the toggles using FeatureToggle class
FeatureToggle.initializeToggles(defaultFeatures)

const app = createApp(App)
app.use(router)
app.mount('#app')
