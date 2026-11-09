import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        navigate("/admin-portal/dashboard", { replace: true });
      } else {
        navigate("/soldier/dashboard", { replace: true });
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(identifier, password);
      if (data.user.role === "admin") {
        navigate("/admin-portal/dashboard");
      } else {
        navigate("/soldier/dashboard");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login gagal. Periksa kembali kredensial Anda.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white font-dash flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-dashCard border border-gray-200 w-full max-w-sm p-8">
        <div className="w-11 h-11 flex items-center justify-center mx-auto mb-4">
          <img
            src="/logo.webp"
            alt="Logo Dukteksi"
            width="40"
            height="40"
            className="w-10 h-10 rounded-md object-contain shrink-0"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
        <h1 className="text-xl font-semibold text-dashNavy text-center mb-1">
          Login Portal
        </h1>
        <p className="text-xs text-dashNavy/60 text-center mb-6">
          Satlak Dukteksi Pussiberad TNI AD
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="identifier"
              className="text-sm font-medium text-dashNavy"
            >
              Username / Email
            </label>
            <input
              id="identifier"
              type="text"
              autoComplete="username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full border border-gray-200 rounded-md px-3 py-2 mt-1 text-sm text-black focus:outline-none focus:ring-2 focus:ring-dashAccent/40 focus:border-dashAccent transition"
              autoFocus
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="text-sm font-medium text-dashNavy"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-md px-3 py-2 mt-1 text-sm text-black focus:outline-none focus:ring-2 focus:ring-dashAccent/40 focus:border-dashAccent transition"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-md px-3 py-2"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-dashAccent text-white rounded-md py-2.5 text-sm font-semibold hover:bg-dashAccent/90 disabled:opacity-60 transition"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>
      </div>
    </main>
  );
}
