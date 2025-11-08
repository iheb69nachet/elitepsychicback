import redisClient from '../redis';
import { roomRepository } from '../repositories/RoomRepository';
import { userRepository } from '../repositories/UserRepository';
import { Server } from 'socket.io';

export class BalanceUpdateWorker {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    console.log("BalanceUpdateWorker constructor called.");
  }

  public async start() {
    console.log('BalanceUpdateWorker started, listening for balance_update_queue...');
    while (true) {
      try {
        const result = await redisClient.brpop('balance_update_queue', 1); // 0 means block indefinitely
        if (result) {
          const roomId = parseInt(result[1], 10);
          await this.processBalanceUpdate(roomId);
        }
      } catch (error) {
        console.error('Error in BalanceUpdateWorker:', error);
        // Implement a delay before retrying to prevent a tight loop on persistent errors
        await new Promise(resolve => setTimeout(resolve, 5000)); 
      }
    }
  }

  private async processBalanceUpdate(roomId: number) {
    const room = await roomRepository.findOne({
      where: { id: roomId },
      relations: ["client", "psychic", "psychic.psychicSetting"],
    });

    if (!room || !room.client || !room.psychic || !room.psychic.psychicSetting) {
      console.error(`Room, client, psychic, or psychic setting not found for roomId: ${roomId}`);
      return;
    }

    const client = room.client;
    const psychic = room.psychic;

    const psychicMinuteRate = room.psychic.psychicSetting.minuteRate;

    if (parseFloat(client.balance) <= 0) {
      console.log(`Client ${client.id} has insufficient balance. Ending chat.`);
      this.io.to(client.id.toString()).emit("chatEnded", { reason: "insufficient_balance" });
      return;
    }

    const costPerSecond = psychicMinuteRate ; 

    
    client.balance = (parseFloat(client.balance) - costPerSecond).toString();
    // console.log(`Client ${client.id} balance updated to: ${client.balance}`);
    
    psychic.balance = (parseFloat(psychic.balance) + costPerSecond).toString();

    await userRepository.save(client);
    await userRepository.save(psychic);

    console.log(`Client ${client.id} balance updated to: ${client.balance}`);
    console.log(`Psychic ${psychic.id} balance updated to: ${psychic.balance}`);



  }
}
