import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const fetchProducts = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('http://localhost:5000/api/products', config);
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

  const filteredProducts = showLowStockOnly
    ? products.filter(p => p.currentStock < p.minStockThreshold && p.isActive !== false)
    : products;

  const totalValue = products.reduce((acc, p) => acc + (p.currentStock * p.sellingPrice), 0);
  const lowStockCount = products.filter(p => p.currentStock < p.minStockThreshold && p.isActive !== false).length;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Inventory Intelligence Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('inventory.totalWarehouseValue')}</p>
              <p className="text-2xl font-black text-gray-900 mt-1">€{totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('inventory.restockAlerts')}</p>
              <p className="text-2xl font-black text-red-600 mt-1">{lowStockCount} {t('inventory.products')}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('inventory.catalogSize')}</p>
              <p className="text-2xl font-black text-blue-600 mt-1">{products.length} {t('inventory.products')}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-6 border-b flex flex-col md:flex-row justify-between items-center bg-white gap-4">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/')} className="text-gray-500 hover:text-primary mr-2">{t('common.back')}</button>
              <h1 className="text-2xl font-bold text-foreground">{t('inventory.inventoryCatalog')}</h1>
            </div>

            <div className="flex items-center gap-6">
              {/* Toggle Filter */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase">{t('inventory.alertsOnly')}</label>
                <button
                  onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showLowStockOnly ? 'bg-red-500' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showLowStockOnly ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/inventory/movements')}
                  className="bg-white text-gray-700 border px-4 py-2 rounded text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
                >
                  {t('inventory.viewHistory')}
                </button>
                {['Admin', 'Employee_Stocks'].includes(user?.role) && (
                  <button
                    onClick={() => navigate('/inventory/new')}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-medium hover:opacity-90 transition-opacity shadow-sm"
                  >
                    {t('inventory.addProduct')}
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('inventory.product')}</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('inventory.sku')}</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('inventory.sellingPrice')}</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('inventory.buyingPrice')}</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">{t('inventory.stock')}</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="p-12 text-center text-gray-400 italic">
                      {t('inventory.loadingCatalog')}
                    </td>
                  </tr>
                ) : filteredProducts.map(p => (
                  <tr key={p._id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center gap-3">
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl.startsWith('/uploads') ? `http://localhost:5000${p.imageUrl}` : p.imageUrl}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover border shadow-sm"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 border">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span>{p.name}</span>
                        {p.isActive === false && <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded uppercase font-bold w-fit mt-1">{t('common.inactive')}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">{p.sku}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">€{p.sellingPrice?.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600">€{p.buyingPrice?.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      {p.currentStock < p.minStockThreshold ? (
                        <div className="flex flex-col items-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-100">
                            {p.currentStock} {t('inventory.units')}
                          </span>
                          <span className="text-[10px] text-red-400 font-bold mt-1 uppercase">{t('inventory.belowMin', {threshold: p.minStockThreshold})}</span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100">
                          {p.currentStock} {t('inventory.units')}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      {['Admin', 'Employee_Stocks'].includes(user?.role) && (
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          {p.isActive !== false ? (
                            <button onClick={() => navigate(`/inventory/stock/${p._id}`)} className="text-blue-600 font-bold hover:text-blue-800 text-[10px] tracking-wider border border-blue-200 bg-blue-50/50 hover:bg-blue-50 px-2.5 py-1 rounded transition-colors w-24">{t('inventory.adjustStock')}</button>
                          ) : (
                            <span className="text-gray-400 font-bold text-[10px] tracking-wider border border-gray-100 bg-gray-50 px-2.5 py-1 rounded cursor-not-allowed w-24 inline-block">{t('inventory.adjustStock')}</span>
                          )}
                          <button onClick={() => navigate(`/inventory/edit/${p._id}`)} className="text-gray-700 font-bold hover:text-gray-900 text-[10px] tracking-wider border border-gray-200 hover:bg-gray-50 px-2.5 py-1 rounded transition-colors w-24">{t('common.edit').toUpperCase()}</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {!loading && filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-12 text-center text-gray-500 italic">
                      {showLowStockOnly ? t('inventory.noLowStock') : t('inventory.noProducts')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
