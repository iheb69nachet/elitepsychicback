
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import { User } from "./User";
import { Room } from "./Room";

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User)
  sender!: User;

  @Column("text")
  content!: string;

  @ManyToOne(() => Room)
  room!: Room;

  @CreateDateColumn()
  createdAt!: Date;
}
