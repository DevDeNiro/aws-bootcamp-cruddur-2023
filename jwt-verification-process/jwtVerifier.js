import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { decode } from 'aws-jwt-verify';

const region = process.env.AWS_REGION;
const userpoolId = process.env.COGNITO_USERPOOL_ID;

const cognitoidentityserviceprovider = new CognitoIdentityServiceProvider({region});

// Error Handling
const verifyJwt = async (jwtToken) => {
  if (!jwtToken) {
    throw new Error('JWT token is required.');
  }

  const decoded = decode(jwtToken, {complete: true});

  if (!decoded || !decoded.payload) {
    throw new Error('Invalid JWT token.');
  }

  const {header, payload} = decoded;
 
  const params = {
    AccessToken: jwtToken,
  };
  
  try {
    const result = await cognitoidentityserviceprovider.getUser(params).promise();
    const username = result.Username;
    const userpool = result.UserPoolId;

    if (userpool !== userpoolId) {
      throw new Error('Invalid user pool ID.');
    }

    if (username !== payload['cognito:username']) {
      throw new Error('Invalid username.');
    }

    return {isValid: true, decoded: payload};
  } catch (error) {
    throw new Error(`Failed to verify JWT token: ${error.message}`);
  }
};

export default {verifyJwt};

