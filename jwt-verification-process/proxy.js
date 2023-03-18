import express, { json } from 'express';
import axios from 'axios';
import { verify } from 'aws-jwt-verify';
import { CognitoIdentityServiceProvider } from 'aws-sdk';

const app = express();
const port = process.env.PORT || 3001;

const region = process.env.AWS_REGION;
const userpoolId = process.env.COGNITO_USERPOOL_ID;
const cognitoidentityserviceprovider = new CognitoIdentityServiceProvider({ region });

app.use(json());

app.use(async (req, res, next) => {
  const jwtToken = req.headers.authorization;
  if (!jwtToken) {
    res.status(401).send('JWT token not provided');
  } else {
    try {
      const { isValid, decoded } = await verify(jwtToken, {
        issuer: `https://cognito-idp.${region}.amazonaws.com/${userpoolId}`,
      });
      if (isValid) {
        req.user = decoded;
        next();
      } else {
        res.status(401).send('JWT token is not valid');
      }
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
});

app.use((req, res, next) => {
  const { method, url, headers, body } = req;
  const options = {
    method,
    url: process.env.BACKEND_API_URL + url,
    headers: {
      ...headers,
      Authorization: req.headers.authorization,
    },
    data: body,
  };
  axios(options)
    .then((response) => {
      res.status(response.status).json(response.data);
    })
    .catch((error) => {
      res.status(error.response.status).json(error.response.data);
    });
});

app.listen(port, () => {
  console.log(`Proxy service started on port ${port}`);
});
