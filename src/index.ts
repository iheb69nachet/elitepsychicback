
require('dotenv').config();
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { AppDataSource } from './data-source';
import userRoutes from './routes/userRoutes';
import blogRoutes from './routes/blogRoutes';


import { UserService } from './services/UserService';

const cors=require('cors');
const app = express();
app.use(cors());
app.use(cookieParser());

app.use(bodyParser.json());

app.use('/uploads', express.static('uploads'));

import { User } from './entities/User';

AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
    const userRepository = AppDataSource.getRepository(User);
    const userService = new UserService();
  })
  .catch((err) => {
    console.error('Error during Data Source initialization:', err);
  });

import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
import authRoutes from './routes/authRoutes';
import packageRoutes from './routes/packageRoutes';
import stripeRoutes from './routes/stripeRoutes';
import psychicSettingRoutes from './routes/psychicSettingRoutes';


app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', packageRoutes);
app.use('/api', stripeRoutes);
app.use('/api', psychicSettingRoutes);
app.use('/api', blogRoutes);
import remedyAndSpellRoutes from './routes/remedyAndSpellRoutes';
app.use('/api', remedyAndSpellRoutes);




const port = process.env.PORT || 9001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
