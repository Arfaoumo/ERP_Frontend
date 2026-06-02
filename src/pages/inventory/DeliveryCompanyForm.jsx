import { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const DeliveryCompanyForm = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  
  const [formData, setFormData] = useState({ 
    name: '', 
    contactEmail: '',
    isActive: true
  });
  
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (isEditMode && user) {
      const fetchCourier = async () => {
        try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          const { data } = await axios.get('http://localhost:5000/api/delivery-companies/all', config);
          const courier = data.find(c => c._id === id);
          if (courier) {
            setFormData({
              name: courier.name,
              contactEmail: courier.contactEmail || courier.email || '',
              isActive: courier.isActive
            });
          }
        } catch (error) {
          console.error('Error fetching delivery company', error);
        }
      };
      fetchCourier();
    }
  }, [id, user, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      if (isEditMode) {
        await axios.put(`http://localhost:5000/api/delivery-companies/${id}`, formData, config);
      } else {
        await axios.post('http://localhost:5000/api/delivery-companies', formData, config);
      }
      navigate('/delivery-companies');
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || t('inventory.errorSavingCourier'));
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8 flex justify-center items-start pt-12">
      <div className="w-full max-w-2xl bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="flex items-center gap-4 mb-8">
           <button onClick={() => navigate('/delivery-companies')} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
           </button>
           <div>
             <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
               {isEditMode ? t('inventory.updateCourier') : t('inventory.registerNewCourier')}
             </h1>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
               {isEditMode ? t('inventory.modifyCourierSettings') : t('inventory.addLogisticsProvider')}
             </p>
           </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">{t('inventory.companyName')}</label>
              <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all text-sm font-bold text-slate-900 uppercase placeholder:text-slate-300" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder={t('inventory.companyNamePlaceholder')} />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">{t('auth.emailLabel')}</label>
              <input type="email" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all text-sm font-bold text-slate-900 lowercase placeholder:text-slate-300 placeholder:uppercase" required value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})} placeholder={t('inventory.emailPlaceholderUpper')} />
            </div>
          </div>

          {isEditMode && (
            <div className="flex items-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <input 
                type="checkbox" 
                id="isActive" 
                checked={formData.isActive} 
                onChange={e => setFormData({...formData, isActive: e.target.checked})} 
                className="mr-4 cursor-pointer w-5 h-5 accent-blue-600 rounded" 
              />
              <div>
                <label htmlFor="isActive" className="text-xs font-black uppercase text-slate-700 tracking-widest cursor-pointer block">{t('inventory.activeStatus')}</label>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t('inventory.activeCouriersDesc')}</p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button 
              type="button" 
              onClick={() => navigate('/delivery-companies')} 
              className="px-6 py-3 border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button 
              type="submit" 
              className="px-8 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
            >
              {isEditMode ? t('inventory.updateCourierBtn') : t('inventory.registerCourierBtn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeliveryCompanyForm;
