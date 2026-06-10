import { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ProductForm = () => {
  const [formData, setFormData] = useState({ name: '', sku: '', category: '', description: '', sellingPrice: 0, buyingPrice: 0, minStockThreshold: 10, imageUrl: '', isActive: true });
  const [categories, setCategories] = useState([]);
  const [pendingFile, setPendingFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/categories`, config);
        setCategories(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, category: data[0]._id }));
        }
      } catch (error) {
        console.error('Error fetching categories', error);
      }
    };
    if (user) fetchCategories();
  }, [user]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPendingFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setPendingFile(null);
    setPreviewUrl('');
    setFormData({ ...formData, imageUrl: '' });
    const fileInput = document.getElementById('product-upload');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      let uploadedUrl = formData.imageUrl;
      if (pendingFile) {
        const formDataFile = new FormData();
        formDataFile.append('image', pendingFile);
        const uploadConfig = { headers: { 'Content-Type': 'multipart/form-data' } };
        const { data } = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/upload/products`, formDataFile, uploadConfig);
        uploadedUrl = data;
      }

      const payload = { ...formData, imageUrl: uploadedUrl };
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products`, payload, config);
      navigate('/inventory');
    } catch (error) {
      console.error(error);
      setUploading(false);
      alert(t('inventory.errorSaving'));
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-[2rem] shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="p-8 border-b flex justify-between items-center bg-white">
          <div className="flex items-center gap-4">
           <button onClick={() => navigate('/inventory')} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
           </button>
           <div>
             <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
               {t('inventory.createProduct')}
             </h1>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
               {t('inventory.registerNew', 'Enregistrer un nouveau produit')}
             </p>
           </div>
        </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">{t('inventory.productName')}</label>
              <input className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm font-bold text-slate-900 uppercase placeholder:text-slate-300" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder={t('inventory.productName')} />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">{t('inventory.skuLabel')}</label>
              <input className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm font-bold text-slate-900 uppercase placeholder:text-slate-300" required value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} placeholder={t('inventory.skuLabel')} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">{t('inventory.category')}</label>
              <select className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm font-bold text-slate-900" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                <option value="" disabled>{t('inventory.selectCategory')}</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name} - {(cat.taxRate * 100).toFixed(0)}%</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">{t('inventory.lowStockThreshold')}</label>
              <input type="number" className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm font-bold text-slate-900" required value={formData.minStockThreshold} onChange={e => setFormData({...formData, minStockThreshold: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">{t('inventory.sellingPriceLabel')}</label>
              <input type="number" step="0.01" className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm font-bold text-slate-900" required value={formData.sellingPrice} onChange={e => setFormData({...formData, sellingPrice: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">{t('inventory.buyingPriceLabel')}</label>
              <input type="number" step="0.01" className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm font-bold text-slate-900" required value={formData.buyingPrice} onChange={e => setFormData({...formData, buyingPrice: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">{t('inventory.productImageUpload')}</label>
            <div className="flex items-center gap-4">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-sm" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-slate-50 flex items-center justify-center border border-dashed border-slate-300 text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                </div>
              )}
              <div className="flex-1">
                <div className="flex gap-2 items-center">
                  <input id="product-upload" type="file" onChange={handleFileSelect} className="w-full p-2.5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-bold text-slate-700" />
                  {(pendingFile || formData.imageUrl) && (
                    <button type="button" onClick={handleRemoveImage} className="px-4 py-2.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl hover:bg-rose-100 transition-colors text-xs font-black uppercase tracking-widest">
                      {t('common.remove')}
                    </button>
                  )}
                </div>
                {uploading && <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest animate-pulse">{t('common.uploadingAndSaving')}</p>}
              </div>
            </div>
          </div>

          <div className="flex items-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="mr-4 cursor-pointer w-5 h-5 accent-blue-600 rounded" />
            <div>
              <label htmlFor="isActive" className="text-xs font-black uppercase text-slate-700 tracking-widest cursor-pointer block">{t('inventory.productIsActive')}</label>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Le produit sera visible dans le catalogue</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button type="button" onClick={() => navigate('/inventory')} className="px-6 py-3 border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors">{t('common.cancel')}</button>
            <button type="submit" className="px-8 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95">{t('inventory.saveProduct')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
