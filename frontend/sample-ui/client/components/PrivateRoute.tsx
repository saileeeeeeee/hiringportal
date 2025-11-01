import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export default function PrivateRoute({ children, requiredRoles }: PrivateRouteProps) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles && user && !requiredRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
