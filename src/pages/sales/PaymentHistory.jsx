import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const PaymentHistory = () => {
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const fetchSale = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/sales/${id}`, config);
        setSale(data);
      } catch (error) {
        console.error('Error fetching sale details', error);
      } finally {
        setLoading(false);
      }
    };
    if (user && id) fetchSale();
  }, [user, id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-[#f8fafc] to-slate-100/80 flex items-center justify-center">
        <div className="inline-block w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-[#f8fafc] to-slate-100/80 flex flex-col items-center justify-center p-8">
        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-4">{t('paymentHistory.invoiceNotFound')}</h2>
        <button onClick={() => navigate('/sales')} className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 hover:-translate-y-0.5 transition-all duration-200">
          {t('paymentHistory.backToSales')}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-[#f8fafc] to-slate-100/80 p-4 md:p-8 font-sans antialiased text-slate-900">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Top Header - Glassmorphism like Dashboard */}
        <header className="flex flex-col md:flex-row justify-between items-center p-6 rounded-[2rem] border border-white/50 backdrop-blur-md bg-white/70 shadow-lg shadow-slate-100/40 transition-all duration-300 gap-6">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button onClick={() => navigate('/sales')} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-md transition-all duration-300 hover:-translate-x-1 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">{t('paymentHistory.title')}</h1>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] mt-0.5">{t('paymentHistory.invoiceNumber', { number: sale.documentNumber })}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6 md:gap-8 bg-white/50 p-4 rounded-2xl border border-white/50 w-full md:w-auto justify-between md:justify-end">
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('paymentHistory.totalAmount')}</p>
              <p className="text-xl font-black text-slate-800">€{(sale.totalWithTax || sale.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div className="w-px h-10 bg-slate-200"></div>
            <div className="text-right">
              <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">{t('paymentHistory.remainingDue')}</p>
              <p className="text-xl font-black text-rose-600">€{(sale.remainingBalance !== undefined ? sale.remainingBalance : (sale.totalWithTax || sale.totalAmount)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100/80 shadow-md shadow-slate-100/30">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-10 text-center">{t('paymentHistory.timeline')}</h2>
          
          <div className="relative max-w-3xl mx-auto">
            {/* Center Line for Timeline */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-100 via-slate-100 to-transparent -translate-x-1/2 rounded-full hidden md:block"></div>
            
            <div className="space-y-8">
              {sale.payments && sale.payments.length > 0 ? sale.payments.map((payment, index) => (
                <div key={index} className={`relative flex items-center justify-between md:justify-normal group ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                  
                  {/* Timeline Dot */}
                  <div className="absolute left-0 md:left-1/2 w-12 h-12 rounded-2xl flex items-center justify-center border-4 border-white shadow-lg -translate-x-1/2 z-10 transition-transform duration-300 group-hover:scale-110 bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                  </div>
                  
                  {/* Content Card */}
                  <div className={`w-full md:w-[calc(50%-3rem)] pl-16 md:pl-0 ${index % 2 === 0 ? 'md:pl-12' : 'md:pr-12'}`}>
                    <div className="bg-white p-6 rounded-2xl border border-slate-100/80 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group-hover:border-indigo-100">
                      {/* Decorative Background Element */}
                      <div className="absolute -right-6 -top-6 w-24 h-24 bg-slate-50 rounded-full group-hover:bg-indigo-50/50 transition-colors duration-300 -z-10"></div>
                      
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2.5 py-1 rounded-md">{new Date(payment.date).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        <span className="text-xl font-black text-slate-800">€{payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                          {payment.paymentMethod === 'Cash' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path></svg>
                          ) : payment.paymentMethod === 'Bank Transfer' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
                          ) : payment.paymentMethod === 'Check' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M16 13H8"></path><path d="M16 17H8"></path><path d="M10 9H8"></path></svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">{t(`sales.${payment.paymentMethod.replace(/\s+/g, '')}`, { defaultValue: payment.paymentMethod })}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-20 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100 text-slate-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                  </div>
                  <p className="text-sm font-black text-slate-400 uppercase tracking-widest">{t('paymentHistory.noPayments')}</p>
                  <p className="text-xs font-medium text-slate-400 mt-2 max-w-sm mx-auto">{t('paymentHistory.noPaymentsDesc')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;
