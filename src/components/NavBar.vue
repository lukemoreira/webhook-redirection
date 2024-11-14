<script setup lang="ts">
import { useRouter } from 'vue-router'; // Import useRouter from vue-router
import { useIsAuthenticated, useMsal } from 'vue3-msal-plugin';
import Button from './ui/button/Button.vue';
import webhook from '@/assets/webhook.svg';
import { Map, House  } from 'lucide-vue-next';

const router = useRouter();  // Initialize the router instance using useRouter

const { instance, accounts, inProgress, loginRequest } = useMsal();

console.log('instance', instance);
console.log('accounts', accounts.value);
console.log('inProgress', inProgress.value);

const isAuthenticated = useIsAuthenticated();

const loginPopup = () => {
  instance.loginPopup(loginRequest);
};

const logoutPopup = () => {
  instance.logoutPopup({
    mainWindowRedirectUri: '/'
  });
};

// Function to navigate to the mapping page
const goToMappings = () => {
  router.push({ name: 'WebhookMappings' });  // Navigate to the 'WebhookMappings' route
};
const goToHome = () => {
  router.push({ name: 'Home' });  // Navigate to the 'WebhookMappings' route
};
</script>

<template>
  <div class="bg-steel border-b flex justify-between align-middle py-3 px-2">    
    <div class="flex gap-2 text-white align-middle justify-items-center">
      <div class="flex gap-1 align-middle justify-items-center">
        <img :src="webhook" class="w-6 h-6" alt="Logo"/> Webhook Manager
      </div> 
    </div>
    <div>
      <!-- Button to navigate to Webhook Mappings -->
      <Button
        @click="goToHome"
        aria-label="Mappings"
        class="bg-yellow-500 hover:bg-yellow-700 ml-2"
        hint="Manage Mappings"
      >
        <House />Home
      </Button>
      <Button
        @click="goToMappings"
        aria-label="Mappings"
        class="bg-yellow-500 hover:bg-yellow-700 ml-2"
        hint="Manage Mappings"
      >
        <Map />Mappings
      </Button>
    </div>
    <div v-if="isAuthenticated" class="flex">
      <Button             
          variant="secondary" 
          class="hover:bg-prodifyGreen/80"
          @click="logoutPopup">
          Log Out
      </Button>        
    </div>
    <div v-else class="flex">
      <Button             
          variant="secondary" 
          class="hover:bg-prodifyGreen/80"
          @click="loginPopup">
          Log In
      </Button>        
    </div>    
  </div>
</template>
