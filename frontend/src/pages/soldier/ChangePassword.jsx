import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function ChangePassword() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password minimal 8 karakter.');
      return;
    }
    if (password !== confirm) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }
    setLoading(true);
    try {
      await api.put('/soldiers/profile', { password });
      await refreshUser();
      navigate('/soldier/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengganti password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 bg-white p-6 rounded-xl shadow">
        <h1 className="text-xl font-bold">Ganti Password</h1>
        <p className="text-sm text-gray-600">Akun Anda menggunakan password sementara. Silakan buat password baru (minimal 8 karakter).</p>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <input
          type="password"
          placeholder="Password baru"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="password"
          placeholder="Konfirmasi password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-2 rounded">
          {loading ? 'Menyimpan...' : 'Simpan Password'}
        </button>
      </form>
    </div>
  );
}