# Week 1 — App Containerization
## Containerization of the backend

First of all, i create the Dockerfile in the ```back-flask``` directory : 
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

To see if the container work properly, go to the ```PORTS``` tabs and look at the status of the container : 

![images](https://github.com/Noodles-boop/aws-bootcamp-cruddur-2023/blob/db975d74d1ddfd7efd944b5bc80b93bf09f47556/_docs/assets/week1/open%20ports%20properly.png)

Now, we can launch the url on this route ```api/activities/home``` :

![images](https://github.com/Noodles-boop/aws-bootcamp-cruddur-2023/blob/db975d74d1ddfd7efd944b5bc80b93bf09f47556/_docs/assets/week1/backend%20json%20of%20app.png)

## Containerization of the frontend
In the frontend-react-js directory :
- run ```npm i``` to install node modules.
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

Now, we can run the app with : ```docker run -d -p 3000:3000 frontend-react-js```

If we launch the port related to the front end app, we could see it ! 

![images](https://github.com/Noodles-boop/aws-bootcamp-cruddur-2023/blob/db975d74d1ddfd7efd944b5bc80b93bf09f47556/_docs/assets/week1/frontend%20interface%20of%20the%20application.png)

We can verify that all the images are created using : ```docker images``` 

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
Run the docker-compose.yml to builds both of the frontend & backend in one time with : ``` docker compose -f "docker-composer.yml" up -d --build  ```, or on doing right click on the docker-compose.yml and click on Compose up

![images](https://github.com/Noodles-boop/aws-bootcamp-cruddur-2023/blob/d865ffa016a67656a82ba8d4c274a896a4cd2f2c/_docs/assets/week1/container%20running%20properly.png)

When, we can verify if the containers properly running with : ```docker ps```

![images](https://github.com/Noodles-boop/aws-bootcamp-cruddur-2023/blob/70b0cf6e0f492802dd68cce6ce4137d0ac73306e/_docs/assets/week1/docker%20ps%20cmd.png)

## Creating the notification feature :
To create the notification feature, i run ```docker compose up``` to started the frontend and backend 
Then, i document the notification endpoint for the OpenAI Document by adding an endpoint for the notification features.

## Flask backend endpoint for the OpenAI Document :

I added a new path on the ```openapi-3.0.yml``` for the notification feature like this :

```
 /api/activities/notifications:
    get:
      description: 'Return a feed of activity for all of the people i follow'
      tags:
        - activities
      parameters: []
      responses:
        '200':
          description: Returns an array of activities
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Activity'                  
```

### Creation of the service for the flask backend app :

I updated my ```app.py``` file, adding a route for the notifications :

```
@app.route("/api/activities/notifications", methods=['GET'])
def data_notifications():
  data = NotificationActivities.run()
  return data, 200
```

Then, in the services, i created the notifications_activities.py microservice and populated it like so:

```
from datetime import datetime, timedelta, timezone

class NotificationActivities:
    def run():
        now = datetime.now(timezone.utc).astimezone()
        results = [{
        'uuid': '68f126b0-1ceb-4a33-88be-d90fa7109eee',
        'handle':  'star',
        'message': 'Let your light shine!',
        'created_at': (now - timedelta(days=2)).isoformat(),
        'expires_at': (now + timedelta(days=5)).isoformat(),
        'likes_count': 5,
        'replies_count': 1,
        'reposts_count': 0,
        'replies': [{
            'uuid': '26e12864-1c26-5c3a-9658-97a10f8fea67',
            'reply_to_activity_uuid': '68f126b0-1ceb-4a33-88be-d90fa7109eee',
            'handle':  'Worth',
            'message': 'This post has honor!',
            'likes_count': 0,
            'replies_count': 0,
            'reposts_count': 0,
            'created_at': (now - timedelta(days=2)).isoformat()
        }],
        }]
        return results
```

I also updated my imports to make a call to the newly created notification service in ```app.py```

```
from services.notifications_activities import *
```

If we go to the URL searching for ```/api/activities/notifications```, we can get the data ! 

![images](https://github.com/Noodles-boop/aws-bootcamp-cruddur-2023/blob/a460fa12058c436fb641a94eb43e2f8285771006/_docs/assets/week1/backend%20notification%20feature.png)

###  React Page for Notifications :

- I created the ```NotificationsPage``` like so : https://github.com/Noodles-boop/aws-bootcamp-cruddur-2023/blob/c2bd1948608cb55aec4aafce4c21e14dbf61bbb8/frontend-react-js/src/pages/NotificationsFeedPage.js
- In the src/App.js, i imported the page for the Notifications and add a path to it:

```
import NotificationsFeedPage from './pages/NotificationsFeedPage';
### [... some codes]
{
    path: "/notifications",
    element: <NotificationsFeedPage />
}
```
## Setup of new volumes : 

To extend my ```docker-compose.yml``` file, i setup 2 new volumes :

### The first one for Postgres :

- To ```docker-compose.yml```, i add this lines of code : 
```
db:
    image: postgres:13-alpine
    restart: always
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    ports:
      - '5432:5432'
    volumes: 
      - db:/var/lib/postgresql/data
```

Don't forget to add this volume section to make sure the volume will be mount on the container ! 

```
volumes:
  db:
    driver: local
```

Plus, to install the postgres client into Gitpod, i add this to the ```gitpod.yml``` file : 

```
  - name: postgres
    init: |
      curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc|sudo gpg --dearmor -o /etc/apt/trusted.gpg.d/postgresql.gpg
      echo "deb http://apt.postgresql.org/pub/repos/apt/ `lsb_release -cs`-pgdg main" |sudo tee  /etc/apt/sources.list.d/pgdg.list
      sudo apt update
      sudo apt install -y postgresql-client-13 libpq-dev
```

For now, i can checked if my client was running using  ```psql -Upostgres -h localhost``` cmd, enter the password to make a connection to my postgres db and see if it was OK :

![images](https://github.com/Noodles-boop/aws-bootcamp-cruddur-2023/blob/a460fa12058c436fb641a94eb43e2f8285771006/_docs/assets/week1/psql%20client%20added.png)

### The second one for DynamoDB :
- Always on ```docker-compose.yml```, i add this lines of code : 

```
dynamodb-local:
    # https://stackoverflow.com/questions/67533058/persist-local-dynamodb-data-in-volumes-lack-permission-unable-to-open-databa
    # We needed to add user:root to get this working.
    user: root
    command: "-jar DynamoDBLocal.jar -sharedDb -dbPath ./data"
    image: "amazon/dynamodb-local:latest"
    container_name: dynamodb-local
    ports:
      - "8000:8000"
    volumes:
      - "./docker/dynamodb:/home/dynamodblocal/data"
    working_dir: /home/dynamodblocal
 ```
 
 - I ceated a new DynamoDB table :
 
 ```
aws dynamodb create-table \
    --endpoint-url http://localhost:8000 \
    --table-name Music \
    --attribute-definitions \
        AttributeName=Artist,AttributeType=S \
        AttributeName=SongTitle,AttributeType=S \
    --key-schema AttributeName=Artist,KeyType=HASH AttributeName=SongTitle,KeyType=RANGE \
    --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1 \
    --table-class STANDARD
```

- Then, i created a table item doing this cmd :

```
aws dynamodb put-item \
    --endpoint-url http://localhost:8000 \
    --table-name Music \
    --item \
        '{"Artist": {"S": "No One You Know"}, "SongTitle": {"S": "Call Me Today"}, "AlbumTitle": {"S": "Somewhat Famous"}}' \
    --return-consumed-capacity TOTAL  
 ```

 -  We can list tables doing this cmd : ```aws dynamodb list-tables --endpoint-url http://localhost:8000```
 
 - Finally, to get record that the local DynamoDB was successful, i used this cmd : ```aws dynamodb scan --table-name Music --query "Items" --endpoint-url http://localhost:8000```
 
 ![images](https://github.com/Noodles-boop/aws-bootcamp-cruddur-2023/blob/a460fa12058c436fb641a94eb43e2f8285771006/_docs/assets/week1/scan%20dynamoDB%20is%20working.png)

### Run the dockerfile CMD as an external script : 

### Implement a healthcheck in the V3 Docker compose file : 

### implement some of best practice in my Dockerfile :

### install Docker on your localmachine :

### Launch an EC2 instance that has docker installed, and pull a container : 
