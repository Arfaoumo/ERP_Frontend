import { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const CategoryForm = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  
  const [formData, setFormData] = useState({ 
    name: '', 
    taxRate: '', 
    description: '' 
  });
  
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (isEditMode && user) {
      const fetchCategory = async () => {
        try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/categories`, config);
          const category = data.find(c => c._id === id);
          if (category) {
            setFormData({
              name: category.name,
              taxRate: category.taxRate ? (category.taxRate * 100).toFixed(0) : '',
              description: category.description || ''
            });
          }
        } catch (error) {
          console.error('Error fetching category', error);
        }
      };
      fetchCategory();
    }
  }, [id, user, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const payload = { ...formData, taxRate: formData.taxRate ? (parseFloat(formData.taxRate) / 100) : 0 };
      if (isEditMode) {
        await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/categories/${id}`, payload, config);
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/categories`, payload, config);
      }
      navigate('/categories');
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || t('inventory.errorSavingCategory'));
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-[2rem] shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="p-8 border-b flex justify-between items-center bg-white">
          <div className="flex items-center gap-4">

           <button onClick={() => navigate('/categories')} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
           </button>
           <div>
             <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
               {isEditMode ? t('inventory.updateCategory') : t('inventory.createCategory')}
             </h1>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
               {isEditMode ? t('inventory.modifyTax') : t('inventory.registerNewCategory')}
             </p>
           </div>
        </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">{t('inventory.categoryName')}</label>
              <input className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm font-bold text-slate-900 uppercase placeholder:text-slate-300" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder={t('inventory.categoryNamePlaceholder')} />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">{t('inventory.taxRatePct')}</label>
              <input type="number" step="0.01" className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm font-bold text-slate-900" required value={formData.taxRate} onChange={e => setFormData({...formData, taxRate: e.target.value})} placeholder="20" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">{t('inventory.description')}</label>
            <textarea className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm font-bold text-slate-900" rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder={t('inventory.descriptionPlaceholder')}></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button 
              type="button" 
              onClick={() => navigate('/categories')} 
              className="px-6 py-3 border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button 
              type="submit" 
              className="px-8 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
            >
              {isEditMode ? t('inventory.updateCategory') : t('inventory.createCategoryBtn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;
