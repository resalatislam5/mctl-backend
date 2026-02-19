import { createServer } from 'http';
import app from './app';
import connectDB from './db/connectDB';

const server = createServer(app);
const PORT = process.env.PORT || 4041;
import { config } from 'dotenv';
config();

const main = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.log(err);
  }
};

main();
