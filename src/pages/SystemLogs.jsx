import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
const SystemLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('All');
  const {
    user
  } = useContext(AuthContext);
  const navigate = useNavigate();
  const {
    t,
    i18n
  } = useTranslation();
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
      const {
        data
      } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/logs`, config);
      setLogs(data);
    } catch (error) {
      console.error('Error fetching logs', error);
    } finally {
      setLoading(false);
    }
  };
  const translateDetails = details => {
    if (!details) return '--';
    if (details === 'New customer onboarded') return t('logDetails.newCustomer', 'New customer onboarded');
    if (details === 'Customer profile updated') return t('logDetails.customerUpdated', 'Customer profile updated');
    if (details === 'Supplier details updated') return t('logDetails.supplierUpdated', 'Supplier details updated');
    if (details === 'Product details updated') return t('logDetails.productUpdated', 'Product details updated');
    if (details === 'User profile/permissions updated') return t('logDetails.userUpdated', 'User profile/permissions updated');
    if (details === 'User successfully logged into the system') return t('logDetails.userLogged', 'User successfully logged into the system');
    if (details === 'Pending quote cancelled') return t('logDetails.quoteCancelled', 'Pending quote cancelled');
    const statusMatch = details.match(/Order status changed to (.*)/);
    if (statusMatch) return t('logDetails.statusChanged', {
      status: t(`status.${statusMatch[1]}`, statusMatch[1])
    });
    const convertMatch = details.match(/Converted (.*) to (.*)/);
    if (convertMatch) return t('logDetails.converted', {
      from: t(`document.${convertMatch[1]}`, convertMatch[1]),
      to: t(`document.${convertMatch[2]}`, convertMatch[2])
    });
    const skuMatch = details.match(/New product created with SKU: (.*)/);
    if (skuMatch) return t('logDetails.newProductSku', {
      sku: skuMatch[1]
    });
    const paymentMatch = details.match(/Payment of (.*) recorded via (.*)\. Status: (.*)/);
    if (paymentMatch) return t('logDetails.paymentRecorded', {
      amount: paymentMatch[1],
      method: paymentMatch[2],
      status: t(`status.${paymentMatch[3]}`, paymentMatch[3])
    });
    return details;
  };
  useEffect(() => {
    if (user && user.role === 'Admin') fetchLogs();
  }, [user]);
  const getActionColor = action => {
    switch (action) {
      case 'CREATE':
        return 'bg-green-50 text-green-700 border-green-100';
      case 'UPDATE':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'DELETE':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'STOCK_ADJUST':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      default:
        return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };
  const filteredLogs = logs.filter(log => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = log.targetName && log.targetName.toLowerCase().includes(term) || log.user && log.user.firstName && log.user.firstName.toLowerCase().includes(term) || log.user && log.user.lastName && log.user.lastName.toLowerCase().includes(term) || log.user && log.user.email && log.user.email.toLowerCase().includes(term) || log.action && log.action.toLowerCase().includes(term);
    const matchesAction = actionFilter === 'All' || log.action === actionFilter;
    return matchesSearch && matchesAction;
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
                 <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{t('logs.title')}</h1>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t('logs.subtitle', 'System Audit Trail')}</p>
               </div>
            </div>
            
            {}
            <div className="flex flex-wrap items-center gap-4 mt-4 md:mt-0">
              {}
              <div className="relative">
                <input type="text" placeholder={t('common.search', 'Search logs...')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none w-64 bg-slate-50 font-bold" />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>

              {}
              <div className="flex items-center gap-2 px-3 border-l border-slate-200 ml-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Action</label>
                <select value={actionFilter} onChange={e => setActionFilter(e.target.value)} className="bg-white border border-slate-200 text-slate-700 text-xs rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none block p-2 font-bold cursor-pointer">
                  <option value="All">{t('common.all', 'All')}</option>
                  <option value="CREATE">{t('logs.create', 'Create')}</option>
                  <option value="UPDATE">{t('logs.update', 'Update')}</option>
                  <option value="DELETE">{t('logs.delete', 'Delete')}</option>
                  <option value="STOCK_ADJUST">{t('logs.stockAdjust', 'Stock Adjust')}</option>
                  <option value="LOGIN">{t('logs.login', 'Login')}</option>
                </select>
              </div>
            </div>
            
          </div>
          
          {}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b">
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">{t('logs.timestamp')}</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">{t('logs.user')}</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">{t('logs.action')}</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">{t('logs.target')}</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">{t('logs.details')}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? <tr>
                    <td colSpan="5" className="p-20 text-center">
                      <div className="inline-block w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                      <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">{t('logs.retrieving')}</p>
                    </td>
                  </tr> : filteredLogs.map(log => <tr key={log._id} className="border-b hover:bg-gray-50/80 transition-colors">
                    
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-mono text-slate-500">
                      {new Date(log.createdAt).toLocaleString(i18n.language === 'fr' ? 'fr-FR' : 'en-US')}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-bold text-slate-900">{log.user?.firstName} {log.user?.lastName}</span>
                        <span className="text-[10px] font-bold text-slate-400 font-mono mt-1">{log.user?.email}</span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getActionColor(log.action)}`}>
                        {t(`logs.${log.action === 'STOCK_ADJUST' ? 'stockAdjust' : log.action.toLowerCase()}`, log.action)}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-bold text-slate-900">{log.targetName}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t(`models.${log.targetType}`, log.targetType)}</span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 text-sm text-slate-500 italic max-w-xs truncate text-center">
                      {translateDetails(log.details)}
                    </td>
                    
                  </tr>)}
                {!loading && filteredLogs.length === 0 && <tr>
                    <td colSpan="5" className="p-20 text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{t('logs.noLogs')}</p>
                    </td>
                  </tr>}
              </tbody>
            </table>
          </div>
          
        </div>
      </div>
    </div>;
};
export default SystemLogs;