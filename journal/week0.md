# Week 0 — Billing and Architecture :

### Conceptual Diagram
![image](https://github.com/Noodles-boop/aws-bootcamp-cruddur-2023/blob/25bdf2b82cda361811cd0bde9c19833b3ae9271f/_docs/assets/Cruddur%20Conceptual%20diagram.png)

Here's a link to [share on Lucid Chart](https://lucid.app/lucidchart/invitations/accept/inv_71f2907e-caea-4129-9ada-b973e446b735)

### Logical Architecture :

![image](https://github.com/Noodles-boop/aws-bootcamp-cruddur-2023/blob/25bdf2b82cda361811cd0bde9c19833b3ae9271f/_docs/assets/Cruddur%20logical%20diagram.png)

### Creation of IAM admin usage with access key :
![image]()

### Installing AWS CLI using our GitPod account :
From within my GitPod terminal, I did the following:
1. `curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"` --> this will download the binary files & save it as awscliv2.zip
2. `unzip awscliv2.zip` -> just unpacks our archived file
3. `sudo ./aws/install`


#### Configure User Credentials to use CloudShell :
To configure User Credentials via the CLI, i Change the values and export at the terminal as seen in this image:
![image]()

Verify using `aws sts get-caller-identity`; Now, we coud see my user credentials.
![image]()

#### GitPod Configuration :
To avoid having to reconfigure our environment variables every time Gitpod was launched, we made sure to save them in the software configuration. To do this, we use the script from from [Andrew Brown's repo](https://github.com/omenking/aws-bootcamp-cruddur-2023/blob/week-0/journal/week0.md) which aws-cli is installed and set the cli prompt to auto-complete :
```
tasks:
  - name: aws-cli
    env:
      AWS_CLI_AUTO_PROMPT: on-partial
    init: |
      cd /workspace
      curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
      unzip awscliv2.zip
      sudo ./aws/install
      cd $THEIA_WORKSPACE_ROOT
```
*__Persisting earlier exported values to GitPod's workspace, use:__* `gp env <AWS_ENV_VARIABLE>=<AWS_VALUE>`
  
#### Create Budget with notifications : 
To create Budget via AWS CLI, we based ourselves on the [CLI Documentation](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/budgets/create-budget.html) 

We persist the Account ID variable using: `gp env AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)`. After creating the respective `json` files for the budget and notification, you can run this command in terminal:
```
  aws budgets create-budget \
    --account-id $AWS_ACCOUNT_ID \
    --budget file://aws/json/budget.json \
    --notifications-with-subscribers file://aws/json/budget-notifications-with-subscribers.json
```
![image]()


#### Create SNS Topic :
To create a topic, use aws sns create-topic --name evebootcamp-billing-alarm. You must then register to receive a notification. To subscribe, use:
```
aws sns subscribe \
    --topic-arn="arn:aws:sns:us-east-1:<your_acct_id>:<your_topic_name>" \
    --protocol=email \
    --notification-endpoint=everlygrandest+bootcamp@gmail.com
```
![image]()


#### Creating a Billing Alarm :
Using this [json file](https://github.com/omenking/aws-bootcamp-cruddur-2023/blob/week-0/aws/json/alarm_config.json.example), we will be updating the `arn` on line 6 to our previously created Topic `arn`. Then, run the `aws cloudwatch put-metric-alarm --cli-input-json file://aws/json/alarm_config.json` command to set up the alarm

![image]()
