<template>
  <div :class="{ app: true, [screenSize.value]: true }">
    <SiteHeader @toggle-nav="showNav = !showNav" />
    <div class="middle">
      <SideNavigation :show="showNav" />
      <router-view class="page" />
    </div>
  </div>
</template>

<script>
import { provide, reactive } from 'vue'

import SideNavigation from './site/SideNavigation.vue'
import SiteHeader from './site/Header.vue'

export default {
  components: { SiteHeader, SideNavigation },
  data() {
    return {
      showNav: false
    }
  },
  setup() {
    const screenSize = reactive({ value: 'unknown' })
    provide('screenSize', screenSize)
    return {
      screenSize
    }
  },
  mounted() {
    this.updateScreenSize()
    window.addEventListener('resize', this.updateScreenSize)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updateScreenSize)
  },
  methods: {
    updateScreenSize() {
      const width = window.innerWidth
      if (width < 768) {
        this.screenSize.value = 'small'
      } else if (width >= 768 && width < 1024) {
        this.screenSize.value = 'medium'
      } else {
        this.screenSize.value = 'large'
      }
    }
  },
  watch: {
    $route() {
      this.showNav = false
    }
  }
}
</script>

<style scoped>
.app {
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: black;
  color: white;
  overflow-x: hidden;
}
.middle {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  flex: 1 1;
}
.middle.small {
  display: block;
}
.page {
  margin: 0;
  padding: 0;
  flex: 1 1;
}
</style>
