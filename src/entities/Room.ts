
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User";

@Entity()
export class Room {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User)
  client!: User;

  @ManyToOne(() => User)
  psychic!: User;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
