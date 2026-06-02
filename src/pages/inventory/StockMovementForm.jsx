import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const StockMovementForm = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({ type: 'IN', quantity: 1, reason: '' });
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(`http://localhost:5000/api/products/${id}/stock`, formData, config);
      navigate('/inventory');
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || t('inventory.errorMovingStock'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex justify-center items-start pt-20">
      <div className="w-full max-w-md bg-card p-8 rounded-xl shadow-sm border">
        <h1 className="text-2xl font-bold mb-6 text-foreground">{t('inventory.logMovement')}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('inventory.movementType')}</label>
            <select className="w-full p-2.5 border rounded bg-white focus:ring-2 focus:ring-primary focus:outline-none" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
              <option value="IN">{t('inventory.movementIn')}</option>
              <option value="OUT">{t('inventory.movementOut')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('inventory.quantity')}</label>
            <input type="number" min="1" className="w-full p-2.5 border rounded bg-white focus:ring-2 focus:ring-primary focus:outline-none" required value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('inventory.reasonRef')}</label>
            <input type="text" placeholder={t('inventory.reasonPlaceholder')} className="w-full p-2.5 border rounded bg-white focus:ring-2 focus:ring-primary focus:outline-none" required value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} />
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
            <button type="button" onClick={() => navigate('/inventory')} className="px-4 py-2 border rounded text-sm font-medium hover:bg-gray-50 transition-colors">{t('common.cancel')}</button>
            <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:opacity-90 transition-opacity">{t('inventory.confirmMovement')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockMovementForm;
