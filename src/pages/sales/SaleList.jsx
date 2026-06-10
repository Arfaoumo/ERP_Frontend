import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '../../components/ConfirmationModal';
import { useTranslation } from 'react-i18next';
const getStatusBadgeClass = status => {
  switch (status) {
    case 'Pending':
    case 'In Transit':
    case 'Partially Paid':
      return 'bg-yellow-50 text-yellow-700 border-yellow-100';
    case 'Processed':
    case 'Delivered':
    case 'Finalized':
    case 'Paid':
      return 'bg-green-50 text-green-700 border-green-100';
    case 'Cancelled':
      return 'bg-slate-100 text-slate-500 border-slate-200';
    case 'Overdue':
      return 'bg-red-50 text-red-700 border-red-100';
    default:
      return 'bg-slate-100 text-slate-500 border-slate-200';
  }
};
const SaleList = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalConfig, setModalConfig] = useState({
    open: false,
    sale: null,
    action: ''
  });
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: 'Cash'
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [activeSale, setActiveSale] = useState(null);
  const {
    user
  } = useContext(AuthContext);
  const navigate = useNavigate();
  const {
    t,
    i18n
  } = useTranslation();
  const handleConfirmAction = async () => {
    const {
      sale,
      action
    } = modalConfig;
    if (!sale) return;
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
      if (action === 'convert') {
        await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/sales/${sale._id}/convert`, {}, config);
      }
      fetchSales();
      setModalConfig({
        open: false,
        sale: null,
        action: ''
      });
    } catch (err) {
      alert(err.response?.data?.message || t('sales.errorProcessing'));
    }
  };
  const openModal = (sale, action) => {
    setModalConfig({
      open: true,
      sale,
      action
    });
  };
  const openPaymentModal = sale => {
    setActiveSale(sale);
    setPaymentForm({
      amount: (sale.remainingBalance || sale.totalAmount).toFixed(2),
      paymentMethod: 'Cash'
    });
    setShowPaymentModal(true);
  };
  const handlePaymentSubmit = async e => {
    e.preventDefault();
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/sales/${activeSale._id}/payment`, paymentForm, config);
      fetchSales();
      setShowPaymentModal(false);
      setActiveSale(null);
    } catch (err) {
      alert(err.response?.data?.message || t('sales.errorPayment'));
    }
  };
  const fetchSales = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
      const {
        data
      } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/sales`, config);
      setSales(data.filter(s => s.documentType === 'DeliveryNote' || s.documentType === 'Invoice'));
    } catch (error) {
      console.error('Error fetching sales', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (user) fetchSales();
  }, [user]);
  const filteredSales = sales.filter(s => {
    const matchesSearch = s.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()) || (s.customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const isPendingFinancial = s.documentType === 'Invoice' && (s.paymentStatus === 'Pending' || s.paymentStatus === 'Partially Paid' || s.paymentStatus === 'Overdue') || s.documentType === 'DeliveryNote' && s.status === 'In Transit';
    const matchesPending = !showPendingOnly || isPendingFinancial;
    return matchesSearch && matchesPending;
  });
  const totalRevenue = sales.filter(s => s.status === 'In Transit' || s.status === 'Delivered').reduce((acc, s) => acc + s.totalAmount, 0);
  const pendingCount = sales.filter(s => s.status === 'Pending').length;
  return <div className="min-h-screen bg-[#f8fafc] p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="p-8 border-b flex flex-col md:flex-row justify-between items-center bg-white gap-4">
            <div className="flex items-center gap-4">
               <button onClick={() => navigate('/')} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
               </button>
               <div>
                 <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{t('sales.invoicesBilling')}</h1>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t('sales.financialLedger')}</p>
               </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              {}
              <div className="relative">
                <input type="text" placeholder={t('sales.searchPlaceholder')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none w-64" />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>



              {}
              <div className="flex items-center gap-2 px-3 border-l ml-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{t('sales.pendingOnly')}</label>
                <button onClick={() => setShowPendingOnly(!showPendingOnly)} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${showPendingOnly ? 'bg-blue-600' : 'bg-gray-200'}`}>
                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${showPendingOnly ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
              </div>


            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b">
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">{t('sales.document')}</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">{t('sales.customer')}</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">{t('common.date')}</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">{t('sales.totalExclTax')}</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">{t('sales.totalInclTax')}</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">{t('sales.balanceDue')}</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">{t('common.status')}</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? <tr>
                    <td colSpan="8" className="p-12 text-center text-gray-400 italic">{t('sales.loadingSales')}</td>
                  </tr> : filteredSales.map(s => <tr key={s._id} className="border-b hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-mono font-bold text-blue-600">{s.documentNumber}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase mt-1">{s.documentType === 'DeliveryNote' ? t('sales.deliveryNote') : s.documentType}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-center">{s.customer?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {new Date(s.createdAt).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-black text-slate-900">
                      €{(s.totalAmount || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-black text-slate-900">
                      €{(s.totalWithTax || s.totalAmount || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-black">
                      {s.documentType === 'Invoice' && s.remainingBalance > 0 ? <span className="text-rose-500">
                          €{s.remainingBalance.toFixed(2)}
                        </span> : <span className="text-slate-300">-</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex flex-col items-center gap-2">
                        {}
                        {!(s.documentType === 'Invoice' && s.paymentStatus !== 'Paid') && <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadgeClass(s.status)}`}>
                            {t(`status.${s.status}`, {
                        defaultValue: s.status
                      })}
                          </span>}

                        {}
                        {s.documentType === 'Invoice' && s.paymentStatus !== 'Paid' && <div className="flex flex-col items-center gap-1">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStatusBadgeClass(s.paymentStatus)}`}>
                              {t(`status.${s.paymentStatus}`, {
                          defaultValue: s.paymentStatus
                        })}
                            </span>
                            {}
                          </div>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex flex-col justify-center items-center gap-2">
                        {s.status === 'Pending' && s.documentType === 'Quote' && <button onClick={() => openModal(s, 'convert')} className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest transition-all">{t('sales.convertToOrder')}</button>}
                        {s.status === 'Pending' && s.documentType === 'Order' && <button onClick={() => openModal(s, 'convert')} className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest transition-all">{t('sales.createDeliveryNote')}</button>}
                        {s.status === 'In Transit' && s.documentType === 'DeliveryNote' && <button onClick={() => openModal(s, 'convert')} className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest transition-all">{t('sales.issueInvoice')}</button>}
                        {s.documentType === 'Invoice' && (s.paymentStatus === 'Pending' || s.paymentStatus === 'Partially Paid' || s.paymentStatus === 'Overdue') && <button onClick={() => openPaymentModal(s)} className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest transition-all">{t('sales.recordPayment')}</button>}
                        
                        {s.payments && s.payments.length > 0 && <button onClick={() => navigate(`/sales/history/${s._id}`)} className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest transition-all">{t('sales.paymentHistory')}</button>}

                        {(s.documentType === 'Invoice' || s.documentType === 'DeliveryNote' || s.documentType === 'Quote' || s.documentType === 'Order') && <button onClick={() => window.open(`/sales/invoice/${s._id}`, '_blank')} className="text-[10px] font-black text-gray-600 hover:text-gray-800 uppercase tracking-widest flex items-center gap-1 transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                            {t('sales.viewPdf')}
                          </button>}
                      </div>
                    </td>
                  </tr>)}
                {!loading && filteredSales.length === 0 && <tr>
                    <td colSpan="8" className="p-12 text-center text-gray-500 italic">
                      {showPendingOnly ? t('sales.noPending') : t('sales.noSales')}
                    </td>
                  </tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmationModal isOpen={modalConfig.open} onClose={() => setModalConfig({
      open: false,
      sale: null,
      action: ''
    })} onConfirm={handleConfirmAction} title={t('sales.convertDocument')} message={modalConfig.sale?.documentType === 'Order' ? t('sales.convertOrderMsg', {
      number: modalConfig.sale?.documentNumber
    }) : t('sales.convertMsg', {
      type: modalConfig.sale?.documentType,
      number: modalConfig.sale?.documentNumber
    })} confirmText={t('common.confirm')} type="primary" />

      {showPaymentModal && activeSale && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-200">
            <h3 className="text-lg font-black text-slate-900 mb-2">{t('sales.recordPaymentTitle')}</h3>
            <p className="text-xs text-slate-500 mb-4">{t('sales.invoiceBalance', {
            number: activeSale.documentNumber,
            balance: (activeSale.remainingBalance || activeSale.totalAmount).toFixed(2)
          })}</p>
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">{t('sales.amountLabel')}</label>
                <input type="number" step="0.01" required value={paymentForm.amount} onChange={e => setPaymentForm({
              ...paymentForm,
              amount: e.target.value
            })} className="w-full p-2 border border-slate-200 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">{t('sales.paymentMethod')}</label>
                <select value={paymentForm.paymentMethod} onChange={e => setPaymentForm({
              ...paymentForm,
              paymentMethod: e.target.value
            })} className="w-full p-2 border border-slate-200 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  <option value="Cash">{t('sales.cash')}</option>
                  <option value="Check">{t('sales.check')}</option>
                </select>
              </div>
              {}
              <div className="flex gap-3 justify-end mt-6">
                <button type="button" onClick={() => setShowPaymentModal(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded">{t('common.cancel')}</button>
                <button type="submit" className="px-4 py-2 text-sm font-bold bg-blue-600 text-white rounded hover:bg-blue-700">{t('sales.savePayment')}</button>
              </div>
            </form>
          </div>
        </div>}
    </div>;
};
export default SaleList;