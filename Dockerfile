FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

# Install dependencies
RUN npm install
# Install nodemon for development
RUN npm install -g nodemon

# Copy source code
COPY . .

# Expose the port
EXPOSE 3000

# Start command
CMD ["npm", "start"] 