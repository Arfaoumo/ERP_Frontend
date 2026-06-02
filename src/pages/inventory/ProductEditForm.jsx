import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ProductEditForm = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({ name: '', sku: '', category: '', description: '', sellingPrice: 0, buyingPrice: 0, minStockThreshold: 10, imageUrl: '', isActive: true });
  const [categories, setCategories] = useState([]);
  const [pendingFile, setPendingFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get('http://localhost:5000/api/products', config);
        const currentProduct = data.find(p => p._id === id);
        if (currentProduct) {
          setFormData({
            name: currentProduct.name,
            sku: currentProduct.sku,
            category: currentProduct.category?._id || currentProduct.category || '',
            description: currentProduct.description || '',
            sellingPrice: currentProduct.sellingPrice,
            buyingPrice: currentProduct.buyingPrice,
            minStockThreshold: currentProduct.minStockThreshold,
            imageUrl: currentProduct.imageUrl || '',
            isActive: currentProduct.isActive !== undefined ? currentProduct.isActive : true
          });
        }
      } catch (error) {
        console.error('Error fetching product', error);
      }
    };
    if (user) fetchProduct();
  }, [id, user]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get('http://localhost:5000/api/categories', config);
        setCategories(data);
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
        const { data } = await axios.post('http://localhost:5000/api/upload/products', formDataFile, uploadConfig);
        uploadedUrl = data;
      }

      const payload = { ...formData, imageUrl: uploadedUrl };
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`http://localhost:5000/api/products/${id}`, payload, config);
      navigate('/inventory');
    } catch (error) {
      console.error(error);
      setUploading(false);
      alert(t('inventory.errorUpdating'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex justify-center items-start pt-20">
      <div className="w-full max-w-lg bg-card p-8 rounded-xl shadow-sm border">
        <h1 className="text-2xl font-bold mb-6 text-foreground">{t('inventory.editProduct')}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('inventory.productName')}</label>
            <input className="w-full p-2.5 border rounded bg-white focus:ring-2 focus:ring-primary focus:outline-none" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('inventory.skuLabel')}</label>
            <input className="w-full p-2.5 border rounded bg-white focus:ring-2 focus:ring-primary focus:outline-none" required value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('inventory.category')}</label>
            <select className="w-full p-2.5 border rounded bg-white focus:ring-2 focus:ring-primary focus:outline-none" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
              <option value="" disabled>{t('inventory.selectCategory')}</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name} - {cat.taxRate * 100}%</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('inventory.productImageUpload')}</label>
            <div className="flex items-center gap-4">
              {(previewUrl || formData.imageUrl) ? (
                <img src={previewUrl || (formData.imageUrl.startsWith('/uploads') ? `http://localhost:5000${formData.imageUrl}` : formData.imageUrl)} alt="Preview" className="w-16 h-16 rounded object-cover border-2 border-gray-200 shadow-sm" />
              ) : (
                <div className="w-16 h-16 rounded bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                </div>
              )}
              <div className="flex-1">
                <div className="flex gap-2 items-center">
                  <input id="product-upload" type="file" onChange={handleFileSelect} className="w-full p-2.5 border rounded bg-white focus:ring-2 focus:ring-primary focus:outline-none text-sm" />
                  {(pendingFile || formData.imageUrl) && (
                    <button type="button" onClick={handleRemoveImage} className="px-3 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100 transition-colors text-sm font-medium">
                      {t('common.remove')}
                    </button>
                  )}
                </div>
                {uploading && <p className="text-sm text-gray-500 mt-1">{t('common.uploadingAndSaving')}</p>}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('inventory.sellingPriceLabel')}</label>
              <input type="number" step="0.01" className="w-full p-2.5 border rounded bg-white focus:ring-2 focus:ring-primary focus:outline-none" required value={formData.sellingPrice} onChange={e => setFormData({...formData, sellingPrice: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('inventory.buyingPriceLabel')}</label>
              <input type="number" step="0.01" className="w-full p-2.5 border rounded bg-white focus:ring-2 focus:ring-primary focus:outline-none" required value={formData.buyingPrice} onChange={e => setFormData({...formData, buyingPrice: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('inventory.lowStockThreshold')}</label>
            <input type="number" className="w-full p-2.5 border rounded bg-white focus:ring-2 focus:ring-primary focus:outline-none" required value={formData.minStockThreshold} onChange={e => setFormData({...formData, minStockThreshold: e.target.value})} />
          </div>
          <div className="flex items-center gap-2 mt-4">
            <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-4 h-4 text-primary rounded focus:ring-primary" />
            <label htmlFor="isActive" className="text-sm font-medium">{t('inventory.productIsActive')}</label>
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
            <button type="button" onClick={() => navigate('/inventory')} className="px-4 py-2 border rounded text-sm font-medium hover:bg-gray-50 transition-colors">{t('common.cancel')}</button>
            <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:opacity-90 transition-opacity">{t('inventory.updateProduct')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductEditForm;
