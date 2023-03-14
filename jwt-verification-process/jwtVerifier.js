import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { decode } from 'aws-jwt-verify';

const region = process.env.AWS_REGION;
const userpoolId = process.env.COGNITO_USERPOOL_ID;

const cognitoidentityserviceprovider = new CognitoIdentityServiceProvider({region});

const verifyJwt = async (jwtToken) => {
  const decoded = decode(jwtToken);
  const params = {
    AccessToken: jwtToken,
  };
  const result = await cognitoidentityserviceprovider.getUser(params).promise();
  const username = result.Username;
  const userpool = result.UserPoolId;
  const isValid = userpool === userpoolId && username === decoded['cognito:username'];
  return {isValid, decoded};
};

export default {verifyJwt};
