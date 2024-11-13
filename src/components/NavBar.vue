<script setup lang="ts">
import { useIsAuthenticated, useMsal } from 'vue3-msal-plugin'
import Button from './ui/button/Button.vue';
import { Webhook } from 'lucide-vue-next';
const { instance, accounts, inProgress, loginRequest } = useMsal()

console.log('instance', instance)
console.log('accounts', accounts.value)
console.log('inProgress', inProgress.value)

const isAuthenticated = useIsAuthenticated()

const loginPopup = () => {
  instance.loginPopup(loginRequest)
}

const logoutPopup = () => {
  instance.logoutPopup({
    mainWindowRedirectUri: '/'
  })
}

</script>
<template>
  <div class=" bg-steel border-b flex justify-between align-middle py-3 px-2">    
    <div class="flex gap-2 text-white align-middle justify-items-center">
        <div class="flex gap-1 align-middle justify-items-center">
        <Webhook/> Webhook Manager
        </div> 
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