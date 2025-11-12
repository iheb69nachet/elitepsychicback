
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, DeleteDateColumn, OneToMany, OneToOne } from "typeorm";
import { Role } from "./Role";
import { PsychicSetting } from "./PsychicSetting";


export enum UserStatus {
  ACTIVE = "active",
  PENDING = "pending",
  BLOCKED = "blocked",
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  email!: string;

  @Column({ type: "date", nullable: true })
  birthdate?: Date;

  @Column({ nullable: true })
  password?: string;

  @Column({
    type: "enum",
    enum: UserStatus,
    default: UserStatus.PENDING,
  })
  status!: UserStatus;

  @Column({ default: 0 })
  balance!: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ default: false })
  isOnline!: boolean;

  @Column({ nullable: true }) // New socketId column
  socketId?: string;

  @ManyToOne(() => Role)
  role!: Role;

  @DeleteDateColumn()
  deletedAt?: Date;

  @OneToOne(() => PsychicSetting, psychicSetting => psychicSetting.user)
  psychicSetting?: PsychicSetting;

  @Column({ nullable: true })
  refreshToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  refreshTokenExpires?: Date;
}
