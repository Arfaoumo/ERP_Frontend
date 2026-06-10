import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
const Dashboard = () => {
  const {
    user,
    logout
  } = useContext(AuthContext);
  const navigate = useNavigate();
  const {
    t,
    i18n
  } = useTranslation();
  const [sales, setSales] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        };
        const [salesRes, alertsRes, metricsRes] = await Promise.all([axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/sales`, config).catch(() => ({
          data: []
        })), axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/alerts`, config).catch(() => ({
          data: []
        })), axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/dashboard/metrics`, config).catch(() => ({
          data: null
        }))]);
        setSales(salesRes.data || []);
        setAlerts(alertsRes.data || []);
        setMetrics(metricsRes.data || null);
      } catch (error) {
        console.error('Error fetching dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchDashboardData();
  }, [user]);
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  const invoices = sales.filter(s => s.documentType === 'Invoice');
  const activeInvoices = invoices.filter(s => s.status !== 'Cancelled');
  const pendingOrdersRevenue = metrics?.pendingOrdersRevenue || 0;
  const pendingOrdersCount = metrics?.pendingOrdersCount || 0;
  const transitRevenue = metrics?.transitRevenue || 0;
  const deliveriesInTransitCount = metrics?.transitCount || 0;
  const overdueRevenue = metrics?.overdueRevenue || 0;
  const overdueInvoicesCount = metrics?.overdueCount || 0;
  const totalRevenue = metrics?.totalRevenueMonth || 0;
  const currentMonthPaidInvoicesCount = metrics?.finalizedInvoicesCount || 0;
  const monthlyData = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    monthlyData[`${d.toLocaleString(i18n.language || 'en-US', {
      month: 'short'
    })}`] = 0;
  }
  activeInvoices.forEach(inv => {
    const month = new Date(inv.createdAt).toLocaleString(i18n.language || 'en-US', {
      month: 'short'
    });
    if (monthlyData[month] !== undefined) monthlyData[month] += inv.totalWithTax;
  });
  const maxMonthValue = Math.max(...Object.values(monthlyData), 1000);
  return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-[#f8fafc] to-slate-100/80 p-4 md:p-8 font-sans antialiased text-slate-900">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {}
        <header className="flex justify-between items-center p-6 rounded-[2rem] border border-white/50 backdrop-blur-md bg-white/70 sticky top-4 z-50 shadow-lg shadow-slate-100/40 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 hover:scale-105 transition-transform duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight uppercase text-slate-800">Designet<span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">ERP</span></h1>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.25em]">{t('dashboard.managementSuite')}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-black text-slate-800">{user?.firstName} {user?.lastName}</span>
              <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md uppercase tracking-wider">
                {user?.role === 'Admin' ? t('roles.administrator') : user?.role === 'Employee_Commercial' ? t('roles.commercialOfficer') : user?.role === 'Employee_Stocks' ? t('roles.inventoryManager') : user?.role === 'Employee_Achats' ? t('roles.purchasingManager') : user?.role === 'Employee_RH' ? 'HR Manager' : user?.role}
              </span>
            </div>
            <button onClick={handleLogout} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 hover:-translate-y-0.5 transition-all duration-200 active:scale-95">
              {t('dashboard.logout')}
            </button>
          </div>
        </header>

        {}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100/80 shadow-md shadow-slate-100/40 relative overflow-hidden group hover:shadow-xl hover:shadow-amber-500/5 hover:-translate-y-1 transition-all duration-300">
            {}
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all duration-300"></div>
            
            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 text-amber-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('dashboard.pendingOrders')}</p>
            <p className="text-2xl font-black bg-gradient-to-r from-slate-950 to-slate-800 bg-clip-text text-transparent mt-2">€{pendingOrdersRevenue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}</p>
            <div className="mt-4 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span className="text-[10px] font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase tracking-wider">{t('dashboard.pendingOrdersCount', {
                count: pendingOrdersCount
              })}</span>
            </div>
          </div>

          {}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100/80 shadow-md shadow-slate-100/40 relative overflow-hidden group hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300">
            {}
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all duration-300"></div>

            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 group-hover:translate-x-1 transition-all duration-300 text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('dashboard.deliveriesInTransit')}</p>
            <p className="text-2xl font-black bg-gradient-to-r from-slate-950 to-slate-800 bg-clip-text text-transparent mt-2">€{transitRevenue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}</p>
            <div className="mt-4 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">{t('dashboard.activeShipments', {
                count: deliveriesInTransitCount
              })}</span>
            </div>
          </div>

          {}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100/80 shadow-md shadow-slate-100/40 relative overflow-hidden group hover:shadow-xl hover:shadow-rose-500/5 hover:-translate-y-1 transition-all duration-300">
            {}
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-all duration-300"></div>

            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 text-rose-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path></svg>
            </div>
            <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">{t('dashboard.overdueReceivables')}</p>
            <p className="text-2xl font-black text-rose-600 mt-2">€{overdueRevenue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}</p>
            <div className="mt-4 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <span className="text-[10px] font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded uppercase tracking-wider">{t('dashboard.overdueInvoices', {
                count: overdueInvoicesCount
              })}</span>
            </div>
          </div>

          {}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 rounded-[2rem] shadow-xl shadow-indigo-950/20 relative overflow-hidden group flex flex-col justify-between border border-slate-800 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-950/30 transition-all duration-300">
            {}
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-300"></div>

            <div className="absolute top-0 right-0 p-4 group-hover:scale-115 group-hover:rotate-6 transition-all duration-300 text-emerald-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
            <div>
              <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">{t('dashboard.totalRevenueMonth')}</p>
              <p className="text-2xl font-black text-white mt-2">€{totalRevenue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}</p>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded uppercase tracking-wider">{t('dashboard.finalizedInvoices', {
                count: currentMonthPaidInvoicesCount
              })}</span>
            </div>
          </div>
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100/80 shadow-md shadow-slate-100/40 relative overflow-hidden group hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all duration-300"></div>
            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 text-indigo-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('dashboard.purchases30D')}</p>
            <p className="text-2xl font-black bg-gradient-to-r from-slate-950 to-slate-800 bg-clip-text text-transparent mt-2">€{metrics?.purchasesThisMonth?.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            }) || '0.00'}</p>
            <div className="mt-4 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-wider">{t('dashboard.ordersThisMonth', {
                count: metrics?.purchasesCount || 0
              })}</span>
            </div>
          </div>

          {}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100/80 shadow-md shadow-slate-100/40 relative overflow-hidden group hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1 transition-all duration-300">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all duration-300"></div>
            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 text-emerald-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('dashboard.totalStockValue')}</p>
            <p className="text-2xl font-black bg-gradient-to-r from-slate-950 to-slate-800 bg-clip-text text-transparent mt-2">€{metrics?.totalStockValue?.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            }) || '0.00'}</p>
            <div className="mt-4 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider">{t('dashboard.totalInventoryCost')}</span>
            </div>
          </div>

          {}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100/80 shadow-md shadow-slate-100/40 relative overflow-hidden group hover:shadow-xl hover:shadow-sky-500/5 hover:-translate-y-1 transition-all duration-300">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl group-hover:bg-sky-500/10 transition-all duration-300"></div>
            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 text-sky-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('dashboard.totalClients')}</p>
            <p className="text-2xl font-black bg-gradient-to-r from-slate-950 to-slate-800 bg-clip-text text-transparent mt-2">{metrics?.totalCustomers || 0}</p>
            <div className="mt-4 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
              </span>
              <span className="text-[10px] font-extrabold text-sky-600 bg-sky-50 px-2 py-0.5 rounded uppercase tracking-wider">{t('dashboard.registeredAccounts')}</span>
            </div>
          </div>

          {}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100/80 shadow-md shadow-slate-100/40 relative overflow-hidden group hover:shadow-xl hover:shadow-orange-500/5 hover:-translate-y-1 transition-all duration-300">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition-all duration-300"></div>
            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 text-orange-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('dashboard.activeProducts')}</p>
            <p className="text-2xl font-black bg-gradient-to-r from-slate-950 to-slate-800 bg-clip-text text-transparent mt-2">{metrics?.activeProducts || 0}</p>
            <div className="mt-4 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              <span className="text-[10px] font-extrabold text-orange-600 bg-orange-50 px-2 py-0.5 rounded uppercase tracking-wider">{t('dashboard.inCatalog')}</span>
            </div>
          </div>
        </div>

        {}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100/80 shadow-md shadow-slate-100/30 h-auto w-full">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-8">{t('dashboard.managementModules')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            
            {['Admin', 'Employee_Commercial', 'Employee_Achats'].includes(user?.role) && <div onClick={() => navigate('/reports')} className="p-6 bg-white border border-slate-100/80 rounded-2xl hover:bg-rose-50/20 hover:border-rose-100 hover:shadow-md hover:shadow-rose-500/5 transition-all duration-300 cursor-pointer group">
                <div className="w-11 h-11 bg-gradient-to-tr from-rose-50 to-rose-100/80 text-rose-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:from-rose-600 group-hover:to-rose-500 group-hover:text-white transition-all duration-300 shadow-sm shadow-rose-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                </div>
                <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest group-hover:text-rose-600 transition-colors">{t('dashboard.reports')}</h3>
                <p className="text-[10px] text-slate-400 mt-1 uppercase font-black tracking-wider group-hover:text-slate-500 transition-colors">{t('dashboard.exportsSummaries')}</p>
              </div>}
            
            {['Admin', 'Employee_Commercial'].includes(user?.role) && <>
                <div onClick={() => navigate('/customers')} className="p-6 bg-white border border-slate-100/80 rounded-2xl hover:bg-indigo-50/20 hover:border-indigo-100 hover:shadow-md hover:shadow-indigo-500/5 transition-all duration-300 cursor-pointer group">
                  <div className="w-11 h-11 bg-gradient-to-tr from-indigo-50 to-indigo-100/80 text-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:from-indigo-600 group-hover:to-indigo-500 group-hover:text-white transition-all duration-300 shadow-sm shadow-indigo-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  </div>
                  <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest group-hover:text-indigo-600 transition-colors">{t('dashboard.customers')}</h3>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase font-black tracking-wider group-hover:text-slate-500 transition-colors">{t('dashboard.crmHistory')}</p>
                </div>
                <div onClick={() => navigate('/sales/pipeline')} className="p-6 bg-white border border-slate-100/80 rounded-2xl hover:bg-violet-50/20 hover:border-violet-100 hover:shadow-md hover:shadow-violet-500/5 transition-all duration-300 cursor-pointer group">
                  <div className="w-11 h-11 bg-gradient-to-tr from-violet-50 to-violet-100/80 text-violet-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:from-violet-600 group-hover:to-violet-500 group-hover:text-white transition-all duration-300 shadow-sm shadow-violet-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"></path><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"></path><path d="M2 7h20"></path><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"></path></svg>
                  </div>
                  <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest group-hover:text-violet-600 transition-colors">{t('dashboard.salesPipeline')}</h3>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase font-black tracking-wider group-hover:text-slate-500 transition-colors">{t('dashboard.quotesLogistics')}</p>
                </div>
                <div onClick={() => navigate('/sales')} className="p-6 bg-white border border-slate-100/80 rounded-2xl hover:bg-emerald-50/20 hover:border-emerald-100 hover:shadow-md hover:shadow-emerald-500/5 transition-all duration-300 cursor-pointer group">
                  <div className="w-11 h-11 bg-gradient-to-tr from-emerald-50 to-emerald-100/80 text-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:from-emerald-600 group-hover:to-emerald-500 group-hover:text-white transition-all duration-300 shadow-sm shadow-emerald-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"></path><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"></path><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"></path></svg>
                  </div>
                  <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest group-hover:text-emerald-600 transition-colors">{t('dashboard.invoicesBilling')}</h3>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase font-black tracking-wider group-hover:text-slate-500 transition-colors">{t('dashboard.financeRevenue')}</p>
                </div>
              </>}

            {['Admin', 'Employee_Stocks'].includes(user?.role) && <div onClick={() => navigate('/inventory')} className="p-6 bg-white border border-slate-100/80 rounded-2xl hover:bg-amber-50/20 hover:border-amber-100 hover:shadow-md hover:shadow-amber-500/5 transition-all duration-300 cursor-pointer group">
                <div className="w-11 h-11 bg-gradient-to-tr from-amber-50 to-amber-100/80 text-amber-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:from-amber-600 group-hover:to-amber-500 group-hover:text-white transition-all duration-300 shadow-sm shadow-amber-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                </div>
                <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest group-hover:text-amber-600 transition-colors">{t('dashboard.stocks')}</h3>
                <p className="text-[10px] text-slate-400 mt-1 uppercase font-black tracking-wider group-hover:text-slate-500 transition-colors">{t('dashboard.physicalInventoryMoves')}</p>
              </div>}

            {['Admin', 'Employee_Achats'].includes(user?.role) && <>
                <div onClick={() => navigate('/purchases/orders')} className="p-6 bg-white border border-slate-100/80 rounded-2xl hover:bg-teal-50/20 hover:border-teal-100 hover:shadow-md hover:shadow-teal-500/5 transition-all duration-300 cursor-pointer group">
                  <div className="w-11 h-11 bg-gradient-to-tr from-teal-50 to-teal-100/80 text-teal-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:from-teal-600 group-hover:to-teal-500 group-hover:text-white transition-all duration-300 shadow-sm shadow-teal-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                  </div>
                  <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest group-hover:text-teal-600 transition-colors">{t('dashboard.purchaseOrders')}</h3>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase font-black tracking-wider group-hover:text-slate-500 transition-colors">{t('dashboard.manageCreateOrders')}</p>
                </div>
                <div onClick={() => navigate('/purchases/suppliers')} className="p-6 bg-white border border-slate-100/80 rounded-2xl hover:bg-cyan-50/20 hover:border-cyan-100 hover:shadow-md hover:shadow-cyan-500/5 transition-all duration-300 cursor-pointer group">
                  <div className="w-11 h-11 bg-gradient-to-tr from-cyan-50 to-cyan-100/80 text-cyan-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:from-cyan-600 group-hover:to-cyan-500 group-hover:text-white transition-all duration-300 shadow-sm shadow-cyan-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="16"></line><line x1="15" y1="22" x2="15" y2="16"></line><line x1="9" y1="16" x2="15" y2="16"></line><path d="M9 6h6"></path><path d="M9 10h6"></path></svg>
                  </div>
                  <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest group-hover:text-cyan-600 transition-colors">{t('dashboard.suppliers')}</h3>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase font-black tracking-wider group-hover:text-slate-500 transition-colors">{t('dashboard.vendorsProfiles')}</p>
                </div>
              </>}

            {user?.role === 'Admin' && <>
                <div onClick={() => navigate('/users')} className="p-6 bg-white border border-slate-100/80 rounded-2xl hover:bg-fuchsia-50/20 hover:border-fuchsia-100 hover:shadow-md hover:shadow-fuchsia-500/5 transition-all duration-300 cursor-pointer group">
                  <div className="w-11 h-11 bg-gradient-to-tr from-fuchsia-50 to-fuchsia-100/80 text-fuchsia-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:from-fuchsia-600 group-hover:to-fuchsia-500 group-hover:text-white transition-all duration-300 shadow-sm shadow-fuchsia-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="22" y1="11" x2="16" y2="11"></line></svg>
                  </div>
                  <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest group-hover:text-fuchsia-600 transition-colors">{t('dashboard.usersRoles')}</h3>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase font-black tracking-wider group-hover:text-slate-500 transition-colors">{t('dashboard.hrPersonnel')}</p>
                </div>



                <div onClick={() => navigate('/categories')} className="p-6 bg-white border border-slate-100/80 rounded-2xl hover:bg-pink-50/20 hover:border-pink-100 hover:shadow-md hover:shadow-pink-500/5 transition-all duration-300 cursor-pointer group">
                  <div className="w-11 h-11 bg-gradient-to-tr from-pink-50 to-pink-100/80 text-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:from-pink-600 group-hover:to-pink-500 group-hover:text-white transition-all duration-300 shadow-sm shadow-pink-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>
                  </div>
                  <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest group-hover:text-pink-600 transition-colors">{t('dashboard.productCategories')}</h3>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase font-black tracking-wider group-hover:text-slate-500 transition-colors">{t('dashboard.taxTaxonomy')}</p>
                </div>

                <div onClick={() => navigate('/delivery-companies')} className="p-6 bg-white border border-slate-100/80 rounded-2xl hover:bg-orange-50/20 hover:border-orange-100 hover:shadow-md hover:shadow-orange-500/5 transition-all duration-300 cursor-pointer group">
                  <div className="w-11 h-11 bg-gradient-to-tr from-orange-50 to-orange-100/80 text-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:from-orange-600 group-hover:to-orange-500 group-hover:text-white transition-all duration-300 shadow-sm shadow-orange-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                  </div>
                  <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest group-hover:text-orange-600 transition-colors">{t('dashboard.deliveryCompanies')}</h3>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase font-black tracking-wider group-hover:text-slate-500 transition-colors">{t('dashboard.couriersLogistics')}</p>
                </div>
              </>}

            {}
            <div onClick={() => navigate('/logs')} className="p-6 bg-white border border-slate-100/80 rounded-2xl hover:bg-slate-50/20 hover:border-slate-200 hover:shadow-md hover:shadow-slate-500/5 transition-all duration-300 cursor-pointer group">
              <div className="w-11 h-11 bg-gradient-to-tr from-slate-50 to-slate-100/80 text-slate-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:from-slate-700 group-hover:to-slate-600 group-hover:text-white transition-all duration-300 shadow-sm shadow-slate-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              </div>
              <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest group-hover:text-slate-700 transition-colors">{t('dashboard.systemLogs')}</h3>
              <p className="text-[10px] text-slate-400 mt-1 uppercase font-black tracking-wider group-hover:text-slate-500 transition-colors">{t('dashboard.securityAudit')}</p>
            </div>
            
          </div>
        </div>

        {}
        <div className="flex flex-col lg:flex-row gap-6 items-stretch w-full">
          
          {}
          <div className="flex-1 bg-white p-8 rounded-[2rem] border border-slate-100/80 shadow-md shadow-slate-100/30 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">{t('dashboard.revenueAnalytics')}</h2>
                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3.5 py-1 rounded-full uppercase tracking-widest italic">{t('dashboard.last6Months')}</span>
              </div>
              <div className="flex items-end justify-between h-48 gap-4 px-2">
                {Object.entries(monthlyData).map(([month, val]) => {
                const heightPercent = Math.max(val / maxMonthValue * 100, 4);
                return <div key={month} className="w-full h-full flex flex-col items-center group relative justify-end">
                      <div className="w-full bg-slate-50/50 rounded-2xl h-40 flex items-end overflow-hidden border border-slate-100 group-hover:bg-slate-50 transition-colors duration-300">
                        <div className="w-full bg-gradient-to-t from-indigo-600 via-indigo-500 to-violet-500 rounded-t-xl transition-all duration-500 group-hover:from-indigo-500 group-hover:via-violet-400 group-hover:to-fuchsia-400 shadow-lg shadow-indigo-500/10" style={{
                      height: `${heightPercent}%`
                    }}></div>
                      </div>
                      <p className="text-[9px] font-black text-slate-400 uppercase mt-3 group-hover:text-slate-600 transition-colors">{month}</p>
                      
                      {}
                      <div className="absolute -top-6 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 bg-slate-900/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-slate-700/50 shadow-xl pointer-events-none z-10 font-mono">
                        €{val.toLocaleString(undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    })}
                      </div>
                    </div>;
              })}
              </div>
            </div>
          </div>

          {}
          <div className="flex-1 bg-white p-8 rounded-[2rem] border border-slate-100/80 shadow-md shadow-slate-100/30 flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-black text-rose-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
                {t('dashboard.alerts')}
              </h2>
              
              <div className="space-y-4 overflow-y-auto max-h-[250px] pr-1 custom-scrollbar">
                {alerts.length > 0 ? alerts.map(alert => {
                let alertColor = alert.type === 'LOW_STOCK' ? 'amber' : alert.type === 'OVERDUE_PAYMENT' ? 'rose' : alert.type === 'DELAYED_SUPPLIER_ORDER' ? 'teal' : 'slate';
                let targetRoute = alert.type === 'LOW_STOCK' ? '/inventory' : alert.type === 'OVERDUE_PAYMENT' ? '/sales' : alert.type === 'DELAYED_SUPPLIER_ORDER' ? '/purchases/orders' : '/users';
                return <div key={alert.id} onClick={() => navigate(targetRoute)} className={`p-4 bg-${alertColor}-50/30 border border-${alertColor}-100/50 rounded-2xl group hover:bg-${alertColor}-50/70 hover:border-${alertColor}-200 transition-all duration-300 cursor-pointer`}>
                      <div className="mb-2">
                        <span className={`text-[10px] font-black text-${alertColor}-600 font-mono tracking-tighter bg-${alertColor}-50 px-2 py-0.5 rounded`}>{t(`alerts.title.${alert.type}`, {
                        defaultValue: alert.title
                      })}</span>
                      </div>
                      <p className="text-xs font-black text-slate-800 leading-relaxed">{t(`alerts.message.${alert.type}`, {
                      ...alert.data,
                      defaultValue: alert.message
                    })}</p>
                    </div>;
              }) : <div className="flex flex-col items-center justify-center py-10 text-center h-full">
                    <div className="relative w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                      <span className="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-emerald-400 opacity-20"></span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    </div>
                    <p className="text-xs font-black text-emerald-600 bg-emerald-50/50 px-2.5 py-0.5 rounded uppercase tracking-wider">{t('dashboard.noRisks')}</p>
                    <p className="text-[10px] text-slate-400 mt-2 px-4 italic leading-relaxed">{t('dashboard.noRisksMessage')}</p>
                  </div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default Dashboard;