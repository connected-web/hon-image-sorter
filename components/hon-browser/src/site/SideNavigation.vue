
<template>
  <div :class="{ sidenav: true, show }">
    <label>Image Browser</label>
    <router-link to="/">Images</router-link>

    <label>Settings</label>
    <router-link to="/settings/feature-toggles">Feature Toggles</router-link>
    <router-link to="/settings/action-config">Configure Actions</router-link>
  </div>
</template>

<script>
import { inject } from 'vue'

export default {
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      screenSize: null
    }
  },
  setup() {
    return {
      screenSize: inject('screenSize')
    }
  }
}
</script>

<style scoped>
  .sidenav {
    display: flex;
    flex-direction: column;
    gap: 1px;
    justify-content: flex-start;
    min-width: 200px;
    width: 200px;
    max-width: 200px;
    overflow-x: hidden;
    overflow-y: auto;
    border-right: 2px solid #333;
    transition: min-width 200ms ease-in-out, max-width 200ms ease-in-out, width 200ms ease-in-out, background-color 200ms ease-in-out;
    z-index: 100;
  }
  .sidenav > * {
    white-space: nowrap;
  }
  
  .sidenav > label {
    padding: 10px 20px;
    border-bottom: 1px solid #333;
    font-size: 0.8em;
    text-transform: uppercase;
    letter-spacing: 4px;
    font-weight: 600;
    color: #666;
  }
  .sidenav > a {
    padding: 10px 20px;
    border-bottom: 1px solid #333;
  }
  
  @media only screen and (max-width: 768px) {
    .sidenav {
      position: absolute;
      display: block;
      top: 0;
      left: 0;
      min-width: 0;
      width: 0;
      max-width: 0;
      overflow: hidden;
      background: #666;
      transition: min-width 200ms ease-in-out, max-width 200ms ease-in-out, width 200ms ease-in-out, background-color 200ms ease-in-out;
    }
    .sidenav.show {
      min-width: 100%;
      max-width: 100%;
      background: black;
      height: 100vh;
    }
    .sidenav > * {
      display: none;
      white-space: nowrap;
    }    
    .sidenav.show > * {
      display: block;
      white-space: nowrap;
    }   
  }
  </style>