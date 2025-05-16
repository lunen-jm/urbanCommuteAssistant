FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Set up the environment for Vite
ENV NODE_ENV=development
ENV VITE_API_URL=http://backend:8000/api

# Expose the port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]