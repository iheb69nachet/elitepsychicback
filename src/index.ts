require('dotenv').config();
import express from 'express';
import bodyParser from 'body-parser';
import { AppDataSource } from './data-source';
import userRoutes from './routes/userRoutes';
import blogRoutes from './routes/blogRoutes';
import createChatRoutes from './routes/chatRoutes';
import http from 'http';
import { Server } from 'socket.io';


import { UserService } from './services/UserService';
import { ChatService } from './services/ChatService';
import { Message } from './entities/Message';
import { ChatRequest } from './entities/ChatRequest';
import { Room } from './entities/Room';
import { PsychicSetting } from './entities/PsychicSetting';
import { User } from './entities/User';

const cors=require('cors');
const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

io.on("connection", (socket) => {
  console.log("✅ User connected to WebSocket");

  socket.on("login", async (data) => {
    console.log({data});
    
    // data=JSON.parse(data);
    let {userId}=data
    console.log(`User ${userId} attempting to log in via WebSocket.`);
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ id: userId });

    if (user) {
      user.isOnline = true;
      user.socketId = socket.id;
      await userRepository.save(user);
      console.log(`User ${userId} logged in. Socket ID: ${socket.id}`);
      // Optionally, emit a success event back to the client
      socket.emit("loginSuccess", { userId: user.id, isOnline: user.isOnline });
    } else {
      console.log(`User ${userId} not found.`);
      // Optionally, emit a failure event back to the client
      socket.emit("loginFailure", { message: "User not found" });
    }
  });

  socket.on("disconnect", async () => {
    console.log("❌ User disconnected from WebSocket");
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ socketId: socket.id });

    if (user) {
      user.isOnline = false;
      user.socketId = undefined; // Assign undefined instead of null
      await userRepository.save(user);
      console.log(`User ${user.id} logged out. Socket ID: ${socket.id}`);
    }
  });
});

app.use(bodyParser.json());

app.use('/uploads', express.static('uploads'));

AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
    const userRepository = AppDataSource.getRepository(User);
    const userService = new UserService();

    // New chat-related repository instantiations
    const messageRepository = AppDataSource.getRepository(Message);
    const chatRequestRepository = AppDataSource.getRepository(ChatRequest);
    const roomRepository = AppDataSource.getRepository(Room);
    const psychicSettingRepository = AppDataSource.getRepository(PsychicSetting);

    // New ChatService instantiation and initialization
    const chatService = new ChatService(
      messageRepository,
      userRepository,
      userService,
      chatRequestRepository,
      roomRepository,
      psychicSettingRepository
    );
    chatService.init(io);

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


app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', packageRoutes);
app.use('/api', stripeRoutes);
app.use('/api', psychicSettingRoutes);
app.use('/api', blogRoutes);
import remedyAndSpellRoutes from './routes/remedyAndSpellRoutes';
app.use('/api', remedyAndSpellRoutes);




const port = process.env.PORT || 9001;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});