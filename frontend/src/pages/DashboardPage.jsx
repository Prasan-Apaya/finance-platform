import { useAuth } from '../auth/AuthContext';

const DashboardPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard-page">
      <h2>Dashboard</h2>
      <p>Welcome, {user?.username}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default DashboardPage;