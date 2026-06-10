import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
const SupplierList = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const {
    user
  } = useContext(AuthContext);
  const navigate = useNavigate();
  const {
    t
  } = useTranslation();
  const fetchSuppliers = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
      const {
        data
      } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/suppliers`, config);
      setSuppliers(data);
    } catch (error) {
      console.error('Error fetching suppliers', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (user) fetchSuppliers();
  }, [user]);
  const filteredSuppliers = suppliers.filter(s => s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || s.email?.toLowerCase().includes(searchTerm.toLowerCase()) || s.contactName?.toLowerCase().includes(searchTerm.toLowerCase()));
  return <div className="min-h-screen bg-[#f8fafc] p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200/60 overflow-hidden">
        
        <div className="p-8 border-b flex flex-col md:flex-row justify-between items-center bg-white gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{t('suppliers.directory')}</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t('suppliers.manageSuppliers', 'Gérer les fournisseurs')}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <input type="text" placeholder={t('common.search', 'Rechercher...')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-slate-700 bg-slate-50" />
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
            {['Admin', 'Employee_Achats'].includes(user?.role) && <button onClick={() => navigate('/purchases/suppliers/new')} className="bg-blue-600 text-white px-6 py-2.5 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95 whitespace-nowrap">
                {t('suppliers.addSupplier')}
              </button>}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('suppliers.companyName')}</th>
                <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('suppliers.contact')}</th>
                <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('common.email')}</th>
                <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('common.status')}</th>
                <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr>
                  <td colSpan="5" className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="relative w-10 h-10">
                        <div className="absolute top-0 left-0 w-full h-full border-4 border-primary/20 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-full h-full border-4 border-t-primary rounded-full animate-spin"></div>
                      </div>
                      <p className="mt-4 text-sm font-medium text-gray-500 animate-pulse">{t('suppliers.retrieving')}</p>
                    </div>
                  </td>
                </tr> : filteredSuppliers.map(s => <tr key={s._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 text-center">{s.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">{s.contactName || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">{s.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    {s.isActive ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">{t('common.active')}</span> : <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">{t('common.inactive')}</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    {['Admin', 'Employee_Achats'].includes(user?.role) && <button onClick={() => navigate(`/purchases/suppliers/edit/${s._id}`)} className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest transition-all">{t('common.edit')}</button>}
                  </td>
                </tr>)}
              {!loading && filteredSuppliers.length === 0 && <tr>
                  <td colSpan="5" className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                    {searchTerm ? t('common.noResults') : t('suppliers.noSuppliers')}
                  </td>
                </tr>}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </div>;
};
export default SupplierList;