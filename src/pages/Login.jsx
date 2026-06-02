import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      login(data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || t('auth.loginFailed'));
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <form onSubmit={handleSubmit} className="bg-card p-10 rounded-xl shadow-lg w-full max-w-md border">
        <h1 className="text-3xl font-bold mb-2 text-center text-foreground">{t('auth.loginTitle')}</h1>
        <p className="text-sm text-gray-500 text-center mb-6">{t('auth.loginSubtitle')}</p>
        {error && <p className="bg-red-50 text-red-600 border border-red-200 rounded p-2 mb-4 text-center text-sm">{error}</p>}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.emailLabel')}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-lg bg-white focus:ring-2 focus:ring-primary focus:outline-none transition"
            placeholder={t('auth.emailPlaceholder')}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.passwordLabel')}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-lg bg-white focus:ring-2 focus:ring-primary focus:outline-none transition"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-primary text-primary-foreground p-3 rounded-lg font-bold hover:opacity-90 transition-opacity"
        >
          {t('auth.signIn')}
        </button>
      </form>
    </div>
  );
};

export default Login;
