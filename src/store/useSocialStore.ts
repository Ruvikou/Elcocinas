import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Friendship } from '@/modules/social/domain/entities/Friendship';
import { Comment } from '@/modules/social/domain/entities/Comment';

interface SocialState {
  friendships: Friendship[];
  comments: Comment[];
  userLikes: Record<string, string[]>; // recipeId -> userIds[]
  
  // Actions
  sendFriendRequest: (requesterId: string, addresseeId: string) => Friendship | null;
  acceptFriendRequest: (friendshipId: string) => void;
  rejectFriendRequest: (friendshipId: string) => void;
  getFriendshipStatus: (userId1: string, userId2: string) => 'NONE' | 'PENDING' | 'ACCEPTED' | 'REJECTED';
  getFriends: (userId: string) => string[];
  getPendingRequests: (userId: string) => Friendship[];
  removeFriend: (userId1: string, userId2: string) => void;
  
  addComment: (recipeId: string, userId: string, username: string, content: string, userImage?: string) => Comment;
  getComments: (recipeId: string) => Comment[];
  deleteComment: (commentId: string) => void;
  likeComment: (commentId: string) => void;
  
  likeRecipe: (recipeId: string, userId: string) => void;
  unlikeRecipe: (recipeId: string, userId: string) => void;
  hasLikedRecipe: (recipeId: string, userId: string) => boolean;
  getRecipeLikes: (recipeId: string) => number;
}

export const useSocialStore = create<SocialState>()(
  persist(
    (set, get) => ({
      friendships: [],
      comments: [],
      userLikes: {},

      sendFriendRequest: (requesterId: string, addresseeId: string) => {
        if (requesterId === addresseeId) return null;
        
        const existing = get().friendships.find(f => 
          f.involvesUser(requesterId) && f.involvesUser(addresseeId)
        );
        
        if (existing) return null;
        
        const friendship = Friendship.create(requesterId, addresseeId);
        set(state => ({ friendships: [...state.friendships, friendship] }));
        return friendship;
      },

      acceptFriendRequest: (friendshipId: string) => {
        const friendship = get().friendships.find(f => f.id === friendshipId);
        if (friendship && friendship.isPending) {
          const accepted = friendship.accept();
          set(state => ({
            friendships: state.friendships.map(f => f.id === friendshipId ? accepted : f)
          }));
        }
      },

      rejectFriendRequest: (friendshipId: string) => {
        const friendship = get().friendships.find(f => f.id === friendshipId);
        if (friendship && friendship.isPending) {
          const rejected = friendship.reject();
          set(state => ({
            friendships: state.friendships.map(f => f.id === friendshipId ? rejected : f)
          }));
        }
      },

      getFriendshipStatus: (userId1: string, userId2: string): 'NONE' | 'PENDING' | 'ACCEPTED' | 'REJECTED' => {
        const friendship = get().friendships.find(f => 
          f.involvesUser(userId1) && f.involvesUser(userId2)
        );
        return friendship ? friendship.status : 'NONE';
      },

      getFriends: (userId: string): string[] => {
        return get().friendships
          .filter(f => f.involvesUser(userId) && f.isAccepted)
          .map(f => f.getOtherUserId(userId));
      },

      getPendingRequests: (userId: string): Friendship[] => {
        return get().friendships.filter(f => 
          f.addresseeId === userId && f.isPending
        );
      },

      removeFriend: (userId1: string, userId2: string) => {
        set(state => ({
          friendships: state.friendships.filter(f => 
            !(f.involvesUser(userId1) && f.involvesUser(userId2))
          )
        }));
      },

      addComment: (recipeId: string, userId: string, username: string, content: string, userImage?: string) => {
        const comment = Comment.create(recipeId, userId, username, content, userImage);
        set(state => ({ comments: [...state.comments, comment] }));
        return comment;
      },

      getComments: (recipeId: string): Comment[] => {
        return get().comments
          .filter(c => c.recipeId === recipeId)
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      },

      deleteComment: (commentId: string) => {
        set(state => ({
          comments: state.comments.filter(c => c.id !== commentId)
        }));
      },

      likeComment: (commentId: string) => {
        const comment = get().comments.find(c => c.id === commentId);
        if (comment) {
          const liked = comment.incrementLikes();
          set(state => ({
            comments: state.comments.map(c => c.id === commentId ? liked : c)
          }));
        }
      },

      likeRecipe: (recipeId: string, userId: string) => {
        set(state => ({
          userLikes: {
            ...state.userLikes,
            [recipeId]: [...(state.userLikes[recipeId] || []), userId]
          }
        }));
      },

      unlikeRecipe: (recipeId: string, userId: string) => {
        set(state => ({
          userLikes: {
            ...state.userLikes,
            [recipeId]: (state.userLikes[recipeId] || []).filter(id => id !== userId)
          }
        }));
      },

      hasLikedRecipe: (recipeId: string, userId: string): boolean => {
        return (get().userLikes[recipeId] || []).includes(userId);
      },

      getRecipeLikes: (recipeId: string): number => {
        return (get().userLikes[recipeId] || []).length;
      }
    }),
    {
      name: 'cuisine-crafter-social',
      partialize: (state) => ({ 
        friendships: state.friendships, 
        comments: state.comments,
        userLikes: state.userLikes 
      })
    }
  )
);
