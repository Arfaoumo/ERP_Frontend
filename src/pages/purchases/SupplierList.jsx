import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const SupplierList = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const fetchSuppliers = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('http://localhost:5000/api/suppliers', config);
      setSuppliers(data);
    } catch (error) {
      console.error('Error fetching suppliers', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchSuppliers();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto bg-card rounded-xl shadow-sm border overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
             <button onClick={() => navigate('/')} className="text-gray-500 hover:text-primary mr-2">{t('common.back')}</button>
             <h1 className="text-2xl font-bold text-foreground">{t('suppliers.directory')}</h1>
          </div>
          {['Admin', 'Employee_Achats'].includes(user?.role) && (
            <button 
              onClick={() => navigate('/purchases/suppliers/new')}
              className="bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-medium hover:opacity-90 transition-opacity"
            >
              {t('suppliers.addSupplier')}
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('suppliers.companyName')}</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('suppliers.contact')}</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('common.email')}</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">{t('common.status')}</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="relative w-10 h-10">
                        <div className="absolute top-0 left-0 w-full h-full border-4 border-primary/20 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-full h-full border-4 border-t-primary rounded-full animate-spin"></div>
                      </div>
                      <p className="mt-4 text-sm font-medium text-gray-500 animate-pulse">{t('suppliers.retrieving')}</p>
                    </div>
                  </td>
                </tr>
              ) : suppliers.map(s => (
                <tr key={s._id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{s.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{s.contactName || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{s.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    {s.isActive ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">{t('common.active')}</span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">{t('common.inactive')}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    {['Admin', 'Employee_Achats'].includes(user?.role) && (
                      <button onClick={() => navigate(`/purchases/suppliers/edit/${s._id}`)} className="text-blue-600 font-bold hover:text-blue-800 text-xs tracking-wide">{t('common.edit')}</button>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && suppliers.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-gray-400 italic">{t('suppliers.noSuppliers')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SupplierList;
