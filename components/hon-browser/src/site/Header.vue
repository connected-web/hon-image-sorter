<template>
    <div class="header">
      <div class="site-logo"></div>
      <label class="site-title">HON - Image Sorter</label>
      <span class="spacer"></span>
    </div>
  </template>
  
  <script>  
  export default {
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
</style>
