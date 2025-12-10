import type { Request, Response } from 'express';

const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const port = 5173;

// Middleware to parse JSON bodies
app.use(bodyParser.json());
// Enable CORS for all routes
app.use(cors());


app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
}); 