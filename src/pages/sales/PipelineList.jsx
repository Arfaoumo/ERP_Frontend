import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '../../components/ConfirmationModal';
import { useTranslation } from 'react-i18next';

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Pending':
    case 'In Transit':
    case 'Partially Paid':
      return 'bg-yellow-50 text-yellow-700 border-yellow-100';
    case 'Processed':
    case 'Delivered':
    case 'Finalized':
      return 'bg-green-50 text-green-700 border-green-100';
    case 'Cancelled':
      return 'bg-slate-100 text-slate-500 border-slate-200';
    case 'Overdue':
      return 'bg-red-50 text-red-700 border-red-100';
    default:
      return 'bg-slate-100 text-slate-500 border-slate-200';
  }
};

const PipelineList = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalConfig, setModalConfig] = useState({ open: false, sale: null, action: '' });
  
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const fetchSales = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('http://localhost:5000/api/sales', config);
      // Filter for Pipeline: Quotes and Orders only
      setSales(data.filter(s => s.documentType === 'Quote' || s.documentType === 'Order'));
    } catch (error) {
      console.error('Error fetching sales pipeline', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchSales();
  }, [user]);

  const handleConfirmAction = async () => {
    const { sale, action } = modalConfig;
    if (!sale) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      if (action === 'convert') {
        await axios.post(`http://localhost:5000/api/sales/${sale._id}/convert`, {}, config);
      } else if (action === 'cancel') {
        await axios.patch(`http://localhost:5000/api/sales/${sale._id}/cancel`, {}, config);
      }
      fetchSales();
      setModalConfig({ open: false, sale: null, action: '' });
    } catch (err) {
      alert(err.response?.data?.message || `Error ${action === 'convert' ? 'converting' : 'cancelling'} document`);
    }
  };

  const filteredSales = sales.filter(s => {
    const matchesSearch = s.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (s.customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPending = !showPendingOnly || s.status === 'Pending';
    
    return matchesSearch && matchesPending;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="p-8 border-b flex flex-col md:flex-row justify-between items-center bg-white gap-4">
            <div className="flex items-center gap-4">
               <button onClick={() => navigate('/')} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
               </button>
               <div>
                 <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{t('pipeline.title')}</h1>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t('pipeline.subtitle')}</p>
               </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder={t('pipeline.searchPipeline')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none w-64 transition-all"
                />
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>

              {/* Toggle Filter */}
              <div className="flex items-center gap-2 px-3 border-l ml-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{t('pipeline.pendingOnly')}</label>
                <button 
                  onClick={() => setShowPendingOnly(!showPendingOnly)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${showPendingOnly ? 'bg-blue-600' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${showPendingOnly ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
              </div>
              <button 
                onClick={() => navigate('/sales/new')}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
              >
                {t('pipeline.newQuote')}
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('pipeline.documentNumber')}</th>
                  <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('pipeline.customer')}</th>
                  <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('common.date')}</th>
                  <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('pipeline.total')}</th>
                  <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('pipeline.status')}</th>
                  <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('pipeline.action')}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="p-20 text-center">
                      <div className="inline-block w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                      <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('pipeline.loadingPipeline')}</p>
                    </td>
                  </tr>
                ) : filteredSales.map(s => (
                  <tr key={s._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-black text-blue-600 font-mono tracking-tighter">{s.documentNumber}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase mt-1">{s.documentType === 'DeliveryNote' ? t('sales.deliveryNote') : s.documentType}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <p className="text-sm font-black text-slate-900">{s.customer?.name}</p>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <p className="text-xs font-bold text-slate-500 uppercase">{new Date(s.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-8 py-6 text-center text-sm font-black text-slate-900">
                      €{s.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusBadgeClass(s.status)}`}>
                        {t(`status.${s.status}`, { defaultValue: s.status })}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex flex-col justify-center items-center gap-2">
                        {s.status === 'Pending' && s.documentType === 'Quote' && (
                          <>
                            <button 
                              onClick={() => setModalConfig({ open: true, sale: s, action: 'convert' })}
                              className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest transition-all"
                            >
                              {t('pipeline.convertToOrder')}
                            </button>
                            <button 
                              onClick={() => setModalConfig({ open: true, sale: s, action: 'cancel' })}
                              className="text-[10px] font-black uppercase tracking-widest transition-all text-rose-600 hover:text-rose-800 cursor-pointer"
                            >
                              {t('pipeline.cancelQuote')}
                            </button>
                          </>
                        )}
                        {s.status === 'Pending' && s.documentType === 'Order' && (
                          <button 
                            onClick={() => setModalConfig({ open: true, sale: s, action: 'convert' })}
                            className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest transition-all"
                          >
                            {t('pipeline.createDeliveryNote')}
                          </button>
                        )}
                        {s.payments && s.payments.length > 0 && (
                          <button 
                            onClick={() => navigate(`/sales/history/${s._id}`)}
                            className="text-[10px] font-black text-slate-600 hover:text-slate-800 uppercase tracking-widest transition-all"
                          >
                            {t('pipeline.paymentHistory')}
                          </button>
                        )}
                        <button 
                          onClick={() => window.open(`/sales/invoice/${s._id}`, '_blank')}
                          className="text-[10px] font-black text-gray-600 hover:text-gray-800 uppercase tracking-widest flex items-center gap-1 transition-all"
                          title="View PDF"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                          {t('pipeline.viewPdf')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && filteredSales.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-20 text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{t('pipeline.pipelineClear')}</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmationModal 
        isOpen={modalConfig.open}
        onClose={() => setModalConfig({ open: false, sale: null, action: '' })}
        onConfirm={handleConfirmAction}
        title={t('pipeline.pipelineTransition')}
        message={
          modalConfig.action === 'cancel'
            ? t('pipeline.cancelQuoteMsg', { number: modalConfig.sale?.documentNumber })
            : modalConfig.sale?.documentType === 'Order'
            ? t('pipeline.convertOrderMsg', { number: modalConfig.sale?.documentNumber })
            : t('pipeline.convertQuoteMsg', { number: modalConfig.sale?.documentNumber })
        }
        confirmText={modalConfig.action === 'cancel' ? t('pipeline.cancelQuoteBtn') : t('common.confirm')}
        type={modalConfig.action === 'cancel' ? 'danger' : 'primary'}
      />
    </div>
  );
};

export default PipelineList;
