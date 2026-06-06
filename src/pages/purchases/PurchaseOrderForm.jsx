import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import OcrInvoiceModal from './OcrInvoiceModal';

const PurchaseOrderForm = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orderItems, setOrderItems] = useState([{ product: '', quantity: 1, buyingPrice: 0 }]);
  const [documentNumber, setDocumentNumber] = useState(`PO-${Date.now().toString().slice(-6)}`);
  const [supplier, setSupplier] = useState('');
  
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useTranslation();

  // OCR modal state
  const [ocrModalOpen, setOcrModalOpen] = useState(false);

  // Create Product inline in PO states
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [newProductData, setNewProductData] = useState({
    name: '',
    sku: '',
    category: '',
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

  const handleProductFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPendingProductFile(file);
      setPreviewProductUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveProductImage = () => {
    setPendingProductFile(null);
    setPreviewProductUrl('');
    setNewProductData({ ...newProductData, imageUrl: '' });
    const fileInput = document.getElementById('po-product-upload');
    if (fileInput) fileInput.value = '';
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setProductUploading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      let uploadedUrl = newProductData.imageUrl;
      if (pendingProductFile) {
        const formDataFile = new FormData();
        formDataFile.append('image', pendingProductFile);
        const uploadConfig = { headers: { 'Content-Type': 'multipart/form-data' } };
        const { data } = await axios.post('http://localhost:5000/api/upload/products', formDataFile, uploadConfig);
        uploadedUrl = data;
      }

      const payload = { ...newProductData, imageUrl: uploadedUrl };

      // 1. Create product in DB
      const productRes = await axios.post('http://localhost:5000/api/products', payload, config);
      const newProduct = productRes.data;

      // 2. Link to selected supplier if present
      if (supplier) {
        const selectedSupplier = suppliers.find(s => s._id === supplier);
        if (selectedSupplier) {
          const updatedProductsList = [...(selectedSupplier.products || []), newProduct._id];
          await axios.put(`http://localhost:5000/api/suppliers/${supplier}`, {
            products: updatedProductsList
          }, config);

          // Update supplier in local state
          setSuppliers(prevSuppliers => prevSuppliers.map(s => {
            if (s._id === supplier) {
              return { ...s, products: updatedProductsList };
            }
            return s;
          }));
        }
      }

      // Add to products list state
      setProducts(prevProducts => [...prevProducts, newProduct]);

      // Auto-add as an item in the purchase order
      const newItem = { product: newProduct._id, quantity: 1, buyingPrice: newProduct.buyingPrice };
      if (orderItems.length === 1 && orderItems[0].product === '') {
        setOrderItems([newItem]);
      } else {
        setOrderItems([...orderItems, newItem]);
      }

      // Reset new product form, image states and close modal
      setNewProductData({
        name: '',
        sku: '',
        category: '',
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
    } catch (error) {
      console.error('Error creating product in PO form:', error);
      const msg = error.response?.data?.message || t('purchases.failedToCreateProduct');
      alert(msg);
    } finally {
      setProductUploading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const [suppData, prodData, catData] = await Promise.all([
        axios.get('http://localhost:5000/api/suppliers', config),
        axios.get('http://localhost:5000/api/products', config),
        axios.get('http://localhost:5000/api/categories', config)
      ]);
      setSuppliers(suppData.data);
      setProducts(prodData.data.filter(p => p.isActive !== false));
      setCategories(catData.data);
    };
    if (user) fetchData();
  }, [user]);

  const addItem = () => {
    setOrderItems([...orderItems, { product: '', quantity: 1, buyingPrice: 0 }]);
  };

  const removeItem = (index) => {
    const newItems = orderItems.filter((_, i) => i !== index);
    setOrderItems(newItems);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...orderItems];
    newItems[index][field] = value;
    
    // Auto-fill price if product changes
    if (field === 'product') {
      const selectedProd = products.find(p => p._id === value);
      if (selectedProd) {
        newItems[index].buyingPrice = selectedProd.buyingPrice;
      }
    }
    
    setOrderItems(newItems);
  };

  const calculateTotal = () => {
    return orderItems.reduce((acc, item) => acc + (item.quantity * item.buyingPrice), 0);
  };

  const getFilteredProducts = () => {
    if (!supplier) return [];
    const selectedSupplier = suppliers.find(s => s._id === supplier);
    if (!selectedSupplier || !selectedSupplier.products) return [];
    
    // Filter the full products list based on the supplier's products array
    return products.filter(p => selectedSupplier.products.includes(p._id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const filtered = getFilteredProducts();
    if (!supplier || orderItems.some(item => !item.product)) {
      alert(t('purchases.selectSupplierAndProducts'));
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('http://localhost:5000/api/purchases/orders', {
        supplier,
        documentNumber,
        documentType: 'Order',
        products: orderItems,
        totalAmount: calculateTotal()
      }, config);
      navigate('/purchases/orders');
    } catch (error) {
      console.error('Error creating order', error);
      alert(t('purchases.failedToCreateOrder'));
    }
  };

  const filteredProductsList = getFilteredProducts();

  const handleOcrResolved = ({ items, newProducts, supplier: updatedSupplier }) => {
    if (Array.isArray(newProducts) && newProducts.length > 0) {
      setProducts((prev) => {
        const existingIds = new Set(prev.map((p) => p._id));
        return [...prev, ...newProducts.filter((p) => !existingIds.has(p._id))];
      });
    }
    if (updatedSupplier && updatedSupplier._id) {
      setSuppliers((prev) => prev.map((s) => (
        s._id === updatedSupplier._id ? { ...s, products: updatedSupplier.products } : s
      )));
    }
    const incoming = (items || []).map((it) => ({
      product: it.product,
      quantity: Number(it.quantity),
      buyingPrice: Number(it.buyingPrice)
    }));
    if (incoming.length === 0) return;
    setOrderItems((prev) => {
      const isInitialEmpty = prev.length === 1 && prev[0].product === '';
      return isInitialEmpty ? incoming : [...prev, ...incoming];
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md border overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <h1 className="text-2xl font-bold">{t('purchases.newPurchaseOrder')}</h1>
          <button onClick={() => navigate('/purchases/orders')} className="text-gray-500 hover:text-gray-700">{t('common.cancel')}</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">{t('purchases.documentNumber')}</label>
              <input 
                type="text" 
                value={documentNumber} 
                readOnly
                className="w-full p-2 border rounded bg-gray-100 font-mono text-gray-500 cursor-not-allowed"
                title={t('purchases.autoGeneratedDoc')}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">{t('purchases.supplier')}</label>
              <select 
                value={supplier} 
                onChange={(e) => {
                  setSupplier(e.target.value);
                  setOrderItems([{ product: '', quantity: 1, buyingPrice: 0 }]); // Reset items when supplier changes
                }}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">{t('purchases.selectSupplier')}</option>
                {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="text-lg font-bold">{t('purchases.orderItems')}</h2>
              {supplier && filteredProductsList.length === 0 && (
                <span className="text-xs text-amber-600 italic">{t('purchases.supplierNoProducts')}</span>
              )}
            </div>
            {orderItems.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-gray-50 p-4 rounded-lg border">
                <div className="md:col-span-5">
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">{t('common.product')}</label>
                  <select 
                    value={item.product} 
                    onChange={(e) => updateItem(index, 'product', e.target.value)}
                    className="w-full p-2 border rounded bg-white disabled:opacity-50"
                    required
                    disabled={!supplier}
                  >
                    <option value="">{supplier ? t('purchases.selectProduct') : t('purchases.chooseSupplierFirst')}</option>
                    {filteredProductsList.map(p => <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">{t('common.qty')}</label>
                  <input 
                    type="number" 
                    value={item.quantity === '' ? '' : item.quantity} 
                    onChange={(e) => updateItem(index, 'quantity', e.target.value === '' ? '' : parseInt(e.target.value))}
                    min="1"
                    className="w-full p-2 border rounded bg-white"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">{t('purchases.buyingPrice')}</label>
                  <input 
                    type="number" 
                    value={item.buyingPrice === '' ? '' : item.buyingPrice} 
                    readOnly
                    step="0.01"
                    className="w-full p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed font-medium"
                    required
                    title={t('purchases.buyingPriceTooltip')}
                  />
                </div>
                <div className="md:col-span-2 text-right">
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">{t('common.subtotal')}</label>
                  <div className="p-2 font-bold">€{(item.quantity * item.buyingPrice).toFixed(2)}</div>
                </div>
                <div className="md:col-span-1 text-right">
                  <button type="button" onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700 p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                </div>
              </div>
            ))}
            <div className="flex justify-between items-center flex-wrap gap-3">
              <button 
                type="button" 
                onClick={addItem}
                className="text-primary font-bold text-sm hover:underline"
              >
                {t('purchases.addAnotherProduct')}
              </button>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setOcrModalOpen(true)}
                  disabled={!supplier}
                  title={!supplier ? t('purchases.ocr.selectSupplierFirst') : ''}
                  className="text-indigo-600 font-bold text-sm hover:underline flex items-center gap-1.5 disabled:text-slate-400 disabled:cursor-not-allowed disabled:no-underline"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                  {t('purchases.ocr.scanInvoice')}
                </button>
                <button 
                  type="button" 
                  onClick={() => setProductModalOpen(true)}
                  className="text-emerald-600 font-bold text-sm hover:underline flex items-center gap-1.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                  {t('purchases.createNewProduct')}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center border-t pt-6">
            <div className="text-right">
              <span className="text-gray-500 uppercase text-xs font-bold block">{t('purchases.totalAmount')}</span>
              <span className="text-3xl font-bold">€{calculateTotal().toFixed(2)}</span>
            </div>
            <button 
              type="submit" 
              className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-bold hover:opacity-90 shadow-lg"
            >
              {t('purchases.confirmOrder')}
            </button>
          </div>
        </form>
      </div>

      {/* OCR Invoice Scan Modal */}
      <OcrInvoiceModal
        isOpen={ocrModalOpen}
        onClose={() => setOcrModalOpen(false)}
        supplier={supplier}
        supplierName={suppliers.find(s => s._id === supplier)?.name}
        categories={categories}
        onResolved={handleOcrResolved}
      />

      {/* Create Product Modal */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">{t('purchases.createLinkNewProduct')}</h2>
              <button 
                type="button" 
                onClick={() => setProductModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-mono text-xl"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleCreateProduct} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">{t('purchases.productName')}</label>
                <input 
                  type="text" 
                  className="w-full p-2.5 border rounded-lg bg-white focus:ring-2 focus:ring-primary focus:outline-none text-sm" 
                  required 
                  value={newProductData.name} 
                  onChange={e => setNewProductData({...newProductData, name: e.target.value})} 
                  placeholder={t('purchases.productNamePlaceholder')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">{t('purchases.skuLabel')}</label>
                <input 
                  type="text" 
                  className="w-full p-2.5 border rounded-lg bg-white focus:ring-2 focus:ring-primary focus:outline-none text-sm font-mono" 
                  required 
                  value={newProductData.sku} 
                  onChange={e => setNewProductData({...newProductData, sku: e.target.value})} 
                  placeholder={t('purchases.skuPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">{t('purchases.categoryLabel')}</label>
                <select 
                  className="w-full p-2.5 border rounded-lg bg-white focus:ring-2 focus:ring-primary focus:outline-none text-sm" 
                  required 
                  value={newProductData.category} 
                  onChange={e => setNewProductData({...newProductData, category: e.target.value})} 
                >
                  <option value="">{t('purchases.selectCategory')}</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name} - {(c.taxRate * 100).toFixed(0)}%</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">{t('purchases.descriptionLabel')}</label>
                <textarea 
                  className="w-full p-2.5 border rounded-lg bg-white focus:ring-2 focus:ring-primary focus:outline-none text-sm" 
                  rows="2"
                  value={newProductData.description} 
                  onChange={e => setNewProductData({...newProductData, description: e.target.value})} 
                  placeholder={t('purchases.descriptionPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">{t('purchases.productImageUpload')}</label>
                <div className="flex items-center gap-4 border p-3 rounded-lg bg-slate-50 border-slate-200">
                  {previewProductUrl && (
                    <img src={previewProductUrl} alt="Preview" className="w-14 h-14 rounded object-cover border border-slate-200 shadow-sm bg-white" />
                  )}
                  <div className="flex-1">
                    <div className="flex gap-2 items-center">
                      <input id="po-product-upload" type="file" onChange={handleProductFileSelect} className="w-full p-2 border rounded-lg bg-white focus:ring-2 focus:ring-primary focus:outline-none text-xs" />
                      {(pendingProductFile || newProductData.imageUrl) && (
                        <button type="button" onClick={handleRemoveProductImage} className="px-2.5 py-2 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors text-xs font-semibold">
                          {t('common.remove')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 py-1">
                <input 
                  type="checkbox" 
                  id="po-product-isActive" 
                  checked={newProductData.isActive} 
                  onChange={e => setNewProductData({...newProductData, isActive: e.target.checked})} 
                  className="w-4 h-4 text-primary rounded focus:ring-primary" 
                />
                <label htmlFor="po-product-isActive" className="text-sm font-semibold text-slate-700">{t('purchases.productIsActive')}</label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">{t('purchases.sellingPriceLabel')}</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    className="w-full p-2.5 border rounded-lg bg-white focus:ring-2 focus:ring-primary focus:outline-none text-sm" 
                    required 
                    value={newProductData.sellingPrice === '' ? '' : newProductData.sellingPrice} 
                    onChange={e => setNewProductData({...newProductData, sellingPrice: e.target.value === '' ? '' : parseFloat(e.target.value)})} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">{t('purchases.buyingPriceLabel')}</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    className="w-full p-2.5 border rounded-lg bg-white focus:ring-2 focus:ring-primary focus:outline-none text-sm" 
                    required 
                    value={newProductData.buyingPrice === '' ? '' : newProductData.buyingPrice} 
                    onChange={e => setNewProductData({...newProductData, buyingPrice: e.target.value === '' ? '' : parseFloat(e.target.value)})} 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">{t('purchases.lowStockThreshold')}</label>
                <input 
                  type="number" 
                  className="w-full p-2.5 border rounded-lg bg-white focus:ring-2 focus:ring-primary focus:outline-none text-sm" 
                  required 
                  value={newProductData.minStockThreshold === '' ? '' : newProductData.minStockThreshold} 
                  onChange={e => setNewProductData({...newProductData, minStockThreshold: e.target.value === '' ? '' : parseInt(e.target.value)})} 
                />
              </div>

              {supplier ? (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span dangerouslySetInnerHTML={{ __html: t('purchases.willBeLinked', { name: suppliers.find(s => s._id === supplier)?.name }) }}></span>
                </div>
              ) : (
                <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  <span>{t('purchases.noSupplierSelected')}</span>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t mt-6 bg-slate-50 -mx-6 -mb-6 p-6">
                <button 
                  type="button" 
                  onClick={() => setProductModalOpen(false)} 
                  className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button 
                  type="submit" 
                  disabled={productUploading}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {productUploading ? t('common.creating') : t('purchases.createAndLink')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrderForm;
