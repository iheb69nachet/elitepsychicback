
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Package {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  balance!: number;

  @Column()
  price!: number;

  @Column()
  color!: string;
}
