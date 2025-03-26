FROM node:16

# Set working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if present)
COPY package*.json ./

# Install dependencies (including dev dependencies)
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Run the app in development mode
CMD ["npm", "run", "dev"]
