import { Entity } from '@/shared/domain/entities/Entity';

export interface CommentProps {
  recipeId: string;
  userId: string;
  username: string;
  userImage?: string;
  content: string;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Comment extends Entity<CommentProps> {
  constructor(props: CommentProps, id?: string) {
    super(props, id);
    this.validate();
  }

  get recipeId(): string {
    return this.props.recipeId;
  }

  get userId(): string {
    return this.props.userId;
  }

  get username(): string {
    return this.props.username;
  }

  get userImage(): string | undefined {
    return this.props.userImage;
  }

  get content(): string {
    return this.props.content;
  }

  get likes(): number {
    return this.props.likes;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  private validate(): void {
    if (!this.props.recipeId) {
      throw new Error('Recipe ID is required');
    }
    if (!this.props.userId) {
      throw new Error('User ID is required');
    }
    if (!this.props.content || this.props.content.trim().length < 2) {
      throw new Error('Comment content must be at least 2 characters');
    }
  }

  updateContent(newContent: string): Comment {
    if (!newContent || newContent.trim().length < 2) {
      throw new Error('Comment content must be at least 2 characters');
    }
    return new Comment(
      {
        ...this.props,
        content: newContent.trim(),
        updatedAt: new Date()
      },
      this.id
    );
  }

  incrementLikes(): Comment {
    return new Comment(
      {
        ...this.props,
        likes: this.props.likes + 1
      },
      this.id
    );
  }

  decrementLikes(): Comment {
    return new Comment(
      {
        ...this.props,
        likes: Math.max(0, this.props.likes - 1)
      },
      this.id
    );
  }

  static create(
    recipeId: string,
    userId: string,
    username: string,
    content: string,
    userImage?: string
  ): Comment {
    return new Comment({
      recipeId,
      userId,
      username,
      userImage,
      content: content.trim(),
      likes: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  toJSON() {
    return {
      id: this.id,
      recipeId: this.props.recipeId,
      userId: this.props.userId,
      username: this.props.username,
      userImage: this.props.userImage,
      content: this.props.content,
      likes: this.props.likes,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString()
    };
  }
}
