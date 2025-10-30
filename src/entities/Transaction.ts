
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { User } from "./User";
import { Package } from "./Package";

export enum TransactionStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
}

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User)
  user!: User;

  @ManyToOne(() => Package)
  package!: Package;

  @Column()
  amount!: number;

  @Column({
    type: "enum",
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status!: TransactionStatus;

  @Column({ nullable: true })
  stripeSessionId?: string;

  @CreateDateColumn()
  createdAt!: Date;
}
