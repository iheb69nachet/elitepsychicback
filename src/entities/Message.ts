import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { User } from "./User";
import { Room } from "./Room";

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, { eager: true })
  sender!: User;

  @ManyToOne(() => Room, { eager: true })
  room!: Room;

  @Column({ type: "text" })
  content!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
