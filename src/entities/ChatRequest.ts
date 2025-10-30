import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { User } from "./User";

export enum ChatRequestStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
}

@Entity()
export class ChatRequest {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "clientId" })
  client!: User;

  @Column()
  clientId!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "psychicId" })
  psychic!: User;

  @Column()
  psychicId!: number;

  @Column({
    type: "enum",
    enum: ChatRequestStatus,
    default: ChatRequestStatus.PENDING,
  })
  status!: ChatRequestStatus;

  @CreateDateColumn()
  createdAt!: Date;
}
