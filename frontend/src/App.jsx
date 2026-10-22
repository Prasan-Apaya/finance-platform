import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import MainLayout from "./components/layout/MainLayout";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import RootRedirect from "./auth/RootRedirect";

function App() {
  return (
    <>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route
              path="/transactions"
              element={
                <div className="p-4">Transactions page (placeholder)</div>
              }
            />
            <Route
              path="/budgets"
              element={<div className="p-4">Budgets page (placeholder)</div>}
            />
            <Route
              path="/categories"
              element={<div className="p-4">Categories page (placeholder)</div>}
            />
          </Route>
          <Route path="/" element={<RootRedirect />} />{" "}
        </Routes>
      </AuthProvider>
    </>
  );
}

export default App;
