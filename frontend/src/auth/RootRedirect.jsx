import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const RootRedirect = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
};

export default RootRedirect;