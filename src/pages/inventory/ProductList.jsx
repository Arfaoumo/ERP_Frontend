import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const {
    user
  } = useContext(AuthContext);
  const navigate = useNavigate();
  const {
    t
  } = useTranslation();
  const fetchProducts = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
      const {
        data
      } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products`, config);
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (user) fetchProducts();
  }, [user]);
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStock = showLowStockOnly ? p.currentStock < p.minStockThreshold && p.isActive !== false : true;
    return matchesSearch && matchesStock;
  });
  const totalValue = products.reduce((acc, p) => acc + p.currentStock * p.sellingPrice, 0);
  const lowStockCount = products.filter(p => p.currentStock < p.minStockThreshold && p.isActive !== false).length;
  return <div className="min-h-screen bg-[#f8fafc] p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('inventory.totalWarehouseValue')}</p>
              <p className="text-2xl font-black text-slate-900 mt-1 tracking-tight">€{totalValue.toLocaleString(undefined, {
                minimumFractionDigits: 2
              })}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('inventory.restockAlerts')}</p>
              <p className="text-2xl font-black text-rose-500 mt-1 tracking-tight">{lowStockCount} {t('inventory.products')}</p>
            </div>
            <div className="p-3 bg-rose-50 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-rose-400"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('inventory.catalogSize')}</p>
              <p className="text-2xl font-black text-blue-600 mt-1 tracking-tight">{products.length} {t('inventory.products')}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="p-8 border-b flex flex-col xl:flex-row justify-between items-center bg-white gap-6">
            <div className="flex items-center gap-4 w-full xl:w-auto justify-between xl:justify-start">
              <div className="flex items-center gap-4">
                <button onClick={() => navigate('/')} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                </button>
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{t('inventory.inventoryCatalog')}</h1>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t('inventory.manageStockAlerts')}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-4 w-full xl:w-auto">
              {}
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest cursor-pointer" onClick={() => setShowLowStockOnly(!showLowStockOnly)}>{t('inventory.alertsOnly')}</label>
                <button onClick={() => setShowLowStockOnly(!showLowStockOnly)} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${showLowStockOnly ? 'bg-rose-500' : 'bg-slate-300'}`}>
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${showLowStockOnly ? 'translate-x-4' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="relative flex-1 min-w-[200px] xl:w-64">
                <input type="text" placeholder={t('common.search', 'Rechercher...')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-slate-700 bg-slate-50" />
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>

              <div className="flex gap-3 w-full sm:w-auto">
                <button onClick={() => navigate('/inventory/movements')} className="flex-1 sm:flex-none bg-slate-50 text-slate-600 border border-slate-200 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 hover:text-slate-800 transition-colors shadow-sm">
                  {t('inventory.viewHistory')}
                </button>
                {['Admin', 'Employee_Stocks'].includes(user?.role) && <button onClick={() => navigate('/inventory/new')} className="flex-1 sm:flex-none bg-blue-600 text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95">
                    {t('inventory.addProduct')}
                  </button>}
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('inventory.product')}</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('inventory.sku')}</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('inventory.sellingPrice')}</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('inventory.buyingPrice')}</th>
                  <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('inventory.stock')}</th>
                  <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? <tr>
                    <td colSpan="6" className="p-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="relative w-10 h-10">
                          <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600/20 rounded-full"></div>
                          <div className="absolute top-0 left-0 w-full h-full border-4 border-t-blue-600 rounded-full animate-spin"></div>
                        </div>
                        <p className="mt-4 text-sm font-medium text-slate-500 animate-pulse">{t('inventory.loadingCatalog')}</p>
                      </div>
                    </td>
                  </tr> : filteredProducts.map(p => <tr key={p._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center justify-start gap-4">
                      {p.imageUrl ? <img src={p.imageUrl.startsWith('/uploads') ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${p.imageUrl}` : p.imageUrl} alt={p.name} className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-sm" loading="lazy" /> : <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-300 border border-slate-200 shadow-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                        </div>}
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{p.name}</span>
                        {p.isActive === false && <span className="text-[10px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full uppercase font-black w-fit mt-1 tracking-widest">{t('common.inactive')}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono text-left">{p.sku}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-slate-900 text-left">€{p.sellingPrice?.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-400 text-left">€{p.buyingPrice?.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      {p.currentStock < p.minStockThreshold ? <div className="flex flex-col items-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black tracking-widest bg-rose-50 text-rose-500 border border-rose-100">
                            {p.currentStock} {t('inventory.units')}
                          </span>
                          <span className="text-[10px] text-rose-400 font-bold mt-1.5 uppercase tracking-widest">{t('inventory.belowMin', {
                        threshold: p.minStockThreshold
                      })}</span>
                        </div> : <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
                          {p.currentStock} {t('inventory.units')}
                        </span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      {['Admin', 'Employee_Stocks'].includes(user?.role) && <div className="flex flex-col items-center justify-center gap-1.5">
                          {p.isActive !== false ? <button onClick={() => navigate(`/inventory/stock/${p._id}`)} className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest transition-all">
                              {t('inventory.adjustStock')}
                            </button> : <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest cursor-not-allowed">
                              {t('inventory.adjustStock')}
                            </span>}
                          <button onClick={() => navigate(`/inventory/edit/${p._id}`)} className="text-[10px] font-black text-slate-500 hover:text-slate-700 uppercase tracking-widest transition-all">
                            {t('common.edit')}
                          </button>
                        </div>}
                    </td>
                  </tr>)}
                {!loading && filteredProducts.length === 0 && <tr>
                    <td colSpan="6" className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                      {showLowStockOnly ? t('inventory.noLowStock') : searchTerm ? t('common.noResults') : t('inventory.noProducts')}
                    </td>
                  </tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>;
};
export default ProductList;