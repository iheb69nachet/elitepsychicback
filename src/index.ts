
require('dotenv').config();
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { AppDataSource } from './data-source';
import userRoutes from './routes/userRoutes';
import blogRoutes from './routes/blogRoutes';
import createChatRoutes from './routes/chatRoutes';
import createRoomRoutes from './routes/roomRoutes';


import http from 'http';
import { Server } from 'socket.io';
import { UserService } from './services/UserService';

const cors=require('cors');
const app = express();
app.use(cors());
app.use(cookieParser());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

app.use(bodyParser.json());

app.use('/uploads', express.static('uploads'));

import { ChatService } from './services/ChatService';
import { Message } from './entities/Message';
import { User } from './entities/User';
import { ChatRequest } from './entities/ChatRequest';

AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
    const messageRepository = AppDataSource.getRepository(Message);
    const userRepository = AppDataSource.getRepository(User);
    const userService = new UserService();
    const chatRequestRepository = AppDataSource.getRepository(ChatRequest); // Get the instance
    const chatService = new ChatService(messageRepository, userRepository, userService, chatRequestRepository,roomRepository); // Pass the instance
    chatService.init(io);

    const balanceUpdateWorker = new BalanceUpdateWorker(io);
    console.log("BalanceUpdateWorker instantiated.");
    balanceUpdateWorker.start();

    app.use('/api', createChatRoutes(chatService));

    
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
import { ChatRequestRepository } from './repositories/ChatRequestRepository';
import { roomRepository } from './repositories/RoomRepository';
import { BalanceUpdateWorker } from './workers/BalanceUpdateWorker';


app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', packageRoutes);
app.use('/api', stripeRoutes);
app.use('/api', psychicSettingRoutes);
app.use('/api', blogRoutes);
app.use('/api', createRoomRoutes(io));
import remedyAndSpellRoutes from './routes/remedyAndSpellRoutes';
app.use('/api', remedyAndSpellRoutes);




const port = process.env.PORT || 9001;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
