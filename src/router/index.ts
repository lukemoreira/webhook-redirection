import { createRouter, createWebHistory } from 'vue-router';
import WebhookManager from '@/components/WebhookManager.vue';
import WebhookMappings from '@/components/WebhookMappings.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: WebhookManager,
  },
  {
    path: '/webhook-mappings',
    name: 'WebhookMappings',
    component: WebhookMappings,
  },
  // Add other routes as needed
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
