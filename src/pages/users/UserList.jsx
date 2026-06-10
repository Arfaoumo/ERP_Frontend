import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const {
    user
  } = useContext(AuthContext);
  const navigate = useNavigate();
  const {
    t,
    i18n
  } = useTranslation();
  const fetchUsers = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
      const {
        data
      } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/users`, config);
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
  const getAvatar = u => {
    if (u.avatarUrl) {
      if (u.avatarUrl.startsWith('/uploads')) {
        return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${u.avatarUrl}`;
      }
      return u.avatarUrl;
    }
    return `https://ui-avatars.com/api/?name=${u.firstName}+${u.lastName}&background=random`;
  };
  const filteredUsers = users.filter(u => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = u.firstName && u.firstName.toLowerCase().includes(term) || u.lastName && u.lastName.toLowerCase().includes(term) || u.email && u.email.toLowerCase().includes(term);
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });
  return <div className="min-h-screen bg-[#f8fafc] p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200/60 overflow-hidden">
          
          {}
          <div className="p-8 border-b flex flex-col md:flex-row justify-between items-center bg-white gap-4">
            
            {}
            <div className="flex items-center gap-4">
               <button onClick={() => navigate('/')} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
               </button>
               <div>
                 <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{t('users.directory')}</h1>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t('users.subtitle', 'Team Members')}</p>
               </div>
            </div>
            
            {}
            <div className="flex flex-wrap items-center gap-4 mt-4 md:mt-0">
              {}
              <div className="relative">
                <input type="text" placeholder={t('common.search', 'Search users...')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none w-64 bg-slate-50 font-bold" />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>

              {}
              <div className="flex items-center gap-2 px-3 border-l border-slate-200 ml-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{t('users.systemRole')}</label>
                <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="bg-white border border-slate-200 text-slate-700 text-xs rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none block p-2 font-bold cursor-pointer">
                  <option value="All">{t('common.all', 'All')}</option>
                  <option value="Admin">{t('users.filterAdmin', 'Admin')}</option>
                  <option value="Commercial">{t('users.filterCommercial', 'Commercial')}</option>
                  <option value="Employee_Achats">{t('users.filterAchats', 'Achats')}</option>
                  <option value="Employee_Stocks">{t('users.filterStocks', 'Stocks')}</option>
                </select>
              </div>

              {}
              <button onClick={() => navigate('/users/new')} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95">
                 {t('users.addEmployee')}
              </button>
            </div>
          </div>
          
          {}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b">
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">{t('users.employee')}</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">{t('users.emailAddress')}</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">{t('users.systemRole')}</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">{t('users.joined')}</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? <tr>
                    <td colSpan="5" className="p-20 text-center">
                      <div className="inline-block w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                      <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">{t('users.loadingEmployees')}</p>
                    </td>
                  </tr> : filteredUsers.map(u => <tr key={u._id} className="border-b hover:bg-gray-50/80 transition-colors">
                    
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex flex-col items-center gap-2">
                        <img src={getAvatar(u)} alt={u.firstName} className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm" loading="lazy" decoding="async" />
                        <span className="text-sm font-bold text-slate-900">{u.firstName} {u.lastName}</span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-500 text-center">{u.email}</td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${u.role === 'Admin' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                        {t(`users.filter${u.role.replace('Employee_', '')}`, u.role.replace('Employee_', ''))}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm text-slate-500 font-mono font-bold">
                        {new Date(u.createdAt).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US')}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex flex-col justify-center items-center gap-2">
                        <button onClick={() => navigate(`/users/edit/${u._id}`)} className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest transition-all">
                          {t('common.edit')}
                        </button>
                      </div>
                    </td>
                    
                  </tr>)}
                {!loading && filteredUsers.length === 0 && <tr>
                    <td colSpan="5" className="p-20 text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{t('users.noUsers')}</p>
                    </td>
                  </tr>}
              </tbody>
            </table>
          </div>
          
        </div>
      </div>
    </div>;
};
export default UserList;