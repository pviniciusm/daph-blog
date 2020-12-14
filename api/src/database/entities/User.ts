import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export default class User {
  @PrimaryColumn({
    type: 'varchar',
    length: 77
  })
  email: string;

  @Column({
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
}
