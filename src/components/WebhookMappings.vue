<template>
  <div class="min-h-screen p-6 bg-steel text-gray-200 justify-center align-middle place-items-center">        
      
      <!-- Add/Edit Mapping Form -->
      <Card class="mb-6 p-4 shadow-md w-10/12 pr-10 pl-10 min-w-[400px]">
      <h2 class="text-2xl mb-4">{{ editMode ? 'Edit ' : 'New ' }}Mapping</h2>
      <div class="">
          <form @submit.prevent="submitMapping">
            <Label for="picture">Name</Label>
              <Input
              placeholder="Name"
              v-model="newMapping.name"
              type="text"
              class="w-full mb-4"
              required
              />

              <Label for="picture">Incoming Fields</Label>
              <Textarea
              placeholder="Incoming Fields (JSON)"
              v-model="newMapping.incomingFields"
              class="w-full mb-4"
              required
              />

              <Label for="picture">Outgoing Fields</Label>
              <Textarea
              placeholder="Outgoing Fields (JSON)"
              v-model="newMapping.outgoingFields"
              class="w-full mb-4"
              required
              />

              <Label for="picture">Formula (As javascript function)</Label>
              <Textarea
              placeholder="Formula"
              v-model="newMapping.formula"
              class="w-full mb-4"
              required
              />
              
              <div class="flex space-x-4 justify-end">
              <Button type="submit" color="primary" >
                  <Webhook />
                  {{ editMode ? 'Save Changes' : 'Add Mapping' }}
              </Button>
              <Button v-if="editMode" @click="cancelEdit" color="secondary">Cancel</Button>
              <Button variant="destructive" @click="resetForm" color="info">
                  <RotateCcw /> Clear
              </Button>
              </div>
          </form>
      </div>
      </Card>

      <!-- Mapping List -->
      <div class="h-screen bg-gray-200 p-4 rounded-lg shadow-md w-10/12 min-w-[400px] xs:text-xs">  
      <h2>Mappings List</h2>
      <Table class="w-full rounded-lg xs:text-xs">
          <TableHeader>
          <TableRow class="bg-prodifyGreen text-steel h-4">                
              <TableHead class="border p-2 text-left">Name</TableHead>
              <TableHead class="border p-2 text-left">Formula</TableHead>
              <TableHead class="border p-2 max-w-12 text-left">Actions</TableHead>
          </TableRow>
          </TableHeader>
          <TableBody>
          <TableRow
              v-for="mapping in mappings"
              :key="mapping.id"
              class="hover:bg-gray-300 text-steel"
          >                
              <TableCell class="border p-1  truncate">{{ mapping.name }}</TableCell>
              <TableCell class="border p-1 max-w-48 truncate">{{ mapping.formula }}</TableCell>
              <TableCell class="border p-1 max-w-12 justify-center place-content-center items-center align-middle text-center xs:text-xs">
                  <Button
                      aria-label="Edit"
                      class="bg-blue-500 hover:bg-steel/80"
                      @click="editMapping(mapping)"                    
                  >
                      <Pencil /> 
                  </Button>
                  <Button
                      aria-label="Delete"
                      class="bg-red-500 hover:bg-red-900"
                      variant="destructive"
                      @click="deleteMapping(mapping.id)"
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
import Textarea from './ui/textarea/Textarea.vue';
import {
Table,
TableBody,
TableCell,
TableHead,
TableHeader,
TableRow,
} from '@/components/ui/table'
import { Pencil, RotateCcw, Trash2, Webhook } from 'lucide-vue-next';

// Define the new mapping object, mappings list, and edit mode status
const newMapping = ref({
  name: '',
  incomingFields: '',
  outgoingFields: '',
  formula: ''
});

interface IMapping {
  id: string;
  name: string;
  incomingFields: string;
  outgoingFields: string;
  formula: string;
}

const mappings = ref<Array<IMapping>>([]);

const editMode = ref(false);
const editingMappingId = ref<string | null>(null);

// Fetch existing mappings when the component is mounted
const fetchMappings = async () => {
  try {
      const response = await axios.get('http://localhost:5000/api/mappings');
      mappings.value = response.data;
  } catch (error) {
      console.error('Error fetching mappings:', error);
  }
};

onMounted(fetchMappings);

// Function to create or update a mapping
const submitMapping = async () => {
  if (editMode.value) {
      // Update existing mapping
      try {
          await axios.put(`http://localhost:5000/api/mappings/${editingMappingId.value}`, newMapping.value);
          const index = mappings.value.findIndex(mapping => mapping.id === editingMappingId.value);
          if (index !== -1) {
              mappings.value[index] = { ...mappings.value[index], ...newMapping.value };
          }
          resetForm();
      } catch (error) {
          console.error('Error updating mapping:', error);
      }
  } else {
      // Create new mapping
      try {
          const response = await axios.post('http://localhost:5000/api/mappings', newMapping.value);
          mappings.value.push({ ...newMapping.value, id: response.data.id });
          resetForm();
      } catch (error) {
          console.error('Error creating mapping:', error);
      }
  }
};

// Function to delete a mapping
const deleteMapping = async (id: string) => {
  try {
      await axios.delete(`http://localhost:5000/api/mappings/${id}`);
      mappings.value = mappings.value.filter(mapping => mapping.id !== id);
  } catch (error) {
      console.error('Error deleting mapping:', error);
  }
};

// Function to edit a mapping
const editMapping = (mapping: IMapping) => {
  editMode.value = true;
  editingMappingId.value = mapping.id;
  newMapping.value = { ...mapping };
};

// Function to reset the form to "add" mode
const resetForm = () => {
  newMapping.value = { name: '', incomingFields: '', outgoingFields: '', formula: '' };
  editMode.value = false;
  editingMappingId.value = null;
};

// Function to cancel the edit operation
const cancelEdit = () => {
  resetForm();
};

</script>

<style scoped>
/* Scoped styles for additional customization, if needed */
</style>