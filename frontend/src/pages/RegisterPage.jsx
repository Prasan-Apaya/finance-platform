import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await authApi.register(formData);
      navigate("/login");
    } catch (err) {
      setError("Registration failed");
    }
  };

  // Password strength logic (0 to 4 score)
  const getScore = (pwd) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length > 5) score++;
    if (pwd.length > 8) score++;
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return Math.min(score, 4);
  };

  const score = getScore(formData.password);

  const getBarColor = (index) => {
    if (index >= score) return "bg-gray-100 dark:bg-gray-800";
    if (score === 1) return "bg-rose-500";
    if (score === 2) return "bg-amber-500";
    if (score === 3) return "bg-emerald-500";
    return "bg-indigo-600";
  };

  const getScoreText = () => {
    if (!score) return "Enter a password";
    if (score === 1) return "Weak password";
    if (score === 2) return "Fair password";
    if (score === 3) return "Good password";
    return "Strong password";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8 shadow-sm transition-colors">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Register
        </h2>

        {error && (
          <p className="text-xs text-rose-500 mb-4 bg-rose-50 dark:bg-rose-950/30 p-3 rounded-lg border border-rose-200 dark:border-rose-900">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[12.5px] font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Username
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              required
              className="w-full px-3.5 py-[11px] border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition hover:border-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-[12.5px] font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Password
            </label>

            {/* Password input + reveal button wrapper */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                className="w-full pl-3.5 pr-11 py-[11px] border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition hover:border-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition cursor-pointer text-xs font-medium"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {/* Password Strength Indicator Bars */}
            <div className="flex gap-1.5 mt-2.5">
              <div
                className={`flex-1 h-1.5 rounded-full transition-colors duration-200 ${getBarColor(0)}`}
              />
              <div
                className={`flex-1 h-1.5 rounded-full transition-colors duration-200 ${getBarColor(1)}`}
              />
              <div
                className={`flex-1 h-1.5 rounded-full transition-colors duration-200 ${getBarColor(2)}`}
              />
              <div
                className={`flex-1 h-1.5 rounded-full transition-colors duration-200 ${getBarColor(3)}`}
              />
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
              {getScoreText()}
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-[12.5px] font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                required
                className="w-full pl-3.5 pr-11 py-[11px] border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition hover:border-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition cursor-pointer text-xs font-medium"
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
            {/* Strength Bars */}
            <div className="flex gap-1.5 mt-2.5">
              <div className={`flex-1 h-1.5 rounded-full transition-colors duration-200 ${getBarColor(0)}`} />
              <div className={`flex-1 h-1.5 rounded-full transition-colors duration-200 ${getBarColor(1)}`} />
              <div className={`flex-1 h-1.5 rounded-full transition-colors duration-200 ${getBarColor(2)}`} />
              <div className={`flex-1 h-1.5 rounded-full transition-colors duration-200 ${getBarColor(3)}`} />
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
              {getScoreText()}
            </p>

            {/* Live mismatch feedback hint */}
            {formData.confirmPassword &&
              formData.password !== formData.confirmPassword && (
                <p className="text-xs text-rose-500 mt-1.5">
                  Passwords do not match
                </p>
              )}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg transition shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 mt-2"
          >
            Register
          </button>
        </form>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-6 text-center">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium bg-transparent border-none cursor-pointer p-0"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
