import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const StockMovementForm = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({ type: 'IN', quantity: 1, reason: '' });
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products/${id}/stock`, formData, config);
      navigate('/inventory');
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || t('inventory.errorMovingStock'));
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-[2rem] shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="p-8 border-b flex justify-between items-center bg-white">
          <div className="flex items-center gap-4">
           <button onClick={() => navigate('/inventory')} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
           </button>
           <div>
             <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
               {t('inventory.logMovement')}
             </h1>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
               {t('inventory.adjustStock', 'Ajuster Stock')}
             </p>
           </div>
        </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">{t('inventory.movementType')}</label>
              <select className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm font-bold text-slate-900" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                <option value="IN">{t('inventory.movementIn', 'ENTRÉE')}</option>
                <option value="OUT">{t('inventory.movementOut', 'SORTIE')}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">{t('inventory.quantity')}</label>
              <input type="number" min="1" className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm font-bold text-slate-900" required value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">{t('inventory.reasonRef')}</label>
            <input type="text" placeholder={t('inventory.reasonPlaceholder')} className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm font-bold text-slate-900 uppercase placeholder:text-slate-300" required value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button type="button" onClick={() => navigate('/inventory')} className="px-6 py-3 border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors">{t('common.cancel')}</button>
            <button type="submit" className="px-8 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95">{t('inventory.confirmMovement')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockMovementForm;
