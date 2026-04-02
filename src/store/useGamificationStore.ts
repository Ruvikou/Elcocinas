import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from './useAuthStore';
import type { DifficultyLevel } from '@/modules/recipe/domain/value-objects/Difficulty';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  pointsRequired: number;
  unlockedAt?: Date;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_step', title: 'Primeros Pasos', description: 'Completa tu primera receta', icon: '👶', pointsRequired: 25 },
  { id: 'rising_chef', title: 'Chef en Ascenso', description: 'Alcanza 100 puntos', icon: '📈', pointsRequired: 100 },
  { id: 'social_cook', title: 'Cocinero Social', description: 'Añade tu primer amigo', icon: '👥', pointsRequired: 0 },
  { id: 'commentator', title: 'Crítico Culinario', description: 'Deja 5 comentarios', icon: '💬', pointsRequired: 0 },
  { id: 'photographer', title: 'Food Photographer', description: 'Sube 3 fotos de recetas completadas', icon: '📸', pointsRequired: 0 },
  { id: 'expert_unlock', title: 'Desbloqueador Experto', description: 'Desbloquea una receta EXPERT', icon: '🔓', pointsRequired: 0 },
  { id: 'supreme_master', title: 'Maestro Supremo', description: 'Completa una receta SUPREME', icon: '👑', pointsRequired: 0 },
  { id: 'point_collector', title: 'Coleccionista de Puntos', description: 'Acumula 500 puntos', icon: '💎', pointsRequired: 500 },
  { id: 'master_chef', title: 'Master Chef', description: 'Alcanza el nivel 5', icon: '⭐', pointsRequired: 0 },
  { id: 'legendary', title: 'Leyenda Culinaria', description: 'Alcanza el nivel 10', icon: '🏆', pointsRequired: 0 }
];

interface GamificationState {
  userAchievements: Record<string, string[]>; // userId -> achievementIds[]
  userStats: Record<string, {
    commentsCount: number;
    photosCount: number;
    recipesUnlocked: string[];
    friendsAdded: number;
  }>;
  
