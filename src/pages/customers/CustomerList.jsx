import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const fetchCustomers = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('http://localhost:5000/api/customers', config);
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

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-[2rem] shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="p-8 border-b flex flex-col md:flex-row justify-between items-center bg-white gap-4">
          <div className="flex items-center gap-4">
             <button onClick={() => navigate('/')} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
             </button>
             <div>
               <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{t('customers.directory')}</h1>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t('customers.profilesVerification')}</p>
             </div>
          </div>
          <button 
            onClick={() => navigate('/customers/new')}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
          >
            {t('customers.onboardCustomer')}
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('customers.clientName')}</th>
                <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('customers.contact')}</th>
                <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('common.email')}</th>
                <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('common.status')}</th>
                <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('common.actions')}</th>
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
              ) : customers.map(c => (
                <tr key={c._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6 text-center">
                    <p className="text-sm font-black text-slate-900">{c.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{c.cin || t('customers.noCIN')}</p>
                  </td>
                  <td className="px-8 py-6 text-center text-sm font-bold text-slate-600 uppercase">{c.contactName || '--'}</td>
                  <td className="px-8 py-6 text-center text-sm text-slate-500 font-mono">{c.email}</td>
                  <td className="px-8 py-6 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${c.isActive ? 'bg-green-50 text-green-700 border-green-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                      {c.isActive ? t('common.active') : t('common.inactive')}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="flex justify-center gap-4">
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
              {!loading && customers.length === 0 && (
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
  );
};

export default CustomerList;
