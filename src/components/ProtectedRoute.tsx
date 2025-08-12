import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, initializing } = useAuth();

  if (initializing) return null; // could be a spinner
  if (!session) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

export default ProtectedRoute;
