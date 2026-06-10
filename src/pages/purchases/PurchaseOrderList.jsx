import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '../../components/ConfirmationModal';
import { useTranslation } from 'react-i18next';

const PurchaseOrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({ id: null, status: null, title: '', message: '', type: 'primary' });
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const fetchOrders = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/purchases/orders`, config);
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  const filteredOrders = orders.filter(o => 
    o.documentNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const confirmStatusUpdate = async () => {
    const { id, status } = modalConfig;
    if (!id || !status) return;

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/purchases/orders/${id}/status`, { status }, config);
      fetchOrders();
    } catch (error) {
      console.error('Error updating status', error);
      alert(t('purchases.errorUpdatingStatus'));
    }
  };

  const openDetailsModal = (order) => {
    setSelectedOrder(order);
    setDetailsModalOpen(true);
  };

  const openStatusModal = (id, status) => {
    const isReceive = status === 'Received';
    setModalConfig({
      id,
      status,
      title: isReceive ? t('purchases.receiveStockModalTitle') : t('purchases.cancelOrderModalTitle'),
      message: isReceive
        ? t('purchases.receiveStockModalMsg')
        : t('purchases.cancelOrderModalMsg'),
      type: isReceive ? 'primary' : 'danger'
    });
    setModalOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-800';
      case 'Received': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
              <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{t('purchases.purchaseOrders')}</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t('purchases.manageOrders')}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <input 
                type="text" 
                placeholder={t('common.search', 'Rechercher...')}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-slate-700 bg-slate-50"
              />
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
            <button 
              onClick={() => navigate('/purchases/orders/new')}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95 whitespace-nowrap"
            >
              {t('purchases.newOrder')}
            </button>
          </div>
        </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('purchases.documentNumber')}</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('purchases.supplier')}</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('common.total')}</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('common.date')}</th>
                  <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('common.status')}</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('purchases.orderedBy')}</th>
                  <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="p-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="relative w-10 h-10">
                          <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600/20 rounded-full"></div>
                          <div className="absolute top-0 left-0 w-full h-full border-4 border-t-blue-600 rounded-full animate-spin"></div>
                        </div>
                        <p className="mt-4 text-sm font-medium text-slate-500 animate-pulse">{t('purchases.loadingOrders')}</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredOrders.map(order => (
                  <tr key={order._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{order.documentNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{order.supplier?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">€{order.totalAmount?.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.orderedBy?.firstName} {order.orderedBy?.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => openDetailsModal(order)}
                          className="text-[10px] font-black text-slate-500 hover:text-slate-700 uppercase tracking-widest transition-all"
                        >
                          {t('purchases.viewDetails')}
                        </button>
                        {order.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => openStatusModal(order._id, 'Received')}
                              className="text-[10px] font-black text-emerald-600 hover:text-emerald-800 uppercase tracking-widest transition-all"
                            >
                              {t('purchases.receiveStock')}
                            </button>
                            <button
                              onClick={() => openStatusModal(order._id, 'Cancelled')}
                              className="text-[10px] font-black text-red-500 hover:text-red-700 uppercase tracking-widest transition-all"
                            >
                              {t('purchases.cancel')}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan="7" className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                      {searchTerm ? t('common.noResults') : t('purchases.noOrdersFound')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <ConfirmationModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onConfirm={confirmStatusUpdate}
          title={modalConfig.title}
          message={modalConfig.message}
          confirmText={modalConfig.status === 'Received' ? t('purchases.receiveGoodsBtn') : t('purchases.yesCancelBtn')}
          type={modalConfig.type}
        />

        {detailsModalOpen && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">{t('purchases.orderDetails')} - {selectedOrder.documentNumber}</h2>
                <button 
                  onClick={() => setDetailsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 font-mono text-xl"
                >
                  &times;
                </button>
              </div>
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('purchases.supplier')}</p>
                    <p className="font-bold text-slate-800">{selectedOrder.supplier?.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('common.date')}</p>
                    <p className="font-bold text-slate-800">{new Date(selectedOrder.createdAt).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US')}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('common.status')}</p>
                    <p className="font-bold text-slate-800">{t(`status.${selectedOrder.status}`, selectedOrder.status)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('common.total')}</p>
                    <p className="font-bold text-slate-800">€{selectedOrder.totalAmount?.toFixed(2)}</p>
                  </div>
                </div>

                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2 mb-4">{t('purchases.orderedItems')}</h3>
                <div className="space-y-3">
                  {(selectedOrder.products || []).map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div>
                        <p className="font-bold text-slate-800">{item.product?.name || t('purchases.unknownProduct')}</p>
                        <p className="text-xs font-semibold text-slate-500">{item.quantity} x €{item.buyingPrice?.toFixed(2)}</p>
                      </div>
                      <p className="font-black text-slate-900">€{(item.quantity * (item.buyingPrice || 0)).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
                <button 
                  onClick={() => setDetailsModalOpen(false)}
                  className="px-6 py-2.5 border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-white transition-colors shadow-sm"
                >
                  {t('common.close')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseOrderList;
