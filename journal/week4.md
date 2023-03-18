# Week 4 — Postgres and RDS
 
### Setup RDS instance : Provision RDS Instance

To create DB RDS from CLI, we could use this CMD :

```
aws rds create-db-instance \
 --db-instance-identifier cruddur-db-instance \
 --db-instance-class db.t3.micro \
 --engine postgres \
 --engine-version 14.6 \
 --master-username root \
 --master-user-password super#MotdePasse1239 \
 --allocated-storage 20 \
 --availability-zone ca-central-1a \
 --backup-retention-period 0 \
 --port 5432 \
 --no-multi-az \
 --db-name cruddur \
 --storage-type gp2 \
 --publicly-accessible \
 --storage-encrypted \
 --enable-performance-insights \
 --performance-insights-retention-period 7 \
 --no-deletion-protection
```

To manage connection for the first time :

`psql -U cruddur < db/schema.sql -h localhost -U postgres`

![image]()

### Bash scripting for common database actions

- Add env variables to GITPOD to use script :

```
export CONNECTION_URL='postgresql://postgres:password@localhost:5432/cruddur'
gp env CONNECTION_URL='postgresql://postgres:password@localhost:5432/cruddur'
```
``` Prod connection for RDS connection
PROD_CONNECTION_URL='postgresql://cruddurroot:password@cruddur-db-instance.cmz7ann2jep1.ca-central-1.rds.amazonaws.com:5432/cruddur'
```

- Verify connection :

```createdb cruddur -h localhost -U postgres```
```psql -U postgres -h localhost```


- Create a new folder with the following script file : [db-connect]() / [db-create]() / [db-drop]() / [db-schema-load]() 

For Schema Load, develop the use of RealPath 

- We can add the following script to verify if we are we're using DEV or PROD env : 

```
if [ "$1" = "prod" ]; then
  echo "Running in production mode"
else
  echo "Running in development mode"
fi
```

- Create ```schema.sql``` : (explicitly PUBLIC for different domain), Dont forget to add above the creation table to avoid error related to the use of a table already existing

```
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.activities;
```

- /dt to liste column form table

- Test the schema-load script to verif you can agregate the table cruddur

![image]()

- Create db-seed Script to load data from schema file : same as schema file

- Create ```seed.sql``` from file from [OmenKing]()

- Add right access to new file create ```chmod u+x ./bin``` 

- Add user_uuid on schema like so because parameter is missing : ```user_uuid UUID NOT NULL,``` on ```public.activities``` table

- Relaunch db-schema-load -> db-seed script to add data !

```
cruddur=# \dt
Did not find any relations.
```

### Install Postgres Driver in Backend Application

```\x on``` to expend display 

- Start writing queries ! 

If we want to drop DB after connected to it, we should kill conection before drop it : Append when connecting to db-pannel from vscode 

-> To see connection : 

```
NO_DB_CONNECTION_URL=$(sed 's/\/cruddur//g' <<<"$CONNECTION_URL")
psql $NO_DB_CONNECTION_URL -c "select pid as process_id, \
       usename as user,  \
       datname as db, \
       client_addr, \
       application_name as app,\
       state \
from pg_stat_activity;"

```

Change permission to make to file executable : ```chmod u+x ./bin/db-sessions```
./bin/db-sessions

Down and up the docker-compose to remove them

-> Create a new script db-setup to speed up our workflow !

```
bin_path="$(realpath .)/bin"

source "$bin_path/db-drop"
source "$bin_path/db-create"
source "$bin_path/db-schema-load"
source "$bin_path/db-seed"
```

-e is used to used the exec of the script

- next, we add drivers to install postgres client for Binarys and connecion pulling  
```
psycopg[binary]
psycopg[pool]
```

Go ahead and install those dependencies : ```pip install -r requirements.txt ```

-> Create new file [db.py]() under lib folder to manage connection pull : The idea is to reused connection : Pulling = mamanging multiple connection : With Fargate, EC2, we can run container on long period of time, so therefore we can do connection pulling into our app.

-> Add connection URL into docker-compose.yml file to get CONNECTION string : Not only pass the env variable but also the container related to lie so :

```CONNECTION_URL: "postgresql://postgres:password@db:5432/cruddur" ```

-> In the code where we need to querie our home_activities first ```from lin.db import pool```, import the lib, and then established connection to return data :


``` 
      sql = query_wrap_array("""
      SELECT * FROM activities """)
      with pool.connection() as conn:
        with conn.cursor() as cur:
          cur.execute(sql)
          # this will return a tuple
          # the first field being the data
          json = cur.fetchone()
      return json[0]

```

Comment all the mock data above and relaunch docker-compose.yml : If we attach logs from docker : The connection should be refused :

![image]()

-> Remove all the code related to traces to make it work 

[blank : didnt work]

-> Match new querie above :

```
    sql = query_wrap_array("""
      SELECT
        activities.uuid,
        users.display_name,
        users.handle,
        activities.message,
        activities.replies_count,
        activities.reposts_count,
        activities.likes_count,
        activities.reply_to_activity_uuid,
        activities.expires_at,
        activities.created_at
      FROM public.activities
      LEFT JOIN public.users ON users.uuid = activities.user_uuid
      ORDER BY activities.created_at DESC
      """)

```


### Connect Gitpod to RDS Instance

- Relaunch RDS DB
- Get PROD env


