import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Systems from './pages/Systems';
import Alerts from './pages/Alerts';
import TravelLayout from './components/layout/TravelLayout';
import TravelDashboard from './pages/travel/TravelDashboard';
import TravelClients from './pages/travel/TravelClients';
import TravelTasks from './pages/travel/TravelTasks';
import MyTasks from './pages/travel/MyTasks';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route element={<TravelLayout />}>
        <Route path="/" element={<TravelDashboard />} />
        <Route path="/travel" element={<TravelDashboard />} />
        <Route path="/travel/clients" element={<TravelClients />} />
        <Route path="/travel/tasks" element={<TravelTasks />} />
        <Route path="/travel/my-tasks" element={<MyTasks />} />
      </Route>
      <Route element={<AppLayout />}>
        <Route path="/ops" element={<Dashboard />} />
        <Route path="/ops/tasks" element={<Tasks />} />
        <Route path="/ops/systems" element={<Systems />} />
        <Route path="/ops/alerts" element={<Alerts />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App