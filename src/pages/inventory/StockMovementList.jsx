import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const StockMovementList = () => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const fetchMovements = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('http://localhost:5000/api/products/movements', config);
      setMovements(data);
    } catch (error) {
      console.error('Error fetching movements', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchMovements();
  }, [user]);

  const filteredMovements = movements.filter(m => {
    const productMatch = m.product && m.product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const userMatch = m.user && (`${m.user.firstName} ${m.user.lastName}`).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = productMatch || userMatch || (searchTerm === '');

    const matchesType = typeFilter === 'ALL' || m.type === typeFilter;

    let matchesDate = true;
    if (startDate || endDate) {
      const mDate = new Date(m.createdAt);
      mDate.setHours(0, 0, 0, 0);
      
      if (startDate) {
        const sDate = new Date(startDate);
        sDate.setHours(0, 0, 0, 0);
        if (mDate < sDate) matchesDate = false;
      }
      if (endDate) {
        const eDate = new Date(endDate);
        eDate.setHours(23, 59, 59, 999);
        if (mDate > eDate) matchesDate = false;
      }
    }

    return matchesSearch && matchesType && matchesDate;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto bg-card rounded-xl shadow-sm border overflow-hidden">
        <div className="p-6 border-b flex flex-col md:flex-row justify-between items-center bg-white gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/inventory')} className="text-gray-500 hover:text-primary mr-2">{t('common.back')}</button>
            <h1 className="text-2xl font-bold text-foreground">{t('inventory.stockMovementsHistory')}</h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input 
              type="text" 
              placeholder={t('inventory.searchMovementsPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary"
            />
            
            <select 
              value={typeFilter} 
              onChange={(e) => setTypeFilter(e.target.value)}
              className="p-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary"
            >
              <option value="ALL">{t('inventory.allMovements')}</option>
              <option value="IN">{t('inventory.stockIn')}</option>
              <option value="OUT">{t('inventory.stockOut')}</option>
            </select>

            <div className="flex items-center gap-2 border border-gray-200 rounded p-1 bg-white">
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="p-1 text-sm border-none focus:outline-none bg-transparent text-gray-700"
                title="Start Date"
              />
              <span className="text-gray-400 text-xs">{t('common.to')}</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="p-1 text-sm border-none focus:outline-none bg-transparent text-gray-700"
                title="End Date"
              />
            </div>
            
            {(searchTerm || typeFilter !== 'ALL' || startDate || endDate) && (
              <button 
                onClick={() => { setSearchTerm(''); setTypeFilter('ALL'); setStartDate(''); setEndDate(''); }}
                className="p-2 text-xs text-red-500 hover:bg-red-50 rounded font-bold"
              >
                {t('common.clear')}
              </button>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('inventory.date')}</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('inventory.product')}</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">{t('inventory.type')}</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">{t('inventory.qty')}</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('inventory.user')}</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('inventory.reasonRef')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="relative w-10 h-10">
                        <div className="absolute top-0 left-0 w-full h-full border-4 border-primary/20 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-full h-full border-4 border-t-primary rounded-full animate-spin"></div>
                      </div>
                      <p className="mt-4 text-sm font-medium text-gray-500 animate-pulse">{t('inventory.loadingMovements')}</p>
                    </div>
                  </td>
                </tr>
              ) : filteredMovements.map(m => (
                <tr key={m._id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(m.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {m.product ? (
                      <div>
                        <p>{m.product.name}</p>
                        <p className="text-xs text-gray-400">{m.product.sku}</p>
                      </div>
                    ) : <span className="text-red-400 italic">{t('inventory.productDeleted')}</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    {m.type === 'IN' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-800">{t('inventory.stockIn').toUpperCase()}</span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-800">{t('inventory.stockOut').toUpperCase()}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-center">
                    {m.type === 'IN' ? `+${m.quantity}` : `-${m.quantity}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {m.user ? `${m.user.firstName} ${m.user.lastName}` : t('inventory.systemUser')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 italic">
                    {m.reason || '-'}
                  </td>
                </tr>
              ))}
              {!loading && filteredMovements.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">{t('inventory.noMovements')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockMovementList;
