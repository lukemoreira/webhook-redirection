
# Webhook Management Application

This project is a full-stack web application that allows users to manage webhooks using a Vue.js frontend and an Express.js backend. The solution is containerized using Docker and Docker Compose, allowing for seamless deployment and orchestration of the services.

## Features

- **Vue.js Frontend**: A user interface to create, edit, and delete webhooks.
- **Express.js Backend**: API endpoints to handle CRUD operations for webhooks, with SQLite as the database.
- **CORS Enabled**: Configured CORS to allow communication between the Vue client and the Express backend.
- **Containerization**: Both the frontend and backend are containerized using Docker, managed by Docker Compose for simplified setup and deployment.

## Project Structure

The project consists of two main parts:

1. **Client** (Vue.js)
   - A Vue.js application built using Vite, providing a user-friendly interface for managing webhooks.
   - The Vue project is set up to use Tailwind CSS for styling and `schacn-ui-vue` for UI components.
2. **Server** (Express.js)
   - An Express.js server providing a REST API for webhook CRUD operations.
   - Uses SQLite via Sequelize as the database for storing webhook details.
   - CORS is enabled to allow requests from the Vue client.

## Prerequisites

- **Docker** and **Docker Compose** installed on your machine.
- **Node.js** and **npm** (if you wish to run the app locally without Docker).

## Installation

1. **Clone the Repository**:

   ```bash
   git clone <repository-url>
   cd webhook-management-app
   ```
2. **Create a `.env` File**:
   In the `server` directory, create a `.env` file to set environment variables:

   ```
   DOMAIN_NAME=http://webhook.domainname.net
   PORT=5000
   NODE_ENV=development
   ```
3. **Build and Run the Containers** using Docker Compose:

   ```bash
   docker-compose up --build
   ```

   This will build and start both the **Vue frontend** and **Express backend** containers.

## Usage

- **Frontend**: The Vue.js application will be accessible at [http://localhost:5174](http://localhost:5174).
- **Backend**: The Express API will be accessible at [http://localhost:5000](http://localhost:5000).

### API Endpoints

The Express backend provides the following API endpoints:

- `GET /api/webhooks` - Retrieve all webhooks.
- `POST /create-webhook` - Create a new webhook.
- `DELETE /api/webhooks/:id` - Delete a webhook by ID.
- `PUT /api/webhooks/:id` - Update an existing webhook by ID.

## Environment Variables

You can customize the ports and environment by adding a `.env` file in the server directory. Here are the variables you may want to set:

- **`PORT`**: Port for running the Express server (default: 5000).
- **`NODE_ENV`**: Environment for running the app (`development` or `production`).
- **`DOMAIN_NAME`**: The domain name to use for generating webhook URLs.

## Running Without Docker

If you prefer to run the app locally without Docker:

1. **Navigate to the Client Directory**:

   ```bash
   cd client
   npm install
   npm run dev
   ```

   This will start the Vue.js frontend at [http://localhost:5173](http://localhost:5173).
2. **Navigate to the Server Directory**:

   ```bash
   cd server
   npm install
   npm run start
   ```

   This will start the Express.js backend at [http://localhost:5000](http://localhost:5000).

## Stopping the Containers

To stop the containers, use the following command:

```bash
docker-compose down
```

## Technologies Used

- **Vue.js**: For building the frontend.
- **Express.js**: For creating the backend API.
- **SQLite**: A lightweight database used with Sequelize ORM.
- **Tailwind CSS**: For styling the frontend.
- **Docker & Docker Compose**: For containerizing the application and running it seamlessly.
- **schacn-ui-vue**: For UI components like buttons, cards, and input fields.
- **Lucide Icons**: For providing icons in the frontend.

## Future Improvements

- **Authentication**: Add authentication to secure webhook creation and management.
- **Validation**: Add more detailed validation on both frontend and backend inputs.
- **Deployment**: Set up deployment using cloud services like AWS, Azure, or DigitalOcean.

## License

This project is licensed under the MIT License. See the `LICENSE` file for more information.

## Contact

If you have any questions, feel free to open an issue or contact the project maintainer.
