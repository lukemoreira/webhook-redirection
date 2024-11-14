<script setup lang="ts">
import NavBar from './components/NavBar.vue';
import { useIsAuthenticated } from 'vue3-msal-plugin';

const isAuthenticated = useIsAuthenticated();
</script>

<template>
  <header>
    <NavBar />
  </header>
  <div v-if="isAuthenticated" class="content-container">
    <router-view />
  </div>
  <div v-else class="flex justify-center items-center bg-steel text-white h-full">
    <p>Not authenticated, please sign in</p>
  </div>
</template>

<style scoped>
.content-container {
  min-height: 100vh;
  padding: 2rem;
  background-color: var(--steel);
  color: var(--gray-200);
}
</style>
