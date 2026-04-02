import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRecipeStore } from '@/store/useRecipeStore';
import { Layout } from '@/components/Layout';
import { HomePage } from '@/pages/HomePage';
import { RecipesPage } from '@/pages/RecipesPage';
import { RecipeDetailPage } from '@/pages/RecipeDetailPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { FriendsPage } from '@/pages/FriendsPage';
import { LeaderboardPage } from '@/pages/LeaderboardPage';
import { CreateRecipePage } from '@/pages/CreateRecipePage';
import { Toaster } from '@/components/ui/sonner';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// Admin Route Component
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!user?.isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

function AppContent() {
  const { isAuthenticated } = useAuthStore();
  const { seedRecipes } = useRecipeStore();

  useEffect(() => {
    // Seed recipes on app load
    seedRecipes();
  }, []);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
      } />
      <Route path="/register" element={
        isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />
      } />
      
      {/* Routes with Layout */}
      <Route path="/" element={
        <Layout>
          <HomePage />
        </Layout>
      } />
      <Route path="/recipes" element={
        <Layout>
          <RecipesPage />
        </Layout>
      } />
      <Route path="/recipes/:id" element={
        <Layout>
          <RecipeDetailPage />
        </Layout>
      } />
      
      {/* Protected Routes */}
      <Route path="/profile/:username" element={
        <ProtectedRoute>
          <Layout>
            <ProfilePage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/friends" element={
        <ProtectedRoute>
          <Layout>
            <FriendsPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/leaderboard" element={
        <Layout>
          <LeaderboardPage />
        </Layout>
      } />
      
      {/* Admin Routes */}
      <Route path="/admin/create-recipe" element={
        <AdminRoute>
          <Layout>
            <CreateRecipePage />
          </Layout>
        </AdminRoute>
      } />
      
      {/* 404 */}
      <Route path="*" element={
        <Layout>
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl font-bold mb-4">404</h1>
            <p className="text-muted-foreground mb-6">Página no encontrada</p>
            <a href="/" className="text-orange-600 hover:underline">
              Volver al inicio
            </a>
          </div>
        </Layout>
      } />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}

export default App;
