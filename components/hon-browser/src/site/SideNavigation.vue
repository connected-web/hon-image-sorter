
<template>
    <div class="sidenav">
      <label>Image Browser</label>
      <router-link to="/">Images</router-link>
  
      <label>Config</label>
      <router-link to="/settings">Settings</router-link>
  
    </div>
  </template>
  
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
      min-width: 2em;
      width: 2em;
      max-width: 2em;
      overflow: hidden;
      background: #666;
      transition: min-width 200ms ease-in-out, max-width 200ms ease-in-out, width 200ms ease-in-out, background-color 200ms ease-in-out;
    }
    .sidenav > * {
      display: none;
      white-space: nowrap;
    }
  
    .sidenav:hover {
      min-width: 200px;
      width: 200px;
      max-width: 200px;
      background: white;
      transition: min-width 200ms ease-in-out, max-width 200ms ease-in-out, width 200ms ease-in-out, background-color 200ms ease-in-out;
    }
    .sidenav:hover > * {
      display: inherit;
    }
    
  }
  </style>