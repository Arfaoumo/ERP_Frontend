import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Download, RefreshCw, TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';

function Reports() {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReports();
  }, [user]);

  const fetchReports = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reports`, config);
      setReports(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to fetch reports.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type) => {
    try {
      const config = { 
        headers: { Authorization: `Bearer ${user.token}` },
        responseType: 'blob'
      };
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reports/export/${type}`, config);
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(`Error exporting ${type}:`, err);
      alert(`Failed to export ${type} data.`);
    }
  };

  const handleGenerateManual = async () => {
    try {
      setGenerating(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reports/generate`, {}, config);
      await fetchReports();
    } catch (err) {
      console.error('Error generating report:', err);
      alert('Failed to generate report.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-screen bg-[#f8fafc]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200/60 overflow-hidden">
          
          {/* 1. HEADER & CONTROLS */}
          <div className="p-8 border-b flex flex-col md:flex-row justify-between items-center bg-white gap-4">
            
            {/* Title Section */}
            <div className="flex items-center gap-4">
               <button onClick={() => navigate('/')} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
               </button>
               <div>
                 <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{t('reports.title')}</h1>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t('reports.subtitle')}</p>
               </div>
            </div>
            
            {/* Export Actions */}
            <div className="flex flex-wrap items-center gap-4">
              <button 
                onClick={() => handleExport('sales')}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95"
              >
                <Download size={14} />
                {t('reports.exportSales')}
              </button>
              <button 
                onClick={() => handleExport('purchases')}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95"
              >
                <Download size={14} />
                {t('reports.exportPurchases')}
              </button>
            </div>
          </div>
          
          {/* 2. BODY CONTENT */}
          <div className="p-8">
            <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">{t('reports.automatedSummaries')}</h2>
              <button 
                onClick={handleGenerateManual}
                disabled={generating}
                className={`flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${generating ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 hover:bg-slate-800 text-white shadow-md shadow-slate-900/20 active:scale-95'}`}
              >
                <RefreshCw size={12} className={generating ? 'animate-spin' : ''} />
                {generating ? t('reports.generating') : t('reports.syncCurrentMonth')}
              </button>
            </div>

            {error && <p className="text-rose-500 text-xs font-bold mb-4">{t('reports.failedFetch')}</p>}

            {reports.length === 0 ? (
              <div className="text-center py-20 bg-slate-50/50 rounded-2xl border border-slate-100">
                <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-sm font-black text-slate-500 uppercase tracking-widest">{t('reports.noSummaries')}</p>
                <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-wider">{t('reports.syncFirstOne')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.map((report) => {
                  const isProfitable = report.profit >= 0;
                  return (
                    <div key={report._id} className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 relative group hover:bg-white hover:border-blue-100 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 hover:-translate-y-1">
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-sm font-black text-slate-800 uppercase tracking-widest">{report.month} {report.year}</span>
                        {isProfitable ? (
                          <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full"><TrendingUp size={12} /> {t('reports.profit')}</span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-rose-600 bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-full"><TrendingDown size={12} /> {t('reports.deficit')}</span>
                        )}
                      </div>
                      
                      <div className="space-y-5">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('reports.totalRevenue')}</p>
                          <p className="text-xl font-black text-slate-900 flex items-center gap-1">
                            €{report.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-1 font-bold uppercase tracking-wider">{report.salesCount} {t('reports.sales')}</p>
                        </div>
                        
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('reports.totalPurchases')}</p>
                          <p className="text-xl font-black text-slate-900 flex items-center gap-1">
                            €{report.totalPurchases.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-1 font-bold uppercase tracking-wider">{report.purchasesCount} {t('reports.orders')}</p>
                        </div>

                        <div className="pt-5 border-t border-slate-200">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('reports.netProfit')}</p>
                          <p className={`text-2xl font-black tracking-tighter ${isProfitable ? 'text-blue-600' : 'text-rose-500'}`}>
                            {report.profit >= 0 ? '+' : ''}€{report.profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;
