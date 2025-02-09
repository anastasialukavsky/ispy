# Use Node.js image for the build stage
FROM node:18-alpine AS build

# Set working directory in the container
WORKDIR /app

# Copy package files to the working directory
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --frozen-lockfile

# Copy all files into the container
COPY . .

# Build the application (TypeScript + Vite)
RUN npm run build

# Use Nginx for serving the production build
FROM nginx:alpine

# Copy built files to the Nginx directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 to serve the app
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
