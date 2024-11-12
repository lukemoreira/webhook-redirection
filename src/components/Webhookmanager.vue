
<template>
    <div class="min-h-screen p-6 bg-steel text-gray-200 justify-center items-center">
        <h1 class="text-4xl font-bold mb-6 text-prodifyGreen">Webhook Redirection</h1>

        <!-- Add/Edit Webhook Form -->
        <Card class="mb-6 p-4 shadow-md w-[1080px] pr-10 pl-10">
        <h2 class="text-2xl mb-4">{{ editMode ? 'Edit Webhook' : 'Create New Webhook' }}</h2>
        <div class="">
            <form @submit.prevent="submitWebhook">
                <Input
                placeholder="Name"
                v-model="newWebhook.name"
                type="text"
                class="w-full mb-4"
                required
                />

                <Input
                placeholder="Signature"
                v-model="newWebhook.signature"
                type="text"
                class="w-full mb-4"
                />

                <Input
                placeholder="Destination"
                v-model="newWebhook.destination"
                type="text"
                class="w-full mb-4"
                required
                />
                

                <div class="flex space-x-4">
                <Button type="submit" color="primary" >
                    <Webhook />
                    {{ editMode ? 'Save Changes' : 'Add Webhook' }}
                </Button>
                <Button v-if="editMode" @click="cancelEdit" color="secondary">Cancel</Button>
                <Button variant="destructive" @click="resetForm" color="info">
                    <RotateCcw /> Clear
                </Button>
                </div>
            </form>
        </div>
        </Card>

        <!-- Webhook List -->
        <div class="h-screen bg-gray-200 p-4 rounded-lg shadow-md w-[1080px]">        
        <h2>Webhooks List</h2>
        <Table class="min-w-full border-collapse rounded-lg">            
            <TableHeader>
            <TableRow class="bg-prodifyGreen text-steel">
                <TableHead class="border p-2 text-left">ID</TableHead>
                <TableHead class="border p-2 text-left">Name</TableHead>
                <TableHead class="border p-2 text-left">Destination</TableHead>
                <TableHead class="border p-2 text-left">Actions</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            <TableRow
                v-for="webhook in webhooks"
                :key="webhook.id"
                class="hover:bg-gray-300 text-steel"
            >
                <TableCell class="border p-2">{{ webhook.id }}</TableCell>
                <TableCell class="border p-2">{{ webhook.name }}</TableCell>
                <TableCell class="border p-2">{{ webhook.destination }}</TableCell>
                <TableCell class="border p-2">
                <Button
                    @click="editWebhook(webhook)"
                    color="warning"
                    class="py-1 px-3 mr-2"
                >
                    <Pencil /> 
                </Button>
                <Button
                    variant="destructive"
                    @click="deleteWebhook(webhook.id)"
                    color="danger"
                    class="py-1 px-3"
                >
                    <Trash2 />
                </Button>
                </TableCell>
            </TableRow>
            </TableBody>
        </Table>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import Card from './ui/card/Card.vue';
import Button from './ui/button/Button.vue';
import Input from './ui/input/Input.vue';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Pencil, Webhook, RotateCcw, Trash2 } from 'lucide-vue-next';

// Define the new webhook object, webhooks list, and edit mode status
const newWebhook = ref({
name: '',
signature: '',
destination: ''
});
const webhooks = ref([]);
const editMode = ref(false);
const editingWebhookId = ref(null);

// Fetch existing webhooks when the component is mounted
const fetchWebhooks = async () => {
try{
    const response = await axios.get('http://localhost:5000/api/webhooks');
    webhooks.value = response.data;
} catch (error) {
    console.error('Error fetching webhooks:', error);
}
};

onMounted(fetchWebhooks);

// Function to create or update a webhook
const submitWebhook = async () => {
if (editMode.value) {
    // Update existing webhook
    try{
    await axios.put(`http://localhost:5000/api/webhooks/${editingWebhookId.value}`, newWebhook.value);
    const index = webhooks.value.findIndex(webhook => webhook.id === editingWebhookId.value);
    if (index !== -1) {
        webhooks.value[index] = { ...webhooks.value[index], ...newWebhook.value };
    }
    resetForm();
    } catch (error) {
    console.error('Error updating webhook:', error);
    }
} else {
    // Create new webhook
    try{
    const response = await axios.post('http://localhost:5000/create-webhook', newWebhook.value);
    webhooks.value.push({ ...newWebhook.value, id: response.data.id });
    resetForm();
    } catch (error) {
    console.error('Error creating webhook:', error);
    }
}
};

// Function to delete a webhook
const deleteWebhook = async (id) => {
try{
    await axios.delete(`http://localhost:5000/api/webhooks/${id}`);
    webhooks.value = webhooks.value.filter(webhook => webhook.id !== id);
} catch (error) {
    console.error('Error deleting webhook:', error);
}
};

// Function to edit a webhook
const editWebhook = (webhook) => {
editMode.value = true;
editingWebhookId.value = webhook.id;
newWebhook.value = { ...webhook };
};

// Function to reset the form to "add" mode
const resetForm = () => {
newWebhook.value = { name: '', signature: '', destination: '' };
editMode.value = false;
editingWebhookId.value = null;
};

// Function to cancel the edit operation
const cancelEdit = () => {
resetForm();
};
</script>

<style scoped>
/* Scoped styles for additional customization, if needed */
</style>
