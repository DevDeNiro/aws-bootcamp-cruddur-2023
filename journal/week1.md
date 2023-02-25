# Week 1 — App Containerization
## Containerization of the backend

First of all, we create the Dockerfile in the ```back-flask``` directory : 
```
FROM python:3.10-slim-buster

WORKDIR /backend-flask

COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt

COPY . .

ENV FLASK_ENV=development

EXPOSE ${PORT}
CMD [ "python3", "-m" , "flask", "run", "--host=0.0.0.0", "--port=4567"]
```

To start docker with environment variables, we add them doing this : 

```
export FRONTEND_URL="*"
export BACKEND_URL="*"

gp env FRONTEND_URL
gp env BACKEND_URL
```

To build the image, i did this command : ```docker build -t backend-flask ./backend-flask```                              
Then, i use ```docker run -p 4567:4567 -e FRONTEND_URL='*' -e BACKEND_URL='*'  backend-flask``` to run the app with env variables  


## Containerization of the frontend
In the frontend-react-js directory :
- npm install to install node modules.
- create Dockerfile to build the docker image for the frontend :

```
FROM node:16.18

ENV PORT=3000

COPY . /frontend-react-js
WORKDIR /frontend-react-js
RUN npm install
EXPOSE ${PORT}
CMD ["npm", "start"]
```

We could use this command to do so : ```docker build -t frontend-react-js ./rontend-react-js```
Now, we can run the app with : ``` docker run -d -p 3000:3000 frontend-react-js```

If needed, ran ```npm i```  command still inside this directory to install all needed dependences need to run node 

We can verify that all the images are created using : ``` docker images``` 

![images](https://github.com/Noodles-boop/aws-bootcamp-cruddur-2023/blob/fa713a006f3492c899854d4fe10c39f3e3650c53/_docs/assets/week1/dockers%20images.png)

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
Run the docker-compose.yml to builds both of the frontend & backend in one time with : ``` docker compose -f "docker-composer.yml" up -d --build  ```, or on doing right click on the docker-compose.yml fle and click on Compose up

![images]()


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
