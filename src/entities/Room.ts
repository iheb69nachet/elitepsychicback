
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
} from "typeorm";
import { User } from "./User";

export enum ChatStatus {
  ACTIVE = "active",
  ENDED = "ended",
}

@Entity()
export class Room {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User)
  client!: User;

  @ManyToOne(() => User)
  psychic!: User;

  @Column({
    type: "enum",
    enum: ChatStatus,
    default: ChatStatus.ACTIVE,
  })
  status!: ChatStatus;

  @Column({ default: false })
  clientJoined!: boolean;

  @Column({ default: false })
  psychicJoined!: boolean;

  @Column({ default: false })
  timerStarted!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
