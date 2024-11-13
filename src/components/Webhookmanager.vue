
<template>
    <div class="min-h-screen p-6 bg-steel text-gray-200 justify-center align-middle place-items-center">        
        
        <!-- Add/Edit Webhook Form -->
        <Card class="mb-6 p-4 shadow-md w-10/12 pr-10 pl-10 min-w-[400px]">
        <h2 class="text-2xl mb-4">{{ editMode ? 'Edit ' : 'New ' }}Webhook</h2>
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
                placeholder="Signature header"
                v-model="newWebhook.signatureHeader"
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
                

                <div class="flex space-x-4 justify-end">
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
        <div class="h-screen bg-gray-200 p-4 rounded-lg shadow-md w-10/12 min-w-[400px] xs:text-xs">  
        <!-- Import and Export Buttons -->
        <div class="flex gap-4 justify-end xs:text-xs">
            <Button @click="exportWebhooks" color="primary" class="py-2 px-4">
                <FileDown/>Export Webhooks
            </Button>
            <Input
                type="file"
                ref="fileInput"
                class="hidden"
                @change="handleFileUpload"
            />
            <Button @click="importWebhooks" color="secondary" class="py-2 px-4">
                <FileUp/>Import Webhooks
            </Button>
        </div>     
        <h2>Webhooks List</h2>
        <Table class="w-full rounded-lg xs:text-xs">
            <TableHeader>
            <TableRow class="bg-prodifyGreen text-steel h-4">                
                <TableHead class="border p-2 text-left">Name</TableHead>
                <TableHead class="border p-2 text-left">Destination</TableHead>
                <TableHead class="border p-2 max-w-12 text-left">Actions</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            <TableRow
                v-for="webhook in webhooks"
                :key="webhook.id"
                class="hover:bg-gray-300 text-steel"
            >                
                <TableCell class="border p-1  truncate">{{ webhook.name }}</TableCell>
                <TableCell class="border p-1 max-w-48 truncate">{{ webhook.destination }}</TableCell>
                <TableCell class="border p-1 max-w-12 justify-center place-content-center items-center align-middle text-center xs:text-xs">
                <Button
                    @click="editWebhook(webhook)"                    
                >
                    <Pencil /> 
                </Button>
                <Button
                    variant="destructive"
                    @click="deleteWebhook(webhook.id)"

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
import { Pencil, RotateCcw, Trash2, Webhook, FileDown, FileUp } from 'lucide-vue-next';

// Define the new webhook object, webhooks list, and edit mode status
const newWebhook = ref({
name: '',
signature: '',
signatureHeader: '',
destination: ''
});


interface IWebhook {
    id: string;
    name: string;
    signature: string | null;
    signatureHeader: string | null;
    destination: string;
}

const webhooks = ref<Array<IWebhook>>([]);

const editMode = ref(false);
const editingWebhookId = ref<string | null>(null);

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
const deleteWebhook = async (id: string) => {
try{
    await axios.delete(`http://localhost:5000/api/webhooks/${id}`);
    webhooks.value = webhooks.value.filter(webhook => webhook.id !== id);
} catch (error) {
    console.error('Error deleting webhook:', error);
}
};

// Function to edit a webhook
const editWebhook = (webhook: IWebhook) => {
editMode.value = true;
editingWebhookId.value = webhook.id;
newWebhook.value = { ...webhook, signature: '', signatureHeader: '' };
};

// Function to reset the form to "add" mode
const resetForm = () => {
newWebhook.value = { name: '', signature: '', signatureHeader: '', destination: '' };
editMode.value = false;
editingWebhookId.value = null;
};

// Function to cancel the edit operation
const cancelEdit = () => {
resetForm();
};


// Export webhooks
const exportWebhooks = async () => {
    try {
        const response = await axios.get('http://localhost:5000/export-webhooks', {
            responseType: 'blob' // Important for file download
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'webhooks-db-bkp.json');
        document.body.appendChild(link);
        link.click();
    } catch (error) {
        console.error('Error exporting webhooks:', error);
    }
};

// Import webhooks
const fileInput = ref<HTMLElement | null>(null);

const importWebhooks = () => {
    fileInput.value?.click(); // Trigger the hidden file input click
};

const handleFileUpload = async (event: { target: { files: any[]; }; }) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
        try {
            const jsonData = JSON.parse(reader.result as string);
            await axios.post('http://localhost:5000/import-webhooks', jsonData, {
                headers: { 'Content-Type': 'application/json' }
            });
            // Refresh the webhook list
            await fetchWebhooks();
        } catch (error) {
            console.error('Error importing webhooks:', error);
        }
    };
    reader.readAsText(file);
};


</script>

<style scoped>
/* Scoped styles for additional customization, if needed */
</style>
