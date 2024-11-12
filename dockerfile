# Dockerfile for Vue (client)
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Vue application
RUN npm run build

# Expose port for serving the built application
EXPOSE 4173

# Start the application
CMD ["npm", "run", "preview"]
