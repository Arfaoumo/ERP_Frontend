import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const SystemLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const fetchLogs = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('http://localhost:5000/api/logs', config);
      setLogs(data);
    } catch (error) {
      console.error('Error fetching logs', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'Admin') fetchLogs();
  }, [user]);

  const getActionColor = (action) => {
    switch (action) {
      case 'CREATE': return 'bg-green-100 text-green-800';
      case 'UPDATE': return 'bg-blue-100 text-blue-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      case 'STOCK_ADJUST': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto bg-card rounded-xl shadow-sm border overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
             <button onClick={() => navigate('/')} className="text-gray-500 hover:text-primary mr-2">{t('common.back')}</button>
             <h1 className="text-2xl font-bold text-foreground">{t('logs.title')}</h1>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('logs.timestamp')}</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('logs.user')}</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">{t('logs.action')}</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('logs.target')}</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('logs.details')}</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="relative w-10 h-10">
                        <div className="absolute top-0 left-0 w-full h-full border-4 border-primary/20 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-full h-full border-4 border-t-primary rounded-full animate-spin"></div>
                      </div>
                      <p className="mt-4 text-sm font-medium text-gray-500 animate-pulse">{t('logs.retrieving')}</p>
                    </div>
                  </td>
                </tr>
              ) : logs.map(log => (
                <tr key={log._id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{log.user?.firstName} {log.user?.lastName}</div>
                    <div className="text-xs text-gray-500">{log.user?.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-semibold">{log.targetName}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-tighter">{log.targetType}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 italic max-w-xs truncate">
                    {log.details || '-'}
                  </td>
                </tr>
              ))}
              {!loading && logs.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-gray-500">{t('logs.noLogs')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SystemLogs;
