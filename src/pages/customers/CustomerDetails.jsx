import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const CustomerDetails = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [sales, setSales] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [loading, setLoading] = useState(true);
  
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        
        // Fetch Customers
        const custRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/customers`, config);
        const currentCustomer = custRes.data.find(c => c._id === id);
        setCustomer(currentCustomer);

        // Fetch Sales
        const salesRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/sales`, config);
        const customerSales = salesRes.data.filter(s => s.customer._id === id || s.customer === id);
        
        // Sort sales chronological (newest first for timeline)
        const sortedSales = customerSales.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setSales(sortedSales);

      } catch (error) {
        console.error('Error fetching customer details', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchData();
  }, [id, user]);

  const filteredSales = sales.filter(s => {
    const matchesSearch = s.documentNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || s.documentType === filterType;
    return matchesSearch && matchesType;
  });

  if (loading) return (
    <div className="min-h-screen bg-[#f8fafc] p-8 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">{t('customers.loadingProfile')}</p>
      </div>
    </div>
  );
  if (!customer) return <div className="min-h-screen bg-[#f8fafc] p-12 text-center text-[10px] font-black text-rose-500 uppercase tracking-widest">{t('customers.customerNotFound')}</div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header Profile */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200/60 p-8 flex flex-col md:flex-row justify-between items-start gap-6">
          <div>
            <button onClick={() => navigate('/customers')} className="text-slate-400 hover:text-slate-600 mb-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
              {t('customers.backToDirectory')}
            </button>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{customer.name}</h1>
            <p className="text-slate-500 mt-2 flex items-center gap-2 text-sm font-bold">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              {customer.email}
            </p>
            <p className="text-slate-500 mt-1 flex items-center gap-2 text-sm font-bold">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              {customer.phone || t('common.noPhone')}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
               <span className="px-3 py-1 bg-slate-50 text-slate-600 text-[10px] font-black rounded-lg border border-slate-200 tracking-widest uppercase">CIN: {customer.cin || 'N/A'}</span>
               <span className={`px-3 py-1 text-[10px] font-black rounded-lg border tracking-widest ${customer.isActive ? 'bg-green-50 text-green-700 border-green-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                 {customer.isActive ? t('common.active').toUpperCase() : t('common.inactive').toUpperCase()}
               </span>
            </div>
          </div>
          <div className="md:text-right w-full md:w-auto p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('customers.lifetimeRevenue')}</p>
             <p className="text-4xl font-black text-blue-600 tracking-tighter">€{customer.totalSpent?.toFixed(2) || '0.00'}</p>
          </div>
        </div>

        {/* Timeline View */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200/60 p-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-slate-100 pb-6 gap-4">
            <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase">{t('customers.transactionHistory')}</h2>
            
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <input 
                  type="text" 
                  placeholder={t('customers.searchById')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-400"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>
              
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer tracking-wider"
              >
                <option value="All">{t('customers.allTypes')}</option>
                <option value="Quote">{t('customers.quotes')}</option>
                <option value="Order">{t('customers.orders')}</option>
                <option value="DeliveryNote">{t('customers.deliveryNotes')}</option>
                <option value="Invoice">{t('customers.invoices')}</option>
              </select>
            </div>
          </div>
          
          {filteredSales.length === 0 ? (
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-center py-12">{t('customers.noTransactions')}</p>
          ) : (
            <div className="relative border-l-2 border-slate-100 ml-4 space-y-8 pb-8">
              {filteredSales.map((sale, index) => {
                let badgeColor = 'bg-slate-100 text-slate-600 border-slate-200';
                if (sale.documentType === 'Order') badgeColor = 'bg-blue-50 text-blue-700 border-blue-100';
                if (sale.documentType === 'DeliveryNote') badgeColor = 'bg-purple-50 text-purple-700 border-purple-100';
                if (sale.documentType === 'Invoice') badgeColor = 'bg-rose-50 text-rose-700 border-rose-100';

                return (
                  <div key={sale._id} className="relative pl-8">
                    {/* Timeline Dot */}
                    <div className={`absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-4 border-white ${badgeColor.split(' ')[0]} shadow-sm`}></div>
                    
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-md border ${badgeColor}`}>
                            {sale.documentType === 'DeliveryNote' ? t('customers.deliveryNote') : t(`invoice.${sale.documentType === 'Order' ? 'commande' : sale.documentType === 'Invoice' ? 'facture' : 'devis'}`)}
                          </span>
                          <span className="ml-3 font-mono font-bold text-slate-900">{sale.documentNumber}</span>
                        </div>
                        <div className="text-right">
                           <p className="font-black text-slate-900 tracking-tight">€{sale.totalAmount.toFixed(2)}</p>
                           <p className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-widest mt-1">
                             {new Date(sale.createdAt).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US')}
                           </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-4">
                        <span className="px-2.5 py-1 bg-white border border-slate-200 rounded text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          {t('common.status')}: {sale.status}
                        </span>
                        {sale.documentType === 'Invoice' && (
                           <span className={`px-2.5 py-1 border rounded text-[10px] font-black uppercase tracking-widest ${
                             sale.paymentStatus === 'Paid' ? 'bg-green-50 text-green-700 border-green-200' : 
                             sale.paymentStatus === 'Overdue' ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse' :
                             'bg-amber-50 text-amber-700 border-amber-200'
                           }`}>
                             PAIEMENT: {sale.paymentStatus}
                           </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default CustomerDetails;
