FROM node:16.18
WORKDIR /jwt-verification-process
RUN npm install 

# Create a directory for the shared module
WORKDIR /shared

# Copy the function from the sidecar container
COPY jwtVerifier.js .

# Switch back to the main application directory
WORKDIR /jwt-verification-process

CMD ["npm", "start"]
