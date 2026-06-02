import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '../../components/ConfirmationModal';
import { useTranslation } from 'react-i18next';

const PurchaseOrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({ id: null, status: null, title: '', message: '', type: 'primary' });
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const fetchOrders = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('http://localhost:5000/api/purchases/orders', config);
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

  const confirmStatusUpdate = async () => {
    const { id, status } = modalConfig;
    if (!id || !status) return;

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`http://localhost:5000/api/purchases/orders/${id}/status`, { status }, config);
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
      case 'Pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Received': return 'bg-green-50 text-green-700 border-green-200';
      case 'Cancelled': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto bg-card rounded-xl shadow-sm border overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="text-gray-500 hover:text-primary mr-2">{t('common.back')}</button>
            <h1 className="text-2xl font-bold text-foreground">{t('purchases.purchaseOrders')}</h1>
          </div>
          <button
            onClick={() => navigate('/purchases/orders/new')}
            className="bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {t('purchases.newOrder')}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('purchases.documentNumber')}</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('purchases.supplier')}</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('common.total')}</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('common.date')}</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">{t('common.status')}</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('purchases.orderedBy')}</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-gray-400 italic">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <p className="mt-2">{t('purchases.loadingOrders')}</p>
                    </div>
                  </td>
                </tr>
              ) : orders.map(order => (
                <tr key={order._id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-gray-900">{order.documentNumber}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{order.supplier?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">€{order.totalAmount?.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.orderedBy?.firstName} {order.orderedBy?.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <button
                        onClick={() => openDetailsModal(order)}
                        className="text-primary font-bold hover:text-primary/80 text-xs tracking-wide"
                      >
                        {t('purchases.viewDetails')}
                      </button>
                      {order.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => openStatusModal(order._id, 'Received')}
                            className="text-green-600 font-bold hover:text-green-800 text-xs tracking-wide"
                          >
                            {t('purchases.receiveStock')}
                          </button>
                          <button
                            onClick={() => openStatusModal(order._id, 'Cancelled')}
                            className="text-red-400 font-bold hover:text-red-600 text-xs tracking-wide"
                          >
                            {t('purchases.cancel')}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && orders.length === 0 && (
                <tr><td colSpan="7" className="p-12 text-center text-gray-500">{t('purchases.noOrdersFound')}</td></tr>
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
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">{t('purchases.orderDetailsTitle')}</h2>
              <button 
                type="button" 
                onClick={() => setDetailsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-mono text-xl"
              >
                &times;
              </button>
            </div>
            <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">{t('purchases.documentNumber')}</p>
                  <p className="font-semibold">{selectedOrder.documentNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">{t('purchases.supplier')}</p>
                  <p className="font-semibold">{selectedOrder.supplier?.name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">{t('common.status')}</p>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border inline-block mt-1 ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">{t('common.date')}</p>
                  <p className="font-semibold">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold border-b pb-2 mb-3">{t('common.products')}</h3>
                <div className="bg-gray-50 rounded-lg border overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-100 border-b">
                      <tr>
                        <th className="px-4 py-2 font-semibold">{t('common.product')}</th>
                        <th className="px-4 py-2 font-semibold">{t('common.qty')}</th>
                        <th className="px-4 py-2 font-semibold">{t('purchases.unitPrice')}</th>
                        <th className="px-4 py-2 font-semibold text-right">{t('common.subtotal')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.products?.map((item, index) => (
                        <tr key={index} className="border-b last:border-0">
                          <td className="px-4 py-2">{item.product?.name || item.product || 'Unknown Product'}</td>
                          <td className="px-4 py-2">{item.quantity}</td>
                          <td className="px-4 py-2">€{item.buyingPrice?.toFixed(2)}</td>
                          <td className="px-4 py-2 text-right">€{(item.quantity * item.buyingPrice).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-between items-center border-t pt-4">
                <span className="font-bold text-gray-600">{t('purchases.totalAmount')}</span>
                <span className="text-xl font-bold">€{selectedOrder.totalAmount?.toFixed(2)}</span>
              </div>
            </div>
            <div className="p-4 border-t bg-slate-50 flex justify-end">
              <button 
                onClick={() => setDetailsModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 font-medium"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrderList;
