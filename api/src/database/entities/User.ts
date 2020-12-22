import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

export enum UserRole {
  ADMIN = 'A',
  SUPERUSER = 'S',
  USER = 'U'
}

@Entity()
export default class User {
  @Column({
    type: 'varchar',
    length: 77
  })
  email: string;

  @PrimaryColumn({
    type: 'varchar',
    length: 30
  })
  username: string;

  @Column({
    type: 'varchar',
    length: 50,
    select: false
  })
  password: string;

  @Column({
    type: 'varchar',
    length: 50
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 50
  })
  lastName: string;

  @UpdateDateColumn()
  updatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @Column({
    type: 'character',
    default: UserRole.USER
  })
  role: UserRole;
}
