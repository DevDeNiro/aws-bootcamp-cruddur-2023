# Week 1 — App Containerization
## Containerization of the backend

To start docker with environment variables, we use


FRONTEND_URL="*" BACKEND_URL="*" 

build docke image for the backend with:


To run docker with environment variables, use the following:

docker run -p 4567:4567 -e FRONTEND_URL='*' -e BACKEND_URL='*'  backend-flask


## Containerization of the frontend
Created a docker file for the frontend React js application and ran the following docker command to build the docker image for the frontend


docker build -t frontend-react-js ./rontend-react-js

Run the frontend app with :
docker run -p 3000:3000 -d frontend-react-js

Ran npm command to install all needed dependences need to run node as well npm audit for fix potential vulnerabilities.

npm install 
npm audit fix --force


with all the images created, the output of docker images will like what's been build 

![docker images](./assets/docker.jpg)

## Running multiple containers with magical dockerfile

Create the docker-compose.yml file in the root directory and update it like this : 
```
version: "3.8"
services:
  backend-flask:
    environment:
      FRONTEND_URL: "https://3000-${GITPOD_WORKSPACE_ID}.${GITPOD_WORKSPACE_CLUSTER_HOST}"
      BACKEND_URL: "https://4567-${GITPOD_WORKSPACE_ID}.${GITPOD_WORKSPACE_CLUSTER_HOST}"
    build: ./backend-flask
    ports:
      - "4567:4567"
    volumes:
      - ./backend-flask:/backend-flask
  frontend-react-js:
    environment:
      REACT_APP_BACKEND_URL: "https://4567-${GITPOD_WORKSPACE_ID}.${GITPOD_WORKSPACE_CLUSTER_HOST}"
    build: ./frontend-react-js
    ports:
      - "3000:3000"
    volumes:
      - ./frontend-react-js:/frontend-react-js

# the name flag is a hack to change the default prepend folder
# name when outputting the image names
networks: 
  internal-network:
    driver: bridge
    name: cruddur
```
Run the docker-compose.yml to builds both of the frontend & backend in one time with : ``` docker compose up -d ```

![images]()

Plus, we can see our images created using : ``` docker images ```
![images](https://github.com/Noodles-boop/aws-bootcamp-cruddur-2023/blob/fa713a006f3492c899854d4fe10c39f3e3650c53/_docs/assets/week1/dockers%20images.png)

When, we can verify if the containers properly running with : ``` docker ps ```
![images]([./assets/docker.jpg](https://github.com/Noodles-boop/aws-bootcamp-cruddur-2023/blob/fa713a006f3492c899854d4fe10c39f3e3650c53/_docs/assets/week1/dockers%20images.png)

## Creating the notification feature :

### Document the Notification Endpoint for the OpenAI Document :

### Flask backend endpoint for the OpenAI Document :

###  React Page for Notifications :

## Setup of new volumes : 
### Postgres :

### DynamoDB :

### Run the dockerfile CMD as an external script : 

### Implement a healthcheck in the V3 Docker compose file : 

### implement some of best practice in my Dockerfile :

### install Docker on your localmachine :

### Launch an EC2 instance that has docker installed, and pull a container : 
