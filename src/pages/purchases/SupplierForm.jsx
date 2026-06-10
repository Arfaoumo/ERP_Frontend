import { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
const SupplierForm = () => {
  const {
    id
  } = useParams();
  const isEditMode = Boolean(id);
  const [formData, setFormData] = useState({
    name: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    vatNumber: '',
    isActive: true,
    products: []
  });
  const [allProducts, setAllProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const {
    user
  } = useContext(AuthContext);
  const navigate = useNavigate();
  const {
    t
  } = useTranslation();
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [newProductData, setNewProductData] = useState({
    name: '',
    sku: '',
    description: '',
    sellingPrice: 0,
    buyingPrice: 0,
    minStockThreshold: 10,
    imageUrl: '',
    isActive: true
  });
  const [productUploading, setProductUploading] = useState(false);
  const [pendingProductFile, setPendingProductFile] = useState(null);
  const [previewProductUrl, setPreviewProductUrl] = useState('');
  const handleProductFileSelect = e => {
    const file = e.target.files[0];
    if (file) {
      setPendingProductFile(file);
      setPreviewProductUrl(URL.createObjectURL(file));
    }
  };
  const handleRemoveProductImage = () => {
    setPendingProductFile(null);
    setPreviewProductUrl('');
    setNewProductData({
      ...newProductData,
      imageUrl: ''
    });
    const fileInput = document.getElementById('po-product-upload');
    if (fileInput) fileInput.value = '';
  };
  const handleCreateProduct = async e => {
    e.preventDefault();
    setProductUploading(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
      let uploadedUrl = newProductData.imageUrl;
      if (pendingProductFile) {
        const formDataFile = new FormData();
        formDataFile.append('image', pendingProductFile);
        const uploadConfig = {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        };
        const {
          data
        } = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/upload/products`, formDataFile, uploadConfig);
        uploadedUrl = data;
      }
      const payload = {
        ...newProductData,
        imageUrl: uploadedUrl
      };
      const productRes = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products`, payload, config);
      const newProduct = productRes.data;
      setAllProducts(prev => [...prev, newProduct]);
      setFormData(prev => ({
        ...prev,
        products: [...prev.products, newProduct._id]
      }));
      setNewProductData({
        name: '',
        sku: '',
        description: '',
        sellingPrice: 0,
        buyingPrice: 0,
        minStockThreshold: 10,
        imageUrl: '',
        isActive: true
      });
      setPendingProductFile(null);
      setPreviewProductUrl('');
      setProductModalOpen(false);
      alert(t('suppliers.productCreatedSuccess'));
    } catch (error) {
      console.error('Error creating product in Supplier form:', error);
      alert(t('suppliers.errorCreatingProduct'));
    } finally {
      setProductUploading(false);
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        };
        const {
          data: prodData
        } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products`, config);
        setAllProducts(prodData);
        if (isEditMode) {
          const {
            data: suppData
          } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/suppliers`, config);
          const supplier = suppData.find(s => s._id === id);
          if (supplier) {
            setFormData({
              name: supplier.name,
              contactName: supplier.contactName || '',
              email: supplier.email,
              phone: supplier.phone || '',
              address: supplier.address || '',
              vatNumber: supplier.vatNumber || '',
              isActive: supplier.isActive,
              products: supplier.products || []
            });
          }
        }
      } catch (error) {
        console.error('Error fetching data', error);
      }
    };
    if (user) fetchData();
  }, [id, user, isEditMode]);
  const handleProductToggle = productId => {
    setFormData(prev => {
      const isSelected = prev.products.includes(productId);
      const newProducts = isSelected ? prev.products.filter(id => id !== productId) : [...prev.products, productId];
      return {
        ...prev,
        products: newProducts
      };
    });
  };
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
      if (isEditMode) {
        await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/suppliers/${id}`, formData, config);
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/suppliers`, formData, config);
      }
      navigate('/purchases/suppliers');
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || t('suppliers.errorSaving'));
    }
  };
  const filteredProducts = allProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase()));
  return <div className="min-h-screen bg-[#f8fafc] p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-[2rem] shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="p-8 border-b flex justify-between items-center bg-white">
          <div className="flex items-center gap-4">
           <button onClick={() => navigate('/purchases/suppliers')} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
           </button>
           <div>
             <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
               {isEditMode ? t('suppliers.updateProfile') : t('suppliers.onboardNew')}
             </h1>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
               {isEditMode ? 'Profil du Fournisseur' : 'Nouveau Fournisseur'}
             </p>
           </div>
        </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">{t('suppliers.companyNameLabel')}</label>
              <input className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm font-bold text-slate-900 uppercase placeholder:text-slate-300" required value={formData.name} onChange={e => setFormData({
              ...formData,
              name: e.target.value
            })} placeholder={t('suppliers.companyNamePlaceholder')} />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">{t('suppliers.contactName')}</label>
              <input className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm font-bold text-slate-900 uppercase placeholder:text-slate-300" value={formData.contactName} onChange={e => setFormData({
              ...formData,
              contactName: e.target.value
            })} placeholder={t('suppliers.contactNamePlaceholder')} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">{t('common.email')}</label>
              <input type="email" className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm font-bold text-slate-900 placeholder:text-slate-300" required value={formData.email} onChange={e => setFormData({
              ...formData,
              email: e.target.value
            })} placeholder={t('suppliers.emailPlaceholder')} />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">{t('common.phone')}</label>
              <input className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm font-bold text-slate-900 uppercase placeholder:text-slate-300" value={formData.phone} onChange={e => setFormData({
              ...formData,
              phone: e.target.value
            })} placeholder={t('suppliers.phonePlaceholder')} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">{t('suppliers.vatNumber')}</label>
            <input className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm font-bold text-slate-900 uppercase placeholder:text-slate-300" value={formData.vatNumber} onChange={e => setFormData({
            ...formData,
            vatNumber: e.target.value
          })} placeholder={t('suppliers.vatPlaceholder')} />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">{t('suppliers.physicalAddress')}</label>
            <textarea className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm font-bold text-slate-900 placeholder:text-slate-300" rows="2" value={formData.address} onChange={e => setFormData({
            ...formData,
            address: e.target.value
          })} placeholder={t('suppliers.addressPlaceholder')}></textarea>
          </div>
          
          <div className="pt-6 border-t mt-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
              <label className="block text-sm font-bold uppercase text-gray-500 tracking-tight">{t('suppliers.suppliedProducts')}</label>
              <div className="flex items-center gap-3">
                <span className="text-xs text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                  {t('suppliers.selected', {
                  count: formData.products.length
                })}
                </span>
                <div className="relative flex-1 sm:w-64">
                  <input type="text" placeholder={t('suppliers.searchProducts')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </div>
                <button type="button" onClick={() => setProductModalOpen(true)} className="p-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-all shadow-sm" title={t('suppliers.createNewProduct')}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-1">
              {filteredProducts.length === 0 && <div className="col-span-full py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400 italic">
                  {searchTerm ? t('suppliers.noProductsMatching', {
                term: searchTerm
              }) : t('suppliers.noProductsCatalog')}
                </div>}
              {filteredProducts.map(p => {
              const isSelected = formData.products.includes(p._id);
              return <div key={p._id} onClick={() => handleProductToggle(p._id)} className={`
                      cursor-pointer p-3 rounded-xl border transition-all flex items-center gap-3 select-none
                      ${isSelected ? 'bg-primary/5 border-primary shadow-sm' : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm'}
                    `}>
                    <div className={`
                      w-5 h-5 rounded-md border flex items-center justify-center transition-colors
                      ${isSelected ? 'bg-primary border-primary' : 'bg-white border-gray-300'}
                    `}>
                      {isSelected && <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${isSelected ? 'text-primary' : 'text-gray-700'}`}>
                        {p.name}
                      </p>
                      <p className="text-[10px] text-gray-400 font-mono">
                        {p.sku}
                      </p>
                    </div>
                  </div>;
            })}
            </div>
          </div>

          <div className="flex items-center p-6 bg-slate-50 rounded-2xl border border-slate-100 mt-6">
            <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({
            ...formData,
            isActive: e.target.checked
          })} className="mr-4 cursor-pointer w-5 h-5 accent-blue-600 rounded" />
            <div>
              <label htmlFor="isActive" className="text-xs font-black uppercase text-slate-700 tracking-widest cursor-pointer block">{t('suppliers.activeSupplier')}</label>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t('suppliers.activeSupplierDesc')}</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button type="button" onClick={() => navigate('/purchases/suppliers')} className="px-6 py-3 border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors">{t('common.cancel')}</button>
            <button type="submit" className="px-8 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95">
              {isEditMode ? t('suppliers.updateSupplier') : t('suppliers.completeOnboarding')}
            </button>
          </div>
        </form>
      </div>

      {}
      {productModalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">{t('suppliers.createNewProduct')}</h2>
              <button type="button" onClick={() => setProductModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-mono text-xl">
                &times;
              </button>
            </div>
            
            <form onSubmit={handleCreateProduct} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">{t('suppliers.productName')}</label>
                <input type="text" className="w-full p-2.5 border rounded-lg bg-white focus:ring-2 focus:ring-primary focus:outline-none text-sm" required value={newProductData.name} onChange={e => setNewProductData({
              ...newProductData,
              name: e.target.value
            })} placeholder={t('suppliers.productNamePlaceholder')} />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">{t('suppliers.skuLabel')}</label>
                <input type="text" className="w-full p-2.5 border rounded-lg bg-white focus:ring-2 focus:ring-primary focus:outline-none text-sm font-mono" required value={newProductData.sku} onChange={e => setNewProductData({
              ...newProductData,
              sku: e.target.value
            })} placeholder={t('suppliers.skuPlaceholder')} />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">{t('suppliers.descriptionLabel')}</label>
                <textarea className="w-full p-2.5 border rounded-lg bg-white focus:ring-2 focus:ring-primary focus:outline-none text-sm" rows="2" value={newProductData.description} onChange={e => setNewProductData({
              ...newProductData,
              description: e.target.value
            })} placeholder={t('suppliers.descriptionPlaceholder')} />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">{t('suppliers.productImageUpload')}</label>
                <div className="flex items-center gap-4 border p-3 rounded-lg bg-slate-50 border-slate-200">
                  {previewProductUrl && <img src={previewProductUrl} alt="Preview" className="w-14 h-14 rounded object-cover border border-slate-200 shadow-sm bg-white" />}
                  <div className="flex-1">
                    <div className="flex gap-2 items-center">
                      <input id="po-product-upload" type="file" onChange={handleProductFileSelect} className="w-full p-2 border rounded-lg bg-white focus:ring-2 focus:ring-primary focus:outline-none text-xs" />
                      {(pendingProductFile || newProductData.imageUrl) && <button type="button" onClick={handleRemoveProductImage} className="px-2.5 py-2 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors text-xs font-semibold">
                          {t('common.remove')}
                        </button>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 py-1">
                <input type="checkbox" id="po-product-isActive" checked={newProductData.isActive} onChange={e => setNewProductData({
              ...newProductData,
              isActive: e.target.checked
            })} className="w-4 h-4 text-primary rounded focus:ring-primary" />
                <label htmlFor="po-product-isActive" className="text-sm font-semibold text-slate-700">{t('suppliers.productIsActive')}</label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">{t('suppliers.sellingPriceLabel')}</label>
                  <input type="number" step="0.01" className="w-full p-2.5 border rounded-lg bg-white focus:ring-2 focus:ring-primary focus:outline-none text-sm" required value={newProductData.sellingPrice} onChange={e => setNewProductData({
                ...newProductData,
                sellingPrice: parseFloat(e.target.value) || 0
              })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">{t('suppliers.buyingPriceLabel')}</label>
                  <input type="number" step="0.01" className="w-full p-2.5 border rounded-lg bg-white focus:ring-2 focus:ring-primary focus:outline-none text-sm" required value={newProductData.buyingPrice} onChange={e => setNewProductData({
                ...newProductData,
                buyingPrice: parseFloat(e.target.value) || 0
              })} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">{t('suppliers.lowStockThreshold')}</label>
                <input type="number" className="w-full p-2.5 border rounded-lg bg-white focus:ring-2 focus:ring-primary focus:outline-none text-sm" required value={newProductData.minStockThreshold} onChange={e => setNewProductData({
              ...newProductData,
              minStockThreshold: parseInt(e.target.value) || 0
            })} />
              </div>

              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span dangerouslySetInnerHTML={{
              __html: t('suppliers.willBeAdded')
            }}></span>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t mt-6 bg-slate-50 -mx-6 -mb-6 p-6">
                <button type="button" onClick={() => setProductModalOpen(false)} className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                  {t('common.cancel')}
                </button>
                <button type="submit" disabled={productUploading} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50">
                  {productUploading ? t('common.creating') : t('suppliers.createProduct')}
                </button>
              </div>
            </form>
          </div>
        </div>}
    </div>;
};
export default SupplierForm;