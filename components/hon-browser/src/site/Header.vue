<template>
  <div class="header">
    <div v-if="screenSize?.value === 'small'" class="burger" @click="$emit('toggleNav')">
      <span></span>
      <span></span>
      <span></span>
    </div>
    <div class="site-logo"></div>
    <label class="site-title">HON - Image Sorter</label>
    <span class="spacer"></span>
  </div>
</template>
  
<script>
import { inject } from 'vue'

export default {
  emits: ['toggleNav'],
  setup() {
    const screenSize = inject('screenSize')
    return {
      screenSize
    }
  },
  methods: {
    clearData() {
      console.log('Figure this out')
    }
  }
}
</script>
  
<style scoped>
.header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0 1em;
  gap: 1em;
  height: 4em;
  border-bottom: 2px solid #333;
  overflow: hidden;
}
.site-logo {
  display: inline-block;
  background: url(../public/site.svg);
  background-repeat: no-repeat;
  background-size: contain;
  width: 2em;
  height: 2em;
}
.site-title {
  font-size: 1.4em;
  font-weight: 600;
}
.spacer {
  flex: 1 10;
}

button {
  font-size: 0.85em;
}
  
.burger {
  display: block;
  width: 24px;
  height: 20px;
  cursor: pointer;
}

.burger span {
  display: block;
  height: 2px;
  background-color: white;
  margin-bottom: 6px;
}

</style>
