import { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
const CustomerForm = () => {
  const {
    id
  } = useParams();
  const isEditMode = Boolean(id);
  const [formData, setFormData] = useState({
    name: '',
    contactName: '',
    email: '',
    phone: '',
    cin: '',
    shippingAddress: '',
    isActive: true
  });
  const {
    user
  } = useContext(AuthContext);
  const navigate = useNavigate();
  const {
    t
  } = useTranslation();
  useEffect(() => {
    if (isEditMode && user) {
      const fetchCustomer = async () => {
        try {
          const config = {
            headers: {
              Authorization: `Bearer ${user.token}`
            }
          };
          const {
            data
          } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/customers`, config);
          const customer = data.find(c => c._id === id);
          if (customer) {
            setFormData({
              name: customer.name,
              contactName: customer.contactName || '',
              email: customer.email,
              phone: customer.phone || '',
              cin: customer.cin || '',
              shippingAddress: customer.shippingAddress || '',
              isActive: customer.isActive
            });
          }
        } catch (error) {
          console.error('Error fetching customer', error);
        }
      };
      fetchCustomer();
    }
  }, [id, user, isEditMode]);
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
      if (isEditMode) {
        await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/customers/${id}`, formData, config);
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/customers`, formData, config);
      }
      navigate('/customers');
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || t('customers.errorSaving'));
    }
  };
  return <div className="min-h-screen bg-[#f8fafc] p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-[2rem] shadow-sm border border-slate-200/60 overflow-hidden">
        
        {}
        <div className="p-8 border-b flex justify-between items-center bg-white">
          <div className="flex items-center gap-4">
             <button type="button" onClick={() => navigate('/customers')} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
             </button>
             <div>
               <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                 {isEditMode ? t('customers.updateProfile') : t('customers.onboardNew')}
               </h1>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                 {isEditMode ? t('customers.modifyParams') : t('customers.registerNew')}
               </p>
             </div>
          </div>
        </div>

        {}
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">{t('customers.companyName')}</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({
              ...formData,
              name: e.target.value
            })} placeholder={t('customers.companyNamePlaceholder')} className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm font-bold text-slate-900 placeholder:text-slate-300" />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">{t('customers.contactPerson')}</label>
              <input type="text" value={formData.contactName} onChange={e => setFormData({
              ...formData,
              contactName: e.target.value
            })} placeholder={t('customers.contactPersonPlaceholder')} className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm font-bold text-slate-900 placeholder:text-slate-300" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">{t('auth.emailLabel')}</label>
              <input type="email" required value={formData.email} onChange={e => setFormData({
              ...formData,
              email: e.target.value
            })} placeholder={t('customers.emailPlaceholder')} className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm font-bold text-slate-900 font-mono placeholder:text-slate-300" />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">{t('common.phone')}</label>
              <input type="text" value={formData.phone} onChange={e => setFormData({
              ...formData,
              phone: e.target.value
            })} placeholder={t('customers.phonePlaceholder')} className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm font-bold text-slate-900 font-mono placeholder:text-slate-300" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">{t('customers.cinLabel')}</label>
            <input type="text" value={formData.cin} onChange={e => {
            const val = e.target.value.replace(/\D/g, '').slice(0, 8);
            setFormData({
              ...formData,
              cin: val
            });
          }} pattern="\d{8}" minLength="8" maxLength="8" title={t('customers.cinTitle')} placeholder={t('customers.cinPlaceholder')} className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm font-bold text-slate-900 font-mono placeholder:text-slate-300" />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">{t('customers.shippingAddress')}</label>
            <textarea rows="3" value={formData.shippingAddress} onChange={e => setFormData({
            ...formData,
            shippingAddress: e.target.value
          })} placeholder={t('customers.shippingAddressPlaceholder')} className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm font-bold text-slate-900 placeholder:text-slate-300"></textarea>
          </div>

          {isEditMode && <div className="flex items-center p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
              <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({
            ...formData,
            isActive: e.target.checked
          })} className="mr-4 cursor-pointer w-5 h-5 accent-blue-600 rounded" />
              <div>
                <label htmlFor="isActive" className="text-xs font-black uppercase text-slate-700 tracking-widest cursor-pointer block">{t('customers.activeAccount')}</label>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t('customers.activeAccountDesc')}</p>
              </div>
            </div>}

          {}
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button type="button" onClick={() => navigate('/customers')} className="px-6 py-3 border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors">
              {t('common.cancel')}
            </button>
            <button type="submit" className="px-8 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95">
              {isEditMode ? t('customers.updateAccount') : t('customers.onboardBtn')}
            </button>
          </div>
        </form>
      </div>
    </div>;
};
export default CustomerForm;