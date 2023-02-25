# Week 0 — Billing and Architecture :

#### Conceptual Diagram :
![image](https://github.com/Noodles-boop/aws-bootcamp-cruddur-2023/blob/25bdf2b82cda361811cd0bde9c19833b3ae9271f/_docs/assets/Cruddur%20Conceptual%20diagram.png)

Here's a link to [share on Lucid Chart](https://lucid.app/lucidchart/invitations/accept/inv_71f2907e-caea-4129-9ada-b973e446b735)

#### Logical Architecture :

![image](https://github.com/Noodles-boop/aws-bootcamp-cruddur-2023/blob/25bdf2b82cda361811cd0bde9c19833b3ae9271f/_docs/assets/Cruddur%20logical%20diagram.png)

### Creation of IAM admin usage with access key :
![image](https://github.com/Noodles-boop/aws-bootcamp-cruddur-2023/blob/44871ec0f5f57d2a260b6200eb0bb99f817fc3bd/_docs/assets/user%20mfa%20&%20cloudshell%20link.png)

### Installing AWS CLI using our GitPod account :
From within my GitPod terminal, i did the following:
1. `curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"` ==> download the binary files & save it as awscliv2.zip
2. `unzip awscliv2.zip` 
3. `sudo ./aws/install`

### Configure User Credentials to use CloudShell :
To configure User Credentials via the CLI, i Change the values and export at the terminal link this : 
```
export AWS_ACCESS_KEY_ID=""
export AWS_SECRET_ACCESS_KEY=""
export AWS_DEFAULT_REGION=us-east-1
```
Then, to verify if it's work, we can do `aws sts get-caller-identity` :
![image](https://github.com/Noodles-boop/aws-bootcamp-cruddur-2023/blob/3d182c61ca6e3942bee8338288a0519d7e81f54b/_docs/assets/week0/AWS%20identity.png)

### GitPod Configuration :
To avoid having to reconfigure our environment variables every time Gitpod was launched, we made sure to save them in the software configuration. To do this, we use the script from [Andrew Brown's repo](https://github.com/omenking/aws-bootcamp-cruddur-2023/blob/week-0/journal/week0.md) which aws-cli is installed and set the cli prompt to auto-complete :
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
Then, to persist update on cloud environment : `gp env <AWS_ENV_VARIABLE>=<AWS_VALUE>`

![image](https://github.com/Noodles-boop/aws-bootcamp-cruddur-2023/blob/44871ec0f5f57d2a260b6200eb0bb99f817fc3bd/_docs/assets/aws%20grep%20info.png)
  
### Create Budget with notifications : 
To create Budget via AWS CLI, we based ourselves on the [CLI Documentation](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/budgets/create-budget.html) 

We persist the Account ID variable using: `gp env AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)`. After creating the respective `json` files for the budget and notification, you can run this command in terminal:
```
  aws budgets create-budget \
    --account-id $AWS_ACCOUNT_ID \
    --budget file://aws/json/budget.json \
    --notifications-with-subscribers file://aws/json/budget-notifications-with-subscribers.json
```
![image](https://github.com/Noodles-boop/aws-bootcamp-cruddur-2023/blob/44871ec0f5f57d2a260b6200eb0bb99f817fc3bd/_docs/assets/aws%20budget%20created.png)


### Create SNS Topic :
To create a topic, use aws sns create-topic --name evebootcamp-billing-alarm. You must then register to receive a notification. To subscribe, use:
```
aws sns subscribe \
    --topic-arn="arn:aws:sns:us-east-1:<your_acct_id>:<your_topic_name>" \
    --protocol=email \
    --notification-endpoint=everlygrandest+bootcamp@gmail.com
```
![image](https://github.com/Noodles-boop/aws-bootcamp-cruddur-2023/blob/44871ec0f5f57d2a260b6200eb0bb99f817fc3bd/_docs/assets/aws%20billing%20alarm.png)

![image](https://github.com/Noodles-boop/aws-bootcamp-cruddur-2023/blob/eefbd9f8801cf0ca781ddeb8ea30d4953ac543e9/_docs/assets/week0/aws%20billing%20alarm.png)

### Creating a Billing Alarm :
Using this [json file](https://github.com/omenking/aws-bootcamp-cruddur-2023/blob/week-0/aws/json/alarm_config.json.example), we will be updating the `arn` section. Then, do the `aws cloudwatch put-metric-alarm --cli-input-json file://aws/json/alarm_config.json` command to set up the alarm

![image](https://github.com/Noodles-boop/aws-bootcamp-cruddur-2023/blob/44871ec0f5f57d2a260b6200eb0bb99f817fc3bd/_docs/assets/aws%20billing%20alarm%20setup.png)
