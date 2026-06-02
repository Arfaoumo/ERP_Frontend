import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

const SaleInvoice = () => {
  const { id } = useParams();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchSale = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get('http://localhost:5000/api/sales', config);
        const found = data.find(s => s._id === id);

        if (found) {
          setSale(found);
        }
      } catch (err) {
        console.error('Error fetching invoice', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchSale();
  }, [id, user]);



  const translateDocType = (type) => {
    switch (type) {
      case 'Invoice': return t('invoice.facture');
      case 'Quote': return t('invoice.devis');
      case 'Order': return t('invoice.commande');
      case 'DeliveryNote': return t('invoice.bonDeLivraison');
      default: return t('invoice.document');
    }
  };

  if (loading) return <div className="p-10 text-center">{t('invoice.generating')}</div>;
  if (!sale) return <div className="p-10 text-center">{t('invoice.notFound')}</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8 flex justify-center items-start print:p-0 print:bg-white font-sans">
      {/* Invoice Page */}
      <div className="w-full max-w-[850px] bg-white shadow-xl p-16 print:shadow-none print:border-none print:max-w-none print:p-0">

        {/* Header */}
        <div className="flex justify-between items-start mb-16">
          <div>
            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-1">
              {translateDocType(sale.documentType)}
            </h1>
            <p className="text-slate-400 font-mono text-sm tracking-widest uppercase">#{sale.documentNumber}</p>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider">Antigravity ERP</h2>
            <p className="text-sm text-slate-500 mt-1">Technopole City, Suite 404</p>
            <p className="text-sm text-slate-500">contact@antigravity-erp.com</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-12 mb-16">
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">{t('invoice.billTo')}</p>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{sale.customer?.name}</h3>
            <div className="text-sm text-slate-600 space-y-1">
              <p className="whitespace-nowrap"><span className="font-bold uppercase">{t('invoice.address')}</span> {sale.customer?.address || sale.customer?.shippingAddress || 'N/A'}</p>
              <p><span className="font-bold uppercase">{t('invoice.tel')}</span> {sale.customer?.phone || 'N/A'}</p>
              <p><span className="font-bold uppercase">{t('common.email')}:</span> {sale.customer?.email || 'N/A'}</p>
              <p><span className="font-bold uppercase">{t('invoice.cin')}</span> {sale.customer?.cin || 'N/A'}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">
              {sale.documentType === 'Invoice' ? t('invoice.invoiceDetails') : t('invoice.documentDetails')}
            </p>
            <div className="text-sm text-slate-600 space-y-1">
              <p><span className="font-bold uppercase">{t('invoice.date')}</span> {new Date(sale.createdAt).toLocaleDateString()}</p>
              {['Invoice', 'DeliveryNote', 'Order', 'Quote'].includes(sale.documentType) && sale.courier && sale.courier.toUpperCase() !== 'NONE' && (
                <p><span className="font-bold uppercase">{t('invoice.deliveryBy')}</span> {sale.courier.toUpperCase()}</p>
              )}
              {sale.customer?.email && (
                <p><span className="font-bold uppercase">{t('common.email')}:</span> {sale.customer.email}</p>
              )}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-12">
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr className="border-b border-slate-900">
                <th className="w-[30%] py-4 text-[10px] font-black uppercase text-slate-900 tracking-widest text-left">{t('invoice.designation')}</th>
                <th className="w-[14%] py-4 text-[10px] font-black uppercase text-slate-900 tracking-widest text-right">{t('invoice.quantity')}</th>
                <th className="w-[14%] py-4 text-[10px] font-black uppercase text-slate-900 tracking-widest text-right">{t('invoice.vat')}</th>
                <th className="w-[14%] py-4 text-[10px] font-black uppercase text-slate-900 tracking-widest text-right">{t('invoice.priceExclTax')}</th>
                <th className="w-[14%] py-4 text-[10px] font-black uppercase text-slate-900 tracking-widest text-right">{t('invoice.priceInclTax')}</th>
                <th className="w-[14%] py-4 text-[10px] font-black uppercase text-slate-900 tracking-widest text-right">{t('invoice.totalInclTax')}</th>
              </tr>
            </thead>
            <tbody>
              {sale.items.map((item, idx) => {
                const p = item.product || {};
                const taxRate = p.category?.taxRate ?? 0.19;
                const priceTTC = item.sellingPrice * (1 + taxRate);
                const totalTTC = item.quantity * priceTTC;

                return (
                  <tr key={idx} className="border-b border-gray-100">
                    <td className="py-6 text-left">
                      <p className="text-sm font-bold text-slate-900">{p.name || t('invoice.productDefault')}</p>
                      <p className="text-[10px] text-slate-400 font-mono uppercase mt-1">{p.sku || t('invoice.skuDefault')}</p>
                    </td>
                    <td className="py-6 text-right text-sm text-slate-700">{item.quantity}</td>
                    <td className="py-6 text-right text-sm text-slate-700">{(taxRate * 100).toFixed(0)}%</td>
                    <td className="py-6 text-right text-sm text-slate-700">€{item.sellingPrice?.toFixed(2)}</td>
                    <td className="py-6 text-right text-sm text-slate-700">€{priceTTC.toFixed(2)}</td>
                    <td className="py-6 text-right text-sm font-bold text-slate-900">€{totalTTC.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer / Totals */}
        <div className="flex justify-end pt-4">
          <div className="w-72 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">{t('invoice.subtotalExclTax')}</span>
              <span className="font-medium text-slate-900">€{(sale.totalAmount || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">{t('invoice.vatAmount')}</span>
              <span className="font-medium text-slate-900">€{(sale.taxAmount || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t-2 border-slate-900">
              <span className="text-sm font-black uppercase tracking-widest text-slate-900">{t('invoice.totalTTC')}</span>
              <span className="text-2xl font-black text-primary tracking-tighter">€{(sale.totalWithTax || sale.totalAmount).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Bottom Note */}
        <div className="mt-24 border-t border-slate-100 pt-8 text-center">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">{t('invoice.thanks')}</p>
          <button
            onClick={() => window.print()}
            className="mt-6 px-8 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-slate-800 transition-colors print:hidden"
          >
            {t('invoice.print')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaleInvoice;
