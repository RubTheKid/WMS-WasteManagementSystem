FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install wait-for-it script
RUN apk add --no-cache bash
ADD https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh /usr/wait-for-it.sh
RUN chmod +x /usr/wait-for-it.sh

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Bundle app source
COPY . .

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "server.js"]