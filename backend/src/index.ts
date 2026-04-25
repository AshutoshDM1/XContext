import express from 'express';
import router from './router/router';
const port = process.env.PORT || 3000;

const app = express();
app.use(express.json());

app.use('/api/v1', router);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the XContext API' });
});

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
