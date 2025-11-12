import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { User } from "./User";

export enum ChatRequestStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  CANCELLED = "cancelled",
}

@Entity()
export class ChatRequest {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, { eager: true })
  client!: User;

  @Column()
  clientId!: number;

  @ManyToOne(() => User, { eager: true })
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
