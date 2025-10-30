
import { Repository } from "typeorm";
import { Room } from "../entities/Room";
import { User } from "../entities/User";
import { roomRepository } from "../repositories/RoomRepository";
import { userRepository } from "../repositories/UserRepository";

export class RoomService {
  constructor(
    private roomRepository: Repository<Room>,
    private userRepository: Repository<User>
  ) {}

async createRoom(clientId: number, psychicId: number): Promise<Room> {
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

  // Check if a room already exists between these two users
  const existingRoom = await this.roomRepository.findOne({
    where: [
      { client: { id: clientId }, psychic: { id: psychicId } },
      { client: { id: psychicId }, psychic: { id: clientId } }, // Check reverse order too
    ],
    relations: ["client", "psychic", "psychic.psychicSetting"],
  });

  if (existingRoom) {
    return existingRoom;
  }

  // Create new room if none exists
  const room = this.roomRepository.create({
    client: client,
    psychic: psychic,
  });

  return this.roomRepository.save(room);
}

  async getRoomById(roomId: number): Promise<Room | null> {
    return this.roomRepository.findOne({
      where: { id: roomId },
      relations: ["client", "psychic"],
    });
  }
}
