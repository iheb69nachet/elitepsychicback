
import { Repository } from "typeorm";
import { Room } from "../entities/Room";
import { User } from "../entities/User";
import { roomRepository } from "../repositories/RoomRepository";
import { userRepository } from "../repositories/UserRepository";

import { Server } from "socket.io";

export class RoomService {
  constructor(
    private roomRepository: Repository<Room>,
    private userRepository: Repository<User>
  ) {}

async createRoom(clientId: number, psychicId: number, io: Server): Promise<Room> {
  const client = await this.userRepository.findOne({
    where: { id: clientId },
    relations: ["role"],
  });
  const psychic = await this.userRepository.findOne({
    where: { id: psychicId },
    relations: ["role", "psychicSetting"],
  });

  if (!client || !psychic) {
    throw new Error("Client or psychic not found");
  }
if (Number(client.balance) <= 0) {
    console.log('no balance');
    // throw new Error("No balance");
    
  }
  console.log({client});
  

  // Check if a room already exists between these two users
  const existingRoom = await this.roomRepository.findOne({
    where: [
      { client: { id: clientId }, psychic: { id: psychicId } },
      { client: { id: psychicId }, psychic: { id: clientId } }, // Check reverse order too
    ],
    relations: ["client", "psychic", "psychic.psychicSetting"],
  });

  if (existingRoom) {
      io.emit("roomid", existingRoom);
    return existingRoom;
  }

  // Create new room if none exists
  const room = this.roomRepository.create({
    client: client,
    psychic: psychic,
  });

  const savedRoom = await this.roomRepository.save(room);
  console.log(io);
      io.emit("roomid", savedRoom);
  

  return savedRoom;
}

  async getRoomById(roomId: number): Promise<Room | null> {
    return this.roomRepository.findOne({
      where: { id: roomId },
      relations: ["client", "psychic"],
    });
  }
}
