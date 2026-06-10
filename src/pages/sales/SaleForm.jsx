import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
const SaleForm = () => {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [saleItems, setSaleItems] = useState([{
    product: '',
    quantity: 1,
    sellingPrice: 0
  }]);
  const [documentType] = useState('Quote');
  const [documentNumber, setDocumentNumber] = useState(`QT-${Date.now().toString().slice(-6)}`);
  const [customer, setCustomer] = useState('');
  const [courier, setCourier] = useState('NONE');
  const [couriers, setCouriers] = useState([]);
  useEffect(() => {
    setDocumentNumber(`QT-${Date.now().toString().slice(-6)}`);
  }, []);
  const {
    user
  } = useContext(AuthContext);
  const navigate = useNavigate();
  const {
    t
  } = useTranslation();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        };
        const [custData, prodData, courierData] = await Promise.all([axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/customers`, config), axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products`, config), axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/delivery-companies`, config)]);
        setCustomers(custData.data.filter(c => c.isActive));
        setProducts(prodData.data.filter(p => p.isActive !== false));
        setCouriers(courierData.data);
      } catch (error) {
        console.error('Error fetching data', error);
      }
    };
    if (user) fetchData();
  }, [user]);
  const addItem = () => {
    setSaleItems([...saleItems, {
      product: '',
      quantity: 1,
      sellingPrice: 0
    }]);
  };
  const removeItem = index => {
    const newItems = saleItems.filter((_, i) => i !== index);
    setSaleItems(newItems);
  };
  const updateItem = (index, field, value) => {
    const newItems = [...saleItems];
    newItems[index][field] = value;
    if (field === 'product') {
      const selectedProd = products.find(p => p._id === value);
      if (selectedProd) {
        newItems[index].sellingPrice = selectedProd.sellingPrice;
      }
    }
    setSaleItems(newItems);
  };
  const calculateTotal = () => {
    return saleItems.reduce((acc, item) => acc + item.quantity * item.sellingPrice, 0);
  };
  const calculateDynamicTax = () => {
    return saleItems.reduce((acc, item) => {
      const prod = products.find(p => p._id === item.product);
      const taxRate = prod?.category?.taxRate ?? 0.19;
      return acc + item.quantity * item.sellingPrice * taxRate;
    }, 0);
  };
  const handleSubmit = async e => {
    e.preventDefault();
    if (!customer || saleItems.some(item => !item.product)) {
      alert(t('saleForm.selectCustomerProducts'));
      return;
    }
    for (const item of saleItems) {
      const p = products.find(prod => prod._id === item.product);
      if (p && p.currentStock < item.quantity) {
        alert(t('saleForm.insufficientStock', {
          name: p.name,
          stock: p.currentStock
        }));
        return;
      }
    }
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
      const itemsWithSubtotal = saleItems.map(item => ({
        ...item,
        subtotal: item.quantity * item.sellingPrice
      }));
      const totalAmt = calculateTotal();
      const taxAmount = calculateDynamicTax();
      const totalWithTax = totalAmt + taxAmount;
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/sales`, {
        customer,
        documentNumber,
        documentType,
        items: itemsWithSubtotal,
        totalAmount: totalAmt,
        taxAmount,
        totalWithTax,
        courier
      }, config);
      navigate('/sales/pipeline');
    } catch (error) {
      console.error('Error creating sale', error);
      alert(t('saleForm.errorCreating'));
    }
  };
  return <div className="min-h-screen bg-[#f8fafc] p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-[2rem] shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="p-8 border-b flex justify-between items-center bg-white">
          <div className="flex items-center gap-4">
             <button onClick={() => navigate('/sales/pipeline')} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
             </button>
             <div>
               <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{t('saleForm.title')}</h1>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t('saleForm.subtitle')}</p>
             </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">{t('saleForm.documentNumber')}</label>
              <input type="text" value={documentNumber} readOnly className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 font-mono text-slate-400 font-bold cursor-not-allowed" title="Auto-generated document number" required />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">{t('saleForm.selectCustomer')}</label>
              <select value={customer} onChange={e => setCustomer(e.target.value)} className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm font-bold text-slate-900" required>
                <option value="">{t('saleForm.chooseClient')}</option>
                {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">{t('saleForm.deliveryBy')}</label>
            <select value={courier} onChange={e => setCourier(e.target.value)} className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm font-bold text-slate-900">
              <option value="NONE">{t('common.none')}</option>
              {couriers.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
            </select>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">{t('saleForm.invoiceItems')}</h2>
              <button type="button" onClick={addItem} className="text-xs font-black text-blue-600 hover:text-blue-800 flex items-center gap-1 uppercase tracking-widest transition-colors">
                <span>{t('saleForm.addItem')}</span>
              </button>
            </div>
            
            {saleItems.map((item, index) => <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                <div className="md:col-span-5">
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">{t('saleForm.product')}</label>
                  <select value={item.product} onChange={e => updateItem(index, 'product', e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-bold text-slate-900 transition-all" required>
                    <option value="">{t('saleForm.selectProduct')}</option>
                    {products.map(p => <option key={p._id} value={p._id} disabled={p.currentStock <= 0}>
                        {p.name} ({t('inventory.stock')}: {p.currentStock})
                      </option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">{t('saleForm.qty')}</label>
                  <input type="number" min="1" value={item.quantity} onChange={e => updateItem(index, 'quantity', parseInt(e.target.value))} className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-bold text-slate-900 transition-all" required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">{t('saleForm.sellingPrice')}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">€</span>
                    <input type="number" step="0.01" value={item.sellingPrice} readOnly className="w-full pl-7 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-400 cursor-not-allowed" required />
                  </div>
                </div>
                <div className="md:col-span-2 text-right self-center">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">{t('saleForm.subtotal')}</p>
                  <p className="font-black text-slate-900 text-sm">€{(item.quantity * item.sellingPrice).toFixed(2)}</p>
                </div>
                <div className="md:col-span-1 text-center">
                  {saleItems.length > 1 && <button type="button" onClick={() => removeItem(index)} className="text-slate-300 hover:text-rose-600 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>}
                </div>
              </div>)}
          </div>

          <div className="flex justify-end pt-8 border-t border-slate-100">
            <div className="w-72 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-bold">{t('saleForm.subtotalExclTax')}</span>
                <span className="font-black text-slate-900">€{calculateTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-bold">{t('saleForm.totalTaxAmount')}</span>
                <span className="font-black text-slate-900">€{calculateDynamicTax().toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t-2 border-slate-900">
                <span className="text-sm font-black uppercase tracking-widest text-slate-900">{t('saleForm.totalInclTax')}</span>
                <span className="text-2xl font-black text-blue-600 tracking-tighter">€{(calculateTotal() + calculateDynamicTax()).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button type="button" onClick={() => navigate('/sales/pipeline')} className="px-6 py-3 border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors">
              {t('common.cancel')}
            </button>
            <button type="submit" className="px-8 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95">
              {t('saleForm.createQuote')}
            </button>
          </div>
        </form>
      </div>
    </div>;
};
export default SaleForm;