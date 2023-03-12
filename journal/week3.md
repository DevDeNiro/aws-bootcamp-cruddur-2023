# Week 3 — Decentralized Authentication
## Userauthentification pages in FrontEnd :

In this sections, we are covering the establishment of SignUp / SignIn / Recovery / Confirmation pages.

- Create a new user pool. By doing this, only check email options attribute to signIn, otherwise you will get error in the sigIn stage because the username is configure as email allias :

To configure the user group sends emails to users, we will use cognito for now : SES on next session 🕒 
  
### Add Amplify 
 To managed auth to Cognito, we are going to use Amplify which is a JavaScript library that provides a set of utility functions and abstractions for simplifying the development of web applications. We use it to simplified the integration of Cognito. 
 
 To do so, we add to app.JS from frontend folder this line of codes to setup the [library](https://docs.amplify.aws/lib/auth/emailpassword/q/platform/js/) :

```js
import { Amplify } from 'aws-amplify';

Amplify.configure({
  "AWS_PROJECT_REGION": process.env.REACT_APP_AWS_PROJECT_REGION,
  "aws_cognito_region": process.env.REACT_APP_AWS_COGNITO_REGION,
  "aws_user_pools_id": process.env.REACT_APP_AWS_USER_POOLS_ID,
  "aws_user_pools_web_client_id": process.env.REACT_APP_CLIENT_ID,
  "oauth": {},
  Auth: {
    // We are not using an Identity Pool
    // identityPoolId: process.env.REACT_APP_IDENTITY_POOL_ID, // REQUIRED - Amazon Cognito Identity Pool ID
    region: process.env.REACT_AWS_PROJECT_REGION,           // REQUIRED - Amazon Cognito Region
    userPoolId: process.env.REACT_APP_AWS_USER_POOLS_ID,         // OPTIONAL - Amazon Cognito User Pool ID
    userPoolWebClientId: process.env.REACT_APP_CLIENT_ID,   // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
  }
});
```
After creating a user Group to AWS Cognito, set all the config env to ```gitpod.yml``` to persist variables :

```
 REACT_APP_BACKEND_URL: "https://4567-${GITPOD_WORKSPACE_ID}.${GITPOD_WORKSPACE_CLUSTER_HOST}"
 REACT_AWS_PROJECT_REGION: "${AWS_DEFAULT_REGION}"	
 REACT_APP_AWS_COGNITO_REGION: "${AWS_DEFAULT_REGION}"
 REACT_APP_AWS_USER_POOLS_ID: "ca-central-1_5r0t6Cmp9"
 REACT_APP_CLIENT_ID: "7ep5rqdpc12ufoj8a0e6jjevph"
```

- Now, we had to refractor the app to manage the Auth with cognito, and delete cookies validations 

#### In HomeFeedPage.js 

```js
// check if we are authenicated
  const checkAuth = async () => {
    Auth.currentAuthenticatedUser({
      // Optional, By default is false. 
      // If set to true, this call will send a 
      // request to Cognito to get the latest user data
      bypassCache: false 
    })
    .then((user) => {
      console.log('user',user);
      return Auth.currentAuthenticatedUser()
    }).then((cognito_user) => {
        setUser({
          display_name: cognito_user.attributes.name,
          handle: cognito_user.attributes.preferred_username
        })
    })
    .catch((err) => console.log(err));
  };
```

#### In profilInfo.js :

```js
import { Auth } from 'aws-amplify';

const signOut = async () => {
  try {
      await Auth.signOut({ global: true });
      window.location.href = "/"
  } catch (error) {
      console.log('error signing out: ', error);
  }
}
```

#### in SigninPage.js

```js
import { Auth } from 'aws-amplify';

 const onsubmit = async (event) => {
    event.preventDefault();
    setErrors('')
    console.log('onsubmit')
    if (Cookies.get('user.email') === email && Cookies.get('user.password') === password){
      Cookies.set('user.logged_in', true)
      window.location.href = "/"
    } else {
      setErrors("Email and password is incorrect or account doesn't exist")
    }
    return false
  }
```

Now, we can setup user mamually to Cognito to test signin page :

![image]()

Unfortunalty, it was not working, so we had to set manually with CLI a new user without verification to bypass JWT token : Cannot read properties of null (reading 'accessToken')

```aws sts get-caller-identity```

```aws cognito-idp admin-set-user-password --username noodles --password Testing1234! --user-pool-id ca-central-1_VswY8rYDh --permanent```

Then, add attribute to the user account and check if its added :  ![image]()

We can store now information on Cognito 

#### SignUp Page  

```
import { Auth } from 'aws-amplify';

  const onsubmit = async (event) => {
    event.preventDefault();
    setErrors('')
    console.log('username',username)
    console.log('email',email)
    console.log('name',name)
    try {
      const { user } = await Auth.signUp({
        username: email,
        password: password,
        attributes: {
          name: name,
          email: email,
          preferred_username: username,
        },
        autoSignIn: { // optional - enables auto sign in after user is confirmed
          enabled: true,
        }
      });
      console.log(user);
      window.location.href = `/confirm?email=${email}`
    } catch (error) {
        console.log(error);
        setErrors(error.message)
    }
    return false
  }
```


At this step, We had to recreate the user pool due to email / username error 

After adding the right property, SignIn -> Confirm the account by adding the verification code -> Login !

Check into the Cognito pannel to see if its verify :

#### confirmation page

```
const resend_code = async (event) => {
  setCognitoErrors('')
  try {
    await Auth.resendSignUp(email);
    console.log('code resent successfully');
    setCodeSent(true)
  } catch (err) {
    // does not return a code
    // does cognito always return english
    // for this to be an okay match?
    console.log(err)
    if (err.message == 'Username cannot be empty'){
      setCognitoErrors("You need to provide an email in order to send Resend Activiation Code")   
    } else if (err.message == "Username/client id combination not found."){
      setCognitoErrors("Email is invalid or cannot be found.")   
    }
  }
}

const onsubmit = async (event) => {
  event.preventDefault();
  setCognitoErrors('')
  try {
    await Auth.confirmSignUp(email, code);
    window.location.href = "/"
  } catch (error) {
    setCognitoErrors(error.message)
  }
  return false
}
```

#### Recovery page

```
import { Auth } from 'aws-amplify';

const onsubmit_send_code = async (event) => {
  event.preventDefault();
  setCognitoErrors('')
  Auth.forgotPassword(username)
  .then((data) => setFormState('confirm_code') )
  .catch((err) => setCognitoErrors(err.message) );
  return false
}

const onsubmit_confirm_code = async (event) => {
  event.preventDefault();
  setCognitoErrors('')
  if (password == passwordAgain){
    Auth.forgotPasswordSubmit(username, code, password)
    .then((data) => setFormState('success'))
    .catch((err) => setCognitoErrors(err.message) );
  } else {
    setCognitoErrors('Passwords do not match')
  }
  return false
```

Add the code and check if this working

## Prevent authentification request into the backend 

We had let cognito manage authentifiation to the front end, but now we are going to protect our API endpoints : Need to pass the access Token previously stored into the LocalStorage into the API calls

To do so, In HomeFeedPage.js, grab this code into loadData to get the token session from localStorage :

```
 headers: {
    Authorization: `Bearer ${localStorage.getItem("access_token")}`
  }
```

-> Read that value into the backend : app.py 

Update CORS method value like so : 

```
cors = CORS(
  app, 
  resources={r"/api/*": {"origins": origins}},
  expose_headers='Authorization',
  headers=['Content-Type', 'Authorization'], 
  methods="OPTIONS,GET,HEAD,POST"
)
```

#### Decode of the Access token 

To decode the access token, we are going to use the Flak-library Cognito from [Cgauge Github](https://github.com/cgauge/Flask-AWSCognito)

Firstly, add lib ```Flask-AWSCognito``` to requirememt.txt and install it : ```pip install -r requirememts.txt``` 

In the ```docker-compose.yml```, add :

```
AWS_COGNITO_USER_POOL_ID: "ca-central-1_EYBRBGBRi"
AWS_COGNITO_USER_POOL_CLIENT_ID: "3p7gve139nvis2k3ug3u4etfst" 		
```

- Create a new lib folder with the file [cognito_token_verification.py](https://github.com/Noodles-boop/aws-bootcamp-cruddur-2023/blob/62066571e243a43421a3941299102e1903f9f59b/backend-flask/lib/cognito_jwt_token.py)

- In app.py, import the new plugins we created : 

```from lib.cognito_jwt_token import CognitoJwtToken, extract_access_token, TokenVerifyError```

- Instantiate CognitoJwtToken to use parameters : 

```
cognito_jwt_token = CognitoJwtToken(
  user_pool_id=os.getenv("AWS_COGNITO_USER_POOL_ID"),
  user_pool_client_id=os.getenv("AWS_COGNITO_USER_POOL_CLIENT_ID"),
  region=os.getenv("AWS_DEFAULT_REGION")
)
```

- Update the route like so :

```
@app.route("/api/activities/home", methods=['GET'])
# @xray_recorder.capture('activities_home')
def data_home():
  access_token = extract_access_token(request.headers)
  try:
    claims = cognito_jwt_token.verify(access_token)
    # authenicatied request
    app.logger.debug("authenicated")
    app.logger.debug(claims)
    app.logger.debug(claims['username'])
    data = HomeActivities.run(cognito_user_id=claims['username'])
  except TokenVerifyError as e:
    # unauthenicatied request
    app.logger.debug(e)
    app.logger.debug("unauthenicated")
    data = HomeActivities.run()
  return data, 200
``` 

Now, if we login into our account, we can know values pass thought the container via logs :
It returning back the claims and verify we log in 

![image]()

However, we need to update the endpoint ```api/homepage/home``` : We're verifying if the user is authentificate :

```
if cognito_user_id != None:
        extra_crud = {
          'uuid': '248959df-3079-4947-b847-9e0892d1bab4',
          'handle':  'Lore',
          'message': 'My dear brother, it the humans that are the problem',
          'created_at': (now - timedelta(hours=1)).isoformat(),
          'expires_at': (now + timedelta(hours=12)).isoformat(),
          'likes': 1042,
          'replies': []
        }
        results.insert(0,extra_crud)

```

Token is still stored even if we logout, so the actual workaround is to clear the localStorage by adding to signOut function in ProfileInfo.js: ```localStorage.removeItem('access_token')```
