import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const fetchUsers = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('http://localhost:5000/api/auth/users', config);
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'Admin') fetchUsers();
  }, [user]);

  const getAvatar = (u) => {
    if (u.avatarUrl) {
      if (u.avatarUrl.startsWith('/uploads')) {
        return `http://localhost:5000${u.avatarUrl}`;
      }
      return u.avatarUrl;
    }
    return `https://ui-avatars.com/api/?name=${u.firstName}+${u.lastName}&background=random`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto bg-card rounded-xl shadow-sm border overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
             <button onClick={() => navigate('/')} className="text-gray-500 hover:text-primary mr-2">{t('common.back')}</button>
             <h1 className="text-2xl font-bold text-foreground">{t('users.directory')}</h1>
          </div>
          <button 
            onClick={() => navigate('/users/new')}
            className="bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {t('users.addEmployee')}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('users.employee')}</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('users.emailAddress')}</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">{t('users.systemRole')}</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('users.joined')}</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="relative w-10 h-10">
                        <div className="absolute top-0 left-0 w-full h-full border-4 border-primary/20 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-full h-full border-4 border-t-primary rounded-full animate-spin"></div>
                      </div>
                      <p className="mt-4 text-sm font-medium text-gray-500 animate-pulse">{t('users.loadingEmployees')}</p>
                    </div>
                  </td>
                </tr>
              ) : users.map(u => (
                <tr key={u._id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center gap-4">
                    <img 
                      src={getAvatar(u)} 
                      alt={u.firstName} 
                      className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" 
                      loading="lazy"
                      decoding="async"
                    />
                    <span>{u.firstName} {u.lastName}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{u.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                      {u.role.replace('Employee_', '')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <button onClick={() => navigate(`/users/edit/${u._id}`)} className="text-blue-600 hover:text-blue-800 font-medium text-sm">{t('common.edit')}</button>
                  </td>
                </tr>
              ))}
              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">{t('users.noUsers')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserList;
