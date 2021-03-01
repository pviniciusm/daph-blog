import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, UpdateDateColumn } from 'typeorm';
import User from './User';

@Entity()
export default class Follow {
  @ManyToOne(() => User, user => user.username, { onDelete: 'CASCADE', onUpdate: 'RESTRICT', primary: true })
  @JoinColumn({ name: 'sender_username' })
  senderUser: User;

  @ManyToOne(() => User, user => user.username, { onDelete: 'CASCADE', onUpdate: 'RESTRICT', primary: true })
  @JoinColumn({ name: 'receiver_username' })
  receiverUser: User;

  @Column({
    type: 'varchar',
    length: 60,
    nullable: true
  })
  title: string;

  @Column({
    type: 'boolean',
    default: false
  })
  isPending: boolean;

  @UpdateDateColumn()
  updatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
