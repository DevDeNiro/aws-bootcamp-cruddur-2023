# Week 3 — Decentralized Authentication
## User Authentification pages in FrontEnd :

In this sections, we are covering the establishment of SignUp / SignIn / Recovery / Confirmation pages.

- Create a new user pool using the wizard of AWS. By doing this, only check email options attribute to signIn, otherwise you will get error in the sigIn stage because the username is configure as email allias :

Creation of the user pool :

![image](https://github.com/Noodles-boop/aws-bootcamp-cruddur-2023/blob/97a9000e0c00fcdca949feccff8d52d933d8927a/_docs/assets/week3/user%20pool%20CREATED.png)

To configure the user group sends emails to users, we will use cognito for now : SES on next session 🕒 
  
### Add Amplify 

Install sdk on frontend folder :
```npm i aws-amplify --save```

To managed auth to Cognito, we are going to use Amplify which is a JavaScript library that provides a set of utility functions and abstractions for simplifying the development of our web applications. We use it to simplified the integration of Cognito. 
 
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

#### Add HomeFeedPage.js 

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

#### Add profilInfo.js :

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

#### Add SigninPage.js

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

![image](https://github.com/Noodles-boop/aws-bootcamp-cruddur-2023/blob/97a9000e0c00fcdca949feccff8d52d933d8927a/_docs/assets/week3/add%20attribute%20to%20user%20grp.png)

Unfortunalty, it was not working, so we had to set manually with CLI a new user without verification to bypass JWT token : Cannot read properties of null (reading 'accessToken')

```aws sts get-caller-identity```

```aws cognito-idp admin-set-user-password --username noodles --password Testing1234! --user-pool-id ca-central-1_VswY8rYDh --permanent```

Then, add attribute to the user account and check if you can connect :  

![image](https://github.com/Noodles-boop/aws-bootcamp-cruddur-2023/blob/97a9000e0c00fcdca949feccff8d52d933d8927a/_docs/assets/week3/attributes%20added%20.png)

The user login is now stored on Cognito 

#### Add SignUp Page  

```js
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

Check into the Cognito pannel to see if the account is verify :

![image](https://github.com/Noodles-boop/aws-bootcamp-cruddur-2023/blob/11e4b4d5610f203b771ddb1e26a55ad347f11753/_docs/assets/week3/user%20group%20verify.png)

#### In Confirmation page

```js
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

#### In Recovery page

```js
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

```py
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

```py
cognito_jwt_token = CognitoJwtToken(
  user_pool_id=os.getenv("AWS_COGNITO_USER_POOL_ID"),
  user_pool_client_id=os.getenv("AWS_COGNITO_USER_POOL_CLIENT_ID"),
  region=os.getenv("AWS_DEFAULT_REGION")
)
```

- Update the route like so :

```py
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

![image](https://github.com/Noodles-boop/aws-bootcamp-cruddur-2023/blob/97a9000e0c00fcdca949feccff8d52d933d8927a/_docs/assets/week3/token%20infos%20recup%20from%20logs.png)

However, we need to update the endpoint ```api/homepage/home``` : We're verifying if the user is authentificate :

```py
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

## Try to write a Flask Middleware

To do so, i'll try to do something like this :

- Implement a middleware using the ```CognitoJwtToken``` class to bind parameters :

```py
class JwtMiddleware:
    def __init__(self,  user_pool_id, user_pool_client_id, region):
        self.jwt_token = CognitoJwtToken(user_pool_id, user_pool_client_id, region)

    def __call__(self, environ, start_response):
        path = request.path
        if path.startswith('/api'):
            auth_header = request.headers.get('Authorization', None)
            if auth_header:
                token = auth_header.split(' ')[1]
                try:
                    claims = self.jwt_token.verify(token)
                    request.environ['jwt_claims'] = claims
                except Exception as e:
                    response = Response(str(e), status=401)
                    return response(environ, start_response)
        return self.app(environ, start_response)
```

- Call it by instanciate the class from ```app.py``` 

```py
cognito_jwt_token = JwtMiddleware(
  user_pool_id=os.getenv("AWS_COGNITO_USER_POOL_ID"),
  user_pool_client_id=os.getenv("AWS_COGNITO_USER_POOL_CLIENT_ID"),
  region=os.getenv("AWS_DEFAULT_REGION")
)
```

- Starting to lauch a new branch to return logic :

```py
@app.route('/protected')
def protected_route():
    jwt_claims = request.environ.get('jwt_claims')
    if jwt_claims:
        user_status = jwt_claims.get('user_status')
        if user_status == 'active':
            return 'You have access to the protected route.'
        else:
            return 'Your account is not active.'
    else:
        return 'You must be logged in to access this route.'
```

Unfortunately, it's doesnt work ;(. 

- Firstly, i got a CORS exception on the client side

![image](https://github.com/Noodles-boop/aws-bootcamp-cruddur-2023/blob/11e4b4d5610f203b771ddb1e26a55ad347f11753/_docs/assets/week3/Cors%20Exception.png)

- furthermore, the user is not pass on the serveur side 

By the way, I took the opportunity to change the error message to have something look more familiar ^^ 

```js
  { path:"*",
     element: <PageNotFound />
  }

function PageNotFound() {
  return (
    <div className='body-error'>
      <h1>404 Not Found</h1>
      <p className='Link'>The page you are looking for does not exist.</p>
        <Link to = '/' >Go back to home page</Link>
    </div>
  );
}
```

![image](https://github.com/Noodles-boop/aws-bootcamp-cruddur-2023/blob/11e4b4d5610f203b771ddb1e26a55ad347f11753/_docs/assets/week3/Error%20msg.png)

## Implement a Container Sidecar Pattern using official Aws-jwt-verify.js library


- To try to implememt this step, i first start by create a new folder where my Dockerfile will exist

```
FROM node:16.18
WORKDIR /jwt-verification-process
RUN npm install aws-jwt-verify
COPY . .
CMD ["npm", "start"]
```

- I bind this new container with the front one like so : 

```
sidecar:
    build: ./jwt-verification-process
    volumes:
    - ./jwt-verification-process:/jwt-verification-process
    - ./frontend-react-js:/frontend-react-js
```

- Inside my new folder, i created a new [jwtVerifier.js](https://github.com/Noodles-boop/aws-bootcamp-cruddur-2023/blob/30deb5392d5b555c44826540c7fa291a8256aa13/jwt-verification-process/jwtVerifier.js) which will have to handle the verification of JWT 

This code exports a function called ```verifyJwt``` that takes a JWT token as an input and verifies whether it is valid by decoding and checking against the user pool and user name in the Amazon Cognito user pool.

- Finally, i just have to import the function and use the global variable configure by Amplify to check if the JWT is okay or not :

```js
async function main() {
  const jwtToken = 'YOUR_JWT_TOKEN_HERE';
  const {isValid, decoded} = await jwtVerifier.verifyJwt(jwtToken);
  if (isValid) {
    console.log(`JWT token is valid. Decoded contents: ${JSON.stringify(decoded)}`);
  } else {
    console.log('JWT token is not valid');
  }
}

main();
```
