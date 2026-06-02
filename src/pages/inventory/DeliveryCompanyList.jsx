import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const DeliveryCompanyList = () => {
  const { user } = useContext(AuthContext);
  const [couriers, setCouriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const fetchCouriers = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('http://localhost:5000/api/delivery-companies/all', config);
      setCouriers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchCouriers();
  }, [user]);

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.patch(`http://localhost:5000/api/delivery-companies/${id}/toggle`, { isActive: !currentStatus }, config);
      fetchCouriers();
    } catch (error) {
      console.error(error);
      alert(t('inventory.errorTogglingStatus'));
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-[2rem] shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="p-8 border-b flex flex-col md:flex-row justify-between items-center bg-white gap-4">
          <div className="flex items-center gap-4">
             <button onClick={() => navigate('/')} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
             </button>
             <div>
               <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{t('inventory.deliveryCompanies')}</h1>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t('inventory.couriersLogistics')}</p>
             </div>
          </div>
          <button 
            onClick={() => navigate('/delivery-companies/new')}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
          >
            {t('inventory.registerCourierBtn')}
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('inventory.courierName')}</th>
                <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('auth.emailLabel')}</th>
                <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('common.status')}</th>
                <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-20 text-center">
                    <div className="inline-block w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">{t('inventory.loadingCouriers')}</p>
                  </td>
                </tr>
              ) : couriers.map(courier => (
                <tr key={courier._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6 text-left">
                    <p className="text-sm font-black text-slate-900 uppercase">{courier.name}</p>
                  </td>
                  <td className="px-8 py-6 text-center text-sm font-bold text-slate-600 lowercase">
                    {courier.contactEmail || courier.email || '--'}
                  </td>
                  <td className="px-8 py-6 text-center">
                    <button 
                      onClick={() => handleToggleStatus(courier._id, courier.isActive)}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors ${courier.isActive ? 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100' : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'}`}
                    >
                      {courier.isActive ? t('common.active') : t('common.inactive')}
                    </button>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <button 
                      onClick={() => navigate(`/delivery-companies/edit/${courier._id}`)} 
                      className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest transition-all"
                    >
                      {t('customers.editProfile')}
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && couriers.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-20 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{t('inventory.noCouriers')}</p>
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

export default DeliveryCompanyList;
