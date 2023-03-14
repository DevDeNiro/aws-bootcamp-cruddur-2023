# Week 4 — Postgres and RDS

-> Setup RDS instance : Provision RDS Instance

### Create RDS instance from CLI :

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

we shut it down to avoid spend

- DON'T FORGET TO SHUTDOWN RDS INSTANCE NEXT WEEK THEN CREATE

### Creqte Schema.sql to manage collection : add an extension to mamage UUID

```
CREATE EXTENSION "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Create extention to database

`psql -U cruddur < db/schema.sql -h localhost -U postgres`

![image]()

Be carefull to be on the right directory

- PSQL identifier

```
export CONNECTION_URL='postgresql://postgres:password@localhost:5432/cruddur'
gp env CONNECTION_URL='postgresql://postgres:password@localhost:5432/cruddur'
```

```
PROD_CONNECTION_URL='postgresql://cruddurroot:password@cruddur-db-instance.cmz7ann2jep1.ca-central-1.rds.amazonaws.com:5432/cruddur'
```

- Create 3 new files in bin folder :

- Then, add autorization to exec files with chmod

`chmod u+x ./bin/path`

### SED to maipulate string

### Source will knoW it is bash script

#### REALPATH to use it EVERYWHERE

Check bin folder

## Create our tables in Schema.sql

Default schema in postgres == public
use dirfferent domaim : use namesppace in postgres
