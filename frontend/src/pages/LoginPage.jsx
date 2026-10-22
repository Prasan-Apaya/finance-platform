import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi";
import { useAuth } from "../auth/AuthContext";

const LoginPage = () => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await authApi.login(credentials);
      login(response.data.token, response.data.username || response.data.email);
      navigate("/dashboard");
    } catch (err) {
      console.log("LOGIN ERROR:", err.response?.data);
      setError("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Login</h2>
        {error && (
          <p className="text-xs text-rose-500 mb-4 bg-rose-50 dark:bg-rose-950/30 p-3 rounded-lg border border-rose-200 dark:border-rose-900">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={credentials.email}
            onChange={(value) =>
              setCredentials({ ...credentials, email: value })
            }
            isRequired
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={credentials.password}
            onChange={(value) =>
              setCredentials({ ...credentials, password: value })
            }
            isRequired
          />

          <Button
            type="submit"
            color="primary"
            size="md"
            className="w-full"
          >
            Login
          </Button>
        </form>

        <p className="text-xs text-gray-500 mt-6 text-center">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-indigo-600 hover:underline font-medium"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
