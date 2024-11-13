<script setup lang="ts">
import WebhookManager from '@/components/WebhookManager.vue';
import NavBar from './components/NavBar.vue';
import { useIsAuthenticated } from 'vue3-msal-plugin'

const isAuthenticated = useIsAuthenticated()
</script>

<template>
  <header>
    <NavBar />
  </header>  
    <WebhookManager v-if="isAuthenticated"/>  
    <div v-else class="flex justify-center items-center bg-steel text-white">
      <p>Not authenticated, please sign in</p>      
    </div>        
</template>