  // Actions
  awardPoints: (userId: string, points: number) => void;
  completeRecipe: (userId: string, recipeId: string, difficulty: DifficultyLevel) => number;
  addComment: (userId: string) => void;
  addPhoto: (userId: string) => void;
  unlockRecipe: (userId: string, recipeId: string) => void;
  addFriend: (userId: string) => void;
  getPointsForAction: (action: string, difficulty?: DifficultyLevel) => number;
  getUserAchievements: (userId: string) => Achievement[];
  checkAchievements: (userId: string) => Achievement[];
  getLeaderboard: () => { userId: string; username: string; points: number; level: number }[];
}

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      userAchievements: {},
      userStats: {},

      awardPoints: (userId: string, points: number) => {
        const authStore = useAuthStore.getState();
        const user = authStore.user;
        
        if (user && user.id === userId) {
          const updatedUser = user.addPoints(points);
          authStore.updateUser(updatedUser);
          get().checkAchievements(userId);
        }
      },

      completeRecipe: (userId: string, _recipeId: string, difficulty: DifficultyLevel): number => {
        const difficultyMultipliers: Record<DifficultyLevel, number> = {
          BASIC: 1,
          COMMON: 2,
          MODERATE: 3,
          EXPERT: 4,
          SUPREME: 5
        };
        
        const points = 25 * difficultyMultipliers[difficulty];
        get().awardPoints(userId, points);
        
        // Update stats
        set(state => ({
          userStats: {
            ...state.userStats,
            [userId]: {
              ...state.userStats[userId],
              commentsCount: state.userStats[userId]?.commentsCount || 0,
              photosCount: state.userStats[userId]?.photosCount || 0,
              recipesUnlocked: state.userStats[userId]?.recipesUnlocked || [],
              friendsAdded: state.userStats[userId]?.friendsAdded || 0
            }
          }
        }));
        
        get().checkAchievements(userId);
        return points;
      },

      addComment: (userId: string) => {
        get().awardPoints(userId, 10);
        set(state => ({
          userStats: {
            ...state.userStats,
            [userId]: {
              ...state.userStats[userId],
              commentsCount: (state.userStats[userId]?.commentsCount || 0) + 1,
              photosCount: state.userStats[userId]?.photosCount || 0,
              recipesUnlocked: state.userStats[userId]?.recipesUnlocked || [],
              friendsAdded: state.userStats[userId]?.friendsAdded || 0
            }
          }
        }));
        get().checkAchievements(userId);
      },

      addPhoto: (userId: string) => {
        get().awardPoints(userId, 20);
        set(state => ({
          userStats: {
            ...state.userStats,
            [userId]: {
              ...state.userStats[userId],
              commentsCount: state.userStats[userId]?.commentsCount || 0,
              photosCount: (state.userStats[userId]?.photosCount || 0) + 1,
              recipesUnlocked: state.userStats[userId]?.recipesUnlocked || [],
              friendsAdded: state.userStats[userId]?.friendsAdded || 0
            }
          }
        }));
        get().checkAchievements(userId);
      },

      unlockRecipe: (userId: string, recipeId: string) => {
        set(state => ({
          userStats: {
            ...state.userStats,
            [userId]: {
              ...state.userStats[userId],
              commentsCount: state.userStats[userId]?.commentsCount || 0,
              photosCount: state.userStats[userId]?.photosCount || 0,
              recipesUnlocked: [...(state.userStats[userId]?.recipesUnlocked || []), recipeId],
              friendsAdded: state.userStats[userId]?.friendsAdded || 0
            }
          }
        }));
        get().checkAchievements(userId);
      },

      addFriend: (userId: string) => {
        set(state => ({
          userStats: {
            ...state.userStats,
            [userId]: {
              ...state.userStats[userId],
              commentsCount: state.userStats[userId]?.commentsCount || 0,
              photosCount: state.userStats[userId]?.photosCount || 0,
              recipesUnlocked: state.userStats[userId]?.recipesUnlocked || [],
              friendsAdded: (state.userStats[userId]?.friendsAdded || 0) + 1
            }
          }
        }));
        get().checkAchievements(userId);
      },

      getPointsForAction: (action: string, difficulty?: DifficultyLevel): number => {
        const basePoints: Record<string, number> = {
          'complete_recipe': 25,
          'like': 5,
          'comment': 10,
          'upload_photo': 20,
          'unlock_recipe': 50
        };
        
        if (action === 'complete_recipe' && difficulty) {
          const multipliers: Record<DifficultyLevel, number> = {
            BASIC: 1, COMMON: 2, MODERATE: 3, EXPERT: 4, SUPREME: 5
          };
          return basePoints[action] * multipliers[difficulty];
        }
        
        return basePoints[action] || 0;
      },

      getUserAchievements: (userId: string): Achievement[] => {
        const userAchievementIds = get().userAchievements[userId] || [];
        return ACHIEVEMENTS.filter(a => userAchievementIds.includes(a.id));
      },

      checkAchievements: (userId: string): Achievement[] => {
        const authStore = useAuthStore.getState();
        const user = authStore.user;
        if (!user || user.id !== userId) return [];
        
        const stats = get().userStats[userId] || {
          commentsCount: 0,
          photosCount: 0,
          recipesUnlocked: [],
          friendsAdded: 0
        };
        
        const unlockedAchievements: Achievement[] = [];
        const currentAchievements = get().userAchievements[userId] || [];
        
        // Check each achievement
        for (const achievement of ACHIEVEMENTS) {
          if (currentAchievements.includes(achievement.id)) continue;
          
          let shouldUnlock = false;
          
          switch (achievement.id) {
            case 'first_step':
              shouldUnlock = user.completedRecipes.length >= 1;
              break;
            case 'rising_chef':
              shouldUnlock = user.points >= 100;
              break;
            case 'social_cook':
              shouldUnlock = stats.friendsAdded >= 1;
              break;
            case 'commentator':
              shouldUnlock = stats.commentsCount >= 5;
              break;
            case 'photographer':
              shouldUnlock = stats.photosCount >= 3;
              break;
            case 'expert_unlock':
              shouldUnlock = stats.recipesUnlocked.length >= 1;
              break;
            case 'supreme_master':
              shouldUnlock = user.completedRecipes.some(() => {
                // This would need recipe data to check difficulty
                return false;
              });
              break;
            case 'point_collector':
              shouldUnlock = user.points >= 500;
              break;
            case 'master_chef':
              shouldUnlock = user.level >= 5;
              break;
            case 'legendary':
              shouldUnlock = user.level >= 10;
              break;
          }
          
          if (shouldUnlock) {
            unlockedAchievements.push({ ...achievement, unlockedAt: new Date() });
          }
        }
        
        if (unlockedAchievements.length > 0) {
          set(state => ({
            userAchievements: {
              ...state.userAchievements,
              [userId]: [
                ...currentAchievements,
                ...unlockedAchievements.map(a => a.id)
              ]
            }
          }));
        }
        
        return unlockedAchievements;
      },

      getLeaderboard: () => {
        const users = JSON.parse(localStorage.getItem('cuisine_crafter_users') || '{}');
        
        return Object.entries(users)
          .map(([id, u]: [string, any]) => ({
            userId: id,
            username: u.props?.username || u.username,
            points: u.props?.points || u.points || 0,
            level: Math.floor(((u.props?.points || u.points || 0) / 100)) + 1
          }))
          .sort((a, b) => b.points - a.points)
          .slice(0, 10);
      }
    }),
    {
      name: 'cuisine-crafter-gamification',
      partialize: (state) => ({ 
        userAchievements: state.userAchievements,
        userStats: state.userStats
      })
    }
  )
);
