import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import User from './User';

@Entity()
export default class Post {
  @PrimaryColumn({
    type: 'varchar',
    length: 120,
    name: 'post_id'
  })
  postId: string;

  @ManyToOne(() => User, user => user.username, { onDelete: 'CASCADE', onUpdate: 'RESTRICT', primary: true })
  @JoinColumn({ name: 'username' })
  user: User;

  @Column({
    type: 'varchar',
    length: 60
  })
  title: string;

  @Column({
    type: 'varchar',
    length: 300
  })
  content: string;

  @UpdateDateColumn()
  updatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
