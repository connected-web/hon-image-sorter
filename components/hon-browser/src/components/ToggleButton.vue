<template>
  <button :class="{ 'toggle-button': true, enabled: toggle?.enabled, disabled: !toggle?.enabled }">
    <span class="hidden">{{ toggle?.enabled ? 'Disable' : 'Enable' }}</span>
  </button>
</template>

<script>
export default {
  props: {
    value: {
      type: null,
      default: null
    }
  },
  computed: {
    toggle() {
      return this.value ?? { enabled: false }
    }
  }
}
</script>

<style scoped>
.toggle-button {
  position: relative;
  min-width: 60px;
  min-height: 30px;
  transition: background-color 0.3s ease;
  border-radius: 10px;
  cursor: pointer;
}
.toggle-button > .hidden {
    display: none;
}
.toggle-button::after {
  content: "";
  position: absolute;
  top: 3px;
  left: 3px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #fff;
  transition: transform 0.3s ease;
}
.toggle-button.enabled {
  background-color: #4caf50;
}
.toggle-button.enabled:hover {
  background-color: #6ec971;
}


.toggle-button.enabled::after {
  transform: translateX(30px);
}

.toggle-button.disabled {
  background-color: #2b1b1b;
}
.toggle-button.disabled:hover {
  background-color: #422f2f;
}
</style>