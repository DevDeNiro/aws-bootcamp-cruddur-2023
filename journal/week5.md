# Week 5 — DynamoDB and Serverless Caching

Regarding the design pattern create during the Data Modelling Live Stream, we will be implementing 4 pattern :

- A
- B 
- C
- D :  Implement a mesage group with the mesage

-- The order of implementation doesnt matter --


## DynamoDb Utility Scrips
Don't forget to uncomment the DynamoDB service we comment before on week 1 :3 
### Implement Schema Load Script

Install the AWS SDK for Python

`Boto3`

`pip install -r requirements.txt` 

Refractor the structure of bin folder : Create 3 new folder :
- db : Local Script 
- ddb : DynamoDB stuff
- rds : RDS stuff

To give execute permission on script files inside a folder :

```chmod u+x ./bin/ddb/*```
```chmod u+x ./bin/db/*```
```chmod u+x ./bin/rds/*```

Dont forget to chmod all files newli created

We will use DynamoDB in local using the SDK  : 

- Create an exec python file in [./ddb/db-schema-load](). This script will be useful for setting up the infrastructure needed to store messages in a DynamoDB table

This Python script will creates a new DynamoDB table called 'cruddur-messages' using the boto3 library. The table is configured with a primary key and a global secondary index. 

Explanation of the script :

- Import the necessary libraries: boto3 for interacting with AWS
- Define the attrs dictionary with the endpoint URL for a local DynamoDB instance.
- Create a DynamoDB client by passing the attrs dictionary as keyword arguments using the **attrs syntax.
- Define the table name as 'cruddur-messages'.
- Create the table with a primary key schema: 'pk' as hash key and 'sk' as range key.


If we lauch the script, it will output the tables :

![image]()

- We are creating new script file to [list-tables]() :

We are going to liste all the tables using [official documentation](https://docs.aws.amazon.com/cli/latest/reference/dynamodb/index.html)

- The [drop script]() will reused the same configuration as the last one. we're just passing `delete-table` argument to do so.

### Implement Seed Script

This Python script will be used to interact with Amazon DynamoDB to create and store a conversation between two users in a messaging system. The conversation consists of messages and message groups.


The [seed script]() is a necessary tool for populating tables with data, which is essential for working with the tables effectively.


These 3 lines will dynamically determine and include the parent directory of the script in the Python path, allowing the script to import modules from that directory.

```py
current_path = os.path.dirname(os.path.abspath(__file__))
parent_path = os.path.abspath(os.path.join(current_path, '..', '..'))
sys.path.append(parent_path)
```

Define the get_user_uuids function, which retrieves the UUIDs, display names, and handles for two users (andrewbrown and bayko) from the users table in the database.

These 2 fields are madatory because it will relly on our `seed.sql` data 

So we need to have them inserted and running : 

- ./bin/db/create
- ./bin/db/schema-load
- ./bin/db/seed

```ERROR:  null value in column "email" of relation "users" violates not-null constraint``` means that we need to update our `seed.sql` to have new column like so :

```sql
public.users (display_name, email,...)
VALUES ('andrewB','andrewb@exampro.co',...)  
```
- Define the `create_message_group` function, which takes several parameters and creates a new message group record in the 'cruddur-messages' DynamoDB table.

```py
def create_message_group(client,message_group_uuid, my_user_uuid, last_message_at=None, message=None, other_user_uuid=None, other_user_display_name=None, other_user_handle=None):
  table_name = 'cruddur-messages'
  record = {
    'pk':   {'S': f"GRP#{my_user_uuid}"},
    'sk':   {'S': last_message_at},
    'message_group_uuid': {'S': message_group_uuid},
    'message':  {'S': message},
    'user_uuid': {'S': other_user_uuid},
    'user_display_name': {'S': other_user_display_name},
    'user_handle': {'S': other_user_handle}
  }
```

- Define the `create_message` function, which takes several parameters and creates a new message record in the 'cruddur-messages' DynamoDB table.

```py
def create_message(client,message_group_uuid, created_at, message, my_user_uuid, my_user_display_name, my_user_handle):
  table_name = 'cruddur-messages'
  record = {
    'pk':   {'S': f"MSG#{message_group_uuid}"},
    'sk':   {'S': created_at },
    'message_uuid': { 'S': str(uuid.uuid4()) },
    'message': {'S': message},
    'user_uuid': {'S': my_user_uuid},
    'user_display_name': {'S': my_user_display_name},
    'user_handle': {'S': my_user_handle}
  }
```

- The string named `conversation` will containing the conversation text between Person 1 and Person 2.

The data is returning correctly 

 ![image]()

-> ./bin/ddb/schema-load
-> ./bin/ddb/list-tables
-> ./bin/ddb/seed

### Implement Scan Script

The [scan script]() will connects to a local instance of Amazon DynamoDB, scans the 'cruddur-messages' table to retrieve all items, and then prints each item to the console.

It uses the boto3 library to interact with Amazon DynamoDB and retrieves all items from the 'cruddur-messages' table. 

![image]()

### Implement Pattern Scripts for Read and List Conversations	

Create new folder `pattern` which will store de our pattern 
We will have :

- [get-conversation]() : will return our data structure 
- [list-conversation]() : will 

The `list-conversation` wil return : 
```AttributeError: 'Db' object has no attribute 'query_value'``` because 
the function is not existing ! So we had to add it in `db.py` file :

```py
 def query_value(self,sql,params={}):
    self.print_sql('value',sql,params)
    with self.pool.connection() as conn:
      with conn.cursor() as cur:
        cur.execute(sql,params)
        json = cur.fetchone()
        return json[0]
```

It will return value from the query

Futhermore, add `params={}` parameters to print the SQL request into `print_sql` function

![image]() -> List-conv 

##### Query to retrieve items 
 
On get-conversation, we can see the use of `KeyExpressionsValue` attribute like so :

`'KeyConditionExpression': 'pk = :pk AND begins_with(sk,:year)'` 

it's used to retrieve items from a DynamoDB table based on the `KeyConditionExpression`. Then, the expression will be based on the `ExpressionAttributeValues` query like so :

This code is configuring a DynamoDB query to retrieve items with a specific primary key (pk) and a sort key (sk) that begins with the specified year ('2023').

```py
'ExpressionAttributeValues': {
    ':year': {'S': '2023'},
    ':pk': {'S': f"MSG#{message_group_uuid}"}
  }
```
The get conversation will return 2 statements : Firstly the dict of data 
![image]()
Then, the actual values 
![image]()

