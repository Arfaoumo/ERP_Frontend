import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message);
      }
    } finally {
      setIsLoading(false);
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
          disabled={isLoading}
          className="w-full bg-primary text-primary-foreground p-3 rounded-lg font-bold hover:opacity-90 transition-opacity flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            t('auth.signIn')
          )}
        </button>
      </form>
    </div>
  );
};

export default Login;
