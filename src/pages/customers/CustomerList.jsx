import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const fetchCustomers = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/customers`, config);
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchCustomers();
  }, [user]);

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (c.cin && c.cin.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let matchesStatus = true;
    if (statusFilter === 'Active') matchesStatus = c.isActive === true;
    if (statusFilter === 'Inactive') matchesStatus = c.isActive === false;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200/60 overflow-hidden">
          
          {/* 1. HEADER & CONTROLS */}
          <div className="p-8 border-b flex flex-col md:flex-row justify-between items-center bg-white gap-4">
            
            {/* Title Section */}
            <div className="flex items-center gap-4">
               <button onClick={() => navigate('/')} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
               </button>
               <div>
                 <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{t('customers.directory')}</h1>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t('customers.profilesVerification')}</p>
               </div>
            </div>
            
            {/* Filters & Actions */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Search Bar */}
              <div className="relative">
                <input 
                  type="text" 
                  placeholder={t('common.search', 'Search...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none w-64"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2 px-3 border-l ml-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{t('common.status')}</label>
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none font-bold"
                >
                  <option value="All">{t('common.all', 'All')}</option>
                  <option value="Active">{t('common.active', 'Active')}</option>
                  <option value="Inactive">{t('common.inactive', 'Inactive')}</option>
                </select>
              </div>

              {/* Action Button */}
              <button 
                onClick={() => navigate('/customers/new')}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
              >
                 {t('customers.onboardCustomer')}
              </button>
            </div>
          </div>
          
          {/* 2. TABLE WRAPPER */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b">
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">{t('customers.clientName')}</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">{t('customers.contact')}</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">{t('common.email')}</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">{t('common.status')}</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="p-20 text-center">
                      <div className="inline-block w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                      <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">{t('customers.loadingDirectory')}</p>
                    </td>
                  </tr>
                ) : filteredCustomers.map(c => (
                  <tr key={c._id} className="border-b hover:bg-gray-50/80 transition-colors">
                    
                    {/* Multi-line Cell */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-bold text-slate-900">{c.name}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase mt-1">{c.cin || t('customers.noCIN')}</span>
                      </div>
                    </td>
                    
                    {/* Standard Text Cell */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-center">{c.contactName || '--'}</td>
                    
                    {/* Mono Font Cell */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono text-center">{c.email || '--'}</td>
                    
                    {/* Status Badge Cell */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${c.isActive ? 'bg-green-50 text-green-700 border-green-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                        {c.isActive ? t('common.active') : t('common.inactive')}
                      </span>
                    </td>
                    
                    {/* Action Buttons Cell */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex flex-col justify-center items-center gap-2">
                        <button 
                          onClick={() => navigate(`/customers/edit/${c._id}`)} 
                          className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest transition-all"
                        >
                          {t('customers.editProfile')}
                        </button>
                        <button 
                          onClick={() => navigate(`/customers/${c._id}`)} 
                          className="text-[10px] font-black text-slate-600 hover:text-slate-800 uppercase tracking-widest transition-all"
                        >
                          {t('customers.viewTimeline')}
                        </button>
                      </div>
                    </td>
                    
                  </tr>
                ))}
                {!loading && filteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-20 text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{t('customers.noCustomers')}</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default CustomerList;
