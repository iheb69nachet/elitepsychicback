import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

export enum BlogStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
}

@Entity()
export class Blog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column("text")
  content!: string;

  @Column({ nullable: true })
  image?: string;

  @Column({
    type: "enum",
    enum: BlogStatus,
    default: BlogStatus.DRAFT,
  })
  status!: BlogStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
