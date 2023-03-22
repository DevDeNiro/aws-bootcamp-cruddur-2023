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

Dev connection URL for GITPOD
```
export CONNECTION_URL='postgresql://postgres:password@localhost:5432/cruddur'
gp env CONNECTION_URL='postgresql://postgres:password@localhost:5432/cruddur'
```
Prod connection for RDS connection
```
PROD_CONNECTION_URL='postgresql://cruddurroot:password@cruddur-db-instance.cmz7ann2jep1.ca-central-1.rds.amazonaws.com:5432/cruddur'
```

- Verify connection :

```createdb cruddur -h localhost -U postgres```
```psql -U postgres -h localhost```

- Create a new folder with the following script file : [db-connect]() / [db-create]() / [db-drop]() / [db-schema-load]() 

For Schema Load, develop the use of RealPath 

- If you failed to use use db-schema-load script, try to do :

```psql postgresql://postgres:password@localhost:5432/cruddur cruddur < schema.sql``` To manually create tables
```psql CONNECTION_URL cruddur < schema.sql```

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

- In the code where we need to queries our ```home_activities``` first from ```lin.db import pool```, import the lib, and then established connection to return data :


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

-> Match new querie above to see the username by the used of JOIN querie  :

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

Our first querie is working :
![image]()


### Established Connection from Gitpod to RDS Instance

Before continue, make sure that you have set the PROD connection url by verifying your local env : ```env | grep PROD```

```
psql $CONNECTION_URL
psql $PROD_CONNECTION_URL
```

Is hanging because we need to set the IP adress, to do so the instance has a security group, so we need to add inbound rules to use it by providing our Gitpod IP and whitelist for inbound traffic on port 5432 :

- Determione current IP adress :

```GITPOD_IP=$(curl ifconfig.me)```

![image]()

If you need to know more info from the CLI on your RDS instance :

```aws rds describe-db-instances --region ca-central-1```

Connection to root is now commit :

![image]()

#### Dynamically provide IP adress

Script to update security group :

- Get the Security Group ID from the inbound rule we set : 

```
export DB_SG_ID="sg-0432fd25e76b791f9"
gp env DB_SG_ID="sg-0432fd25e76b791f9"

export DB_SG_RULE_ID="sgr-042c145e5f32d7004"
gp env DB_SG_RULE_ID="sgr-042c145e5f32d7004"
```

Whenever we need to update our security groups, we can do this for access.

```
aws ec2 modify-security-group-rules \
    --group-id $DB_SG_ID \
    --security-group-rules "Description=SecurityGroupRuleId=$DB_SG_RULE_ID,SecurityGroupRule={IpProtocol=tcp,FromPort=5432,ToPort=5432,CidrIpv4=$GITPOD_IP/32}"
 ```
 
 To ensure that the script is launching envery time the GITPOD env is started, we update the ```gitpod.yml```  :

 ```
  command: |
      export GITPOD_IP=$(curl ifconfig.me)
      source  "$THEIA_WORKSPACE_ROOT/backend-flask/bin/rds-update-sg-rule"
```

This command will refer to a new script that we are going to create name ```rds-update-sg-rule```
Then, add right to make it executable : ```chmod u+x ./bin/rds-update-sg-rule```

To resolve this error : ```An error occurred (InvalidParameterValue) when calling the ModifySecurityGroupRules operation: CIDR block /32 is malformed``` we need to export the 

``` GITPOD_IP=$(curl ifconfig.me)```

Modify the ```CONNECTION_URL``` line to use the PROD connection URL like so : 

```CONNECTION_URL: "${PROD_CONNECTION_URL}"```


### Create Congito Trigger to insert user into database

Create a custom Auth for Cognito :

- Create new lambda function with ptyhon3.0 and x86 architecture

- Create new folder name lambdas, with [cruddur-post-confirmation.py]() inside it
  Set env variables from DEV env on lambda function 
  Create new layer with ARN privided in the doc : ```arn:aws:lambda:ca-central-1:898466741470:layer:psycopg2-py38:1```

  A good security practice would be to genete one by yourself by using the [psycopg2 Python Library for AWS Lambda](https://github.com/AbhimanyuHK/aws-psycopg2)

- Go on Cognito Pannel to add the new Lambda trigger after confirmation signUp

The image bellow show that lambda function is storing new user into RDS instance :

![image]()


### Create new activities with a database insert

#### INSERT DATA WITH VALUES 

Andrew done a BIG refractor on this step of the implementation, so i will directly link to the file modified from his repo :

- Refractor of [db.py](https://github.com/omenking/aws-bootcamp-cruddur-2023/blob/f3f5a927667fa841eaecdeb40913ae44d0ff9fa5/backend-flask/lib/db.py) 

- Refractor of [home_activities.py](https://github.com/omenking/aws-bootcamp-cruddur-2023/blob/f3f5a927667fa841eaecdeb40913ae44d0ff9fa5/backend-flask/services/home_activities.py)

- 

-  In ```create_activity.py```, we create a new INSERT SQL QUeries to seed our data from the application.

```py
   def create_activity(handle, message, expires_at):
      sql = db.template('activities','create')
      uuid = db.query_commit(sql,{
        'handle': handle,
        'message': message,
        'expires_at': expires_at
      })
      return uuid

```

