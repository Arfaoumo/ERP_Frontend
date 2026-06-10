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
  const {
    user
  } = useContext(AuthContext);
  const navigate = useNavigate();
  const {
    t,
    i18n
  } = useTranslation();
  const fetchMovements = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
      const {
        data
      } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products/movements`, config);
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
    const userMatch = m.user && `${m.user.firstName} ${m.user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = productMatch || userMatch || searchTerm === '';
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
  const translateReason = reason => {
    if (!reason) return '-';
    if (reason.startsWith('Sales Order #')) return `${t('inventory.salesOrder')} #${reason.split('#')[1]}`;
    if (reason.startsWith('Delivery Note #')) return `${t('inventory.deliveryNote')} #${reason.split('#')[1]}`;
    if (reason.startsWith('Reception of PO #')) return `${t('inventory.receptionPO')} #${reason.split('#')[1]}`;
    if (reason.includes('adjustment:')) return t('inventory.manualAdjustment');
    return reason;
  };
  return <div className="min-h-screen bg-[#f8fafc] p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="p-8 border-b flex flex-col xl:flex-row justify-between items-center bg-white gap-6">
            <div className="flex items-center gap-4 w-full xl:w-auto justify-between xl:justify-start">
              <div className="flex items-center gap-4">
                <button onClick={() => navigate('/inventory')} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                </button>
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{t('inventory.movementsHistory')}</h1>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t('inventory.completeHistory')}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-3 w-full xl:w-auto">
              <div className="relative w-full xl:w-[400px]">
                <input type="text" placeholder={t('inventory.searchMovementsPlaceholder')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-slate-700 bg-slate-50" />
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 w-full">
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="py-2.5 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none text-[10px] font-black uppercase tracking-widest text-slate-700 transition-all">
                  <option value="ALL">{t('inventory.allMovements')}</option>
                  <option value="IN">{t('inventory.stockIn')}</option>
                  <option value="OUT">{t('inventory.stockOut')}</option>
                </select>

                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-transparent border-none focus:outline-none text-xs font-bold text-slate-700 w-28" title={t('inventory.startDate', 'Date de début')} lang={i18n.language === 'fr' ? 'fr-FR' : 'en-US'} />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('common.to')}</span>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-transparent border-none focus:outline-none text-xs font-bold text-slate-700 w-28" title={t('inventory.endDate', 'Date de fin')} lang={i18n.language === 'fr' ? 'fr-FR' : 'en-US'} />
                </div>

                {(searchTerm || typeFilter !== 'ALL' || startDate || endDate) && <button onClick={() => {
                setSearchTerm('');
                setTypeFilter('ALL');
                setStartDate('');
                setEndDate('');
              }} className="w-10 h-10 flex items-center justify-center rounded-xl bg-rose-50 text-rose-400 hover:bg-rose-100 hover:text-rose-600 transition-colors" title={t('common.clear')}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>}
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('inventory.date')}</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('inventory.product')}</th>
                  <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('inventory.type')}</th>
                  <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('inventory.qty')}</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('inventory.user')}</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('inventory.reason')}</th>
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
                        <p className="mt-4 text-sm font-medium text-slate-500 animate-pulse">{t('inventory.loadingMovements')}</p>
                      </div>
                    </td>
                  </tr> : filteredMovements.map(m => <tr key={m._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-500">
                      {new Date(m.createdAt).toLocaleString(i18n.language, {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {m.product ? <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{m.product.name}</span>
                          <span className="text-[10px] font-black text-slate-400 tracking-widest">{m.product.sku}</span>
                        </div> : <span className="text-[10px] font-black text-rose-400 tracking-widest uppercase">{t('inventory.productDeleted')}</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {m.type === 'IN' ? <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">{t('inventory.stockIn').toUpperCase()}</span> : <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black tracking-widest bg-rose-50 text-rose-500 border border-rose-100">{t('inventory.stockOut').toUpperCase()}</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-center text-slate-900">
                      {m.type === 'IN' ? `+${m.quantity}` : `-${m.quantity}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-600">
                      {m.user ? `${m.user.firstName} ${m.user.lastName}` : t('inventory.systemUser')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[10px] font-black tracking-widest text-slate-400 uppercase">
                      {translateReason(m.reason)}
                    </td>
                  </tr>)}
                {!loading && filteredMovements.length === 0 && <tr>
                    <td colSpan="6" className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                      {t('inventory.noMovements')}
                    </td>
                  </tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>;
};
export default StockMovementList;