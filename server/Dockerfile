# Use Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy all source code
COPY . .

# Expose backend port
EXPOSE 8000

# Start backend
CMD ["node", "server.js"]
