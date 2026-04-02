import { Entity } from '@/shared/domain/entities/Entity';

export type FriendshipStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface FriendshipProps {
  requesterId: string;
  addresseeId: string;
  status: FriendshipStatus;
  createdAt: Date;
  acceptedAt?: Date;
}

export class Friendship extends Entity<FriendshipProps> {
  constructor(props: FriendshipProps, id?: string) {
    super(props, id);
    this.validate();
  }

  get requesterId(): string {
    return this.props.requesterId;
  }

  get addresseeId(): string {
    return this.props.addresseeId;
  }

  get status(): FriendshipStatus {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get acceptedAt(): Date | undefined {
    return this.props.acceptedAt;
  }

  get isPending(): boolean {
    return this.props.status === 'PENDING';
  }

  get isAccepted(): boolean {
    return this.props.status === 'ACCEPTED';
  }

  get isRejected(): boolean {
    return this.props.status === 'REJECTED';
  }

  private validate(): void {
    if (!this.props.requesterId) {
      throw new Error('Requester ID is required');
    }
    if (!this.props.addresseeId) {
      throw new Error('Addressee ID is required');
    }
    if (this.props.requesterId === this.props.addresseeId) {
      throw new Error('Cannot create friendship with yourself');
    }
  }

  accept(): Friendship {
    if (this.props.status !== 'PENDING') {
      throw new Error('Can only accept pending friendships');
    }
    return new Friendship(
      {
        ...this.props,
        status: 'ACCEPTED',
        acceptedAt: new Date()
      },
      this.id
    );
  }

  reject(): Friendship {
    if (this.props.status !== 'PENDING') {
      throw new Error('Can only reject pending friendships');
    }
    return new Friendship(
      {
        ...this.props,
        status: 'REJECTED'
      },
      this.id
    );
  }

  involvesUser(userId: string): boolean {
    return this.props.requesterId === userId || this.props.addresseeId === userId;
  }

  getOtherUserId(userId: string): string {
    if (this.props.requesterId === userId) return this.props.addresseeId;
    if (this.props.addresseeId === userId) return this.props.requesterId;
    throw new Error('User is not part of this friendship');
  }

  static create(requesterId: string, addresseeId: string): Friendship {
    return new Friendship({
      requesterId,
      addresseeId,
      status: 'PENDING',
      createdAt: new Date()
    });
  }

  toJSON() {
    return {
      id: this.id,
      requesterId: this.props.requesterId,
      addresseeId: this.props.addresseeId,
      status: this.props.status,
      createdAt: this.props.createdAt.toISOString(),
      acceptedAt: this.props.acceptedAt?.toISOString()
    };
  }
}
