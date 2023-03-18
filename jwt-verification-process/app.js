import express from 'express';
import { verifyJwt } from './jwtVerifier';

const app = express();
const port = process.env.PORT || 3000;

app.get('/verify', async (req, res) => {
  const jwtToken = req.headers.authorization;
  if (!jwtToken) {
    res.status(401).send('JWT token not provided');
  } else {
    try {
      const {isValid, decoded} = await verifyJwt(jwtToken);
      if (isValid) {
        res.status(200).json(decoded);
      } else {
        res.status(401).send('JWT token is not valid');
      }
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
