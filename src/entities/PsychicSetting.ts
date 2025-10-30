import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class PsychicSetting {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "text", nullable: true })
    bio!: string;

    @Column({ nullable: true })
    image!: string;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    minuteRate!: number;

    @OneToOne(() => User, user => user.psychicSetting)
    @JoinColumn()
    user!: User;
}
