
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class RemedyAndSpell {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column()
  image!: string;

  @Column('text')
  description!: string;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  price!: number;
}
