import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/modules/user/domain/entities/User';
import bcrypt from 'bcryptjs';

interface AuthState {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: any) => void;
  clearError: () => void;
  verifyEmail: () => void;
}

// Simulated database - in production this would be MongoDB
const getUsers = (): Record<string, User> => {
  const users = localStorage.getItem('cuisine_crafter_users');
  return users ? JSON.parse(users) : {};
};

const saveUsers = (users: Record<string, User>) => {
  localStorage.setItem('cuisine_crafter_users', JSON.stringify(users));
};

// Initialize admin user if not exists
const initializeAdmin = () => {
  const users = getUsers();
  if (!Object.values(users).some((u: any) => u.props?.role === 'ADMIN' || u.role === 'ADMIN')) {
    const adminPassword = bcrypt.hashSync('admin123', 10);
    const admin = User.create({
      email: 'admin@cuisinecrafter.com',
      username: 'admin',
      passwordHash: adminPassword,
      role: 'ADMIN'
    });
    users[admin.id] = admin as unknown as User;
    saveUsers(users);
  }
};

initializeAdmin();

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const users = getUsers();
          const userEntry = Object.entries(users).find(([_, u]: [string, any]) => {
            const userEmail = u.props?.email || u.email;
            return userEmail === email.toLowerCase().trim();
          });

          if (!userEntry) {
            set({ isLoading: false, error: 'Usuario o contraseña incorrectos' });
            return false;
          }

          const [userId, userData] = userEntry;
          const passwordHash = userData.props?.passwordHash || userData.passwordHash;
          
          const isValidPassword = await bcrypt.compare(password, passwordHash);
          
          if (!isValidPassword) {
            set({ isLoading: false, error: 'Usuario o contraseña incorrectos' });
            return false;
          }

          // Recreate User instance
          const user = new User({
            email: userData.props?.email || userData.email,
            username: userData.props?.username || userData.username,
            passwordHash: passwordHash,
            role: userData.props?.role || userData.role || 'USER',
            profileImage: userData.props?.profileImage || userData.profileImage,
            points: userData.props?.points || userData.points || 0,
            completedRecipes: userData.props?.completedRecipes || userData.completedRecipes || [],
            unlockedRecipes: userData.props?.unlockedRecipes || userData.unlockedRecipes || [],
            friends: userData.props?.friends || userData.friends || [],
            createdRecipes: userData.props?.createdRecipes || userData.createdRecipes || [],
            emailVerified: userData.props?.emailVerified || userData.emailVerified || false,
            createdAt: new Date(userData.props?.createdAt || userData.createdAt),
            updatedAt: new Date(userData.props?.updatedAt || (userData as any).updatedAt || Date.now())
          }, userId);

          set({ user, isAuthenticated: true, isLoading: false });
          return true;
        } catch (error) {
          set({ isLoading: false, error: 'Error al iniciar sesión' });
          return false;
        }
      },

      register: async (email: string, username: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const users = getUsers();
          
          // Check if email exists
          const emailExists = Object.values(users).some((u: any) => {
            const userEmail = u.props?.email || u.email;
            return userEmail === email.toLowerCase().trim();
          });
          
          if (emailExists) {
            set({ isLoading: false, error: 'El email ya está registrado' });
            return false;
          }

          // Check if username exists
          const usernameExists = Object.values(users).some((u: any) => {
            const userUsername = u.props?.username || u.username;
            return userUsername.toLowerCase() === username.toLowerCase().trim();
          });
          
          if (usernameExists) {
            set({ isLoading: false, error: 'El nombre de usuario ya está en uso' });
            return false;
          }

          // Hash password
          const passwordHash = await bcrypt.hash(password, 10);
          
          // Create user
          const user = User.create({
            email: email.toLowerCase().trim(),
            username: username.trim(),
            passwordHash
          });

          // Save to "database"
          users[user.id] = user as unknown as User;
          saveUsers(users);

          set({ user, isAuthenticated: true, isLoading: false });
          return true;
        } catch (error: any) {
          set({ isLoading: false, error: error.message || 'Error al registrar usuario' });
          return false;
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false, error: null });
      },

      updateUser: (user: User) => {
        const users = getUsers();
        users[user.id] = user as unknown as User;
        saveUsers(users);
        set({ user });
      },

      clearError: () => {
        set({ error: null });
      },

      verifyEmail: () => {
        const { user } = get();
        if (user) {
          const updatedUser = user.verifyEmail();
          get().updateUser(updatedUser);
        }
      }
    }),
    {
      name: 'cuisine-crafter-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated })
    }
  )
);
