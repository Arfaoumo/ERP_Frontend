import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import SystemLogs from './pages/SystemLogs';
import Reports from './pages/Reports';
import ProductList from './pages/inventory/ProductList';
import ProductForm from './pages/inventory/ProductForm';
import ProductEditForm from './pages/inventory/ProductEditForm';
import StockMovementForm from './pages/inventory/StockMovementForm';
import StockMovementList from './pages/inventory/StockMovementList';
import CategoryList from './pages/inventory/CategoryList';
import CategoryForm from './pages/inventory/CategoryForm';
import DeliveryCompanyList from './pages/inventory/DeliveryCompanyList';
import DeliveryCompanyForm from './pages/inventory/DeliveryCompanyForm';
import UserList from './pages/users/UserList';
import UserForm from './pages/users/UserForm';
import UserEditForm from './pages/users/UserEditForm';
import SupplierList from './pages/purchases/SupplierList';
import SupplierForm from './pages/purchases/SupplierForm';
import PurchaseOrderList from './pages/purchases/PurchaseOrderList';
import PurchaseOrderForm from './pages/purchases/PurchaseOrderForm';
import CustomerList from './pages/customers/CustomerList';
import CustomerForm from './pages/customers/CustomerForm';
import CustomerDetails from './pages/customers/CustomerDetails';
import SaleList from './pages/sales/SaleList';
import SaleForm from './pages/sales/SaleForm';
import SaleInvoice from './pages/sales/SaleInvoice';
import PipelineList from './pages/sales/PipelineList';
import PaymentHistory from './pages/sales/PaymentHistory';
function App() {
  const {
    t,
    i18n
  } = useTranslation();
  useEffect(() => {
    document.documentElement.lang = i18n.language.startsWith('fr') ? 'fr' : 'en';
  }, [i18n.language]);
  const toggleLanguage = () => {
    const nextLang = i18n.language.startsWith('en') ? 'fr' : 'en';
    i18n.changeLanguage(nextLang);
  };
  return <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-background font-sans text-foreground relative">
          
          {}
          <button onClick={toggleLanguage} className="fixed bottom-6 right-6 z-50 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/20 hover:-translate-y-1 transition-all duration-300 active:scale-95 flex items-center gap-2 border border-slate-700" title="Toggle Language / Changer de langue">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
            {i18n.language.startsWith('en') ? 'FR' : 'EN'}
          </button>

          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            
            {}
            <Route path="/users" element={<ProtectedRoute allowedRoles={['Admin']}><UserList /></ProtectedRoute>} />
            <Route path="/users/new" element={<ProtectedRoute allowedRoles={['Admin']}><UserForm /></ProtectedRoute>} />
            <Route path="/users/edit/:id" element={<ProtectedRoute allowedRoles={['Admin']}><UserEditForm /></ProtectedRoute>} />
            <Route path="/logs" element={<ProtectedRoute><SystemLogs /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute allowedRoles={['Admin', 'Employee_Commercial', 'Employee_Achats']}><Reports /></ProtectedRoute>} />

            {}
            <Route path="/purchases/suppliers" element={<ProtectedRoute allowedRoles={['Admin', 'Employee_Achats']}><SupplierList /></ProtectedRoute>} />
            <Route path="/purchases/suppliers/new" element={<ProtectedRoute allowedRoles={['Admin', 'Employee_Achats']}><SupplierForm /></ProtectedRoute>} />
            <Route path="/purchases/suppliers/edit/:id" element={<ProtectedRoute allowedRoles={['Admin', 'Employee_Achats']}><SupplierForm /></ProtectedRoute>} />
            <Route path="/purchases/orders" element={<ProtectedRoute allowedRoles={['Admin', 'Employee_Achats']}><PurchaseOrderList /></ProtectedRoute>} />
            <Route path="/purchases/orders/new" element={<ProtectedRoute allowedRoles={['Admin', 'Employee_Achats']}><PurchaseOrderForm /></ProtectedRoute>} />

            {}
            <Route path="/customers" element={<ProtectedRoute allowedRoles={['Admin', 'Employee_Commercial']}><CustomerList /></ProtectedRoute>} />
            <Route path="/customers/new" element={<ProtectedRoute allowedRoles={['Admin', 'Employee_Commercial']}><CustomerForm /></ProtectedRoute>} />
            <Route path="/customers/edit/:id" element={<ProtectedRoute allowedRoles={['Admin', 'Employee_Commercial']}><CustomerForm /></ProtectedRoute>} />
            <Route path="/customers/:id" element={<ProtectedRoute allowedRoles={['Admin', 'Employee_Commercial']}><CustomerDetails /></ProtectedRoute>} />

            {}
            <Route path="/sales/pipeline" element={<ProtectedRoute allowedRoles={['Admin', 'Employee_Commercial']}><PipelineList /></ProtectedRoute>} />
            <Route path="/sales" element={<ProtectedRoute allowedRoles={['Admin', 'Employee_Commercial']}><SaleList /></ProtectedRoute>} />
            <Route path="/sales/new" element={<ProtectedRoute allowedRoles={['Admin', 'Employee_Commercial']}><SaleForm /></ProtectedRoute>} />
            <Route path="/sales/invoice/:id" element={<ProtectedRoute><SaleInvoice /></ProtectedRoute>} />
            <Route path="/sales/history/:id" element={<ProtectedRoute><PaymentHistory /></ProtectedRoute>} />

            {}
            <Route path="/inventory" element={<ProtectedRoute allowedRoles={['Admin', 'Employee_Stocks']}><ProductList /></ProtectedRoute>} />
            <Route path="/inventory/new" element={<ProtectedRoute allowedRoles={['Admin', 'Employee_Stocks']}><ProductForm /></ProtectedRoute>} />
        <Route path="/inventory/edit/:id" element={<ProtectedRoute allowedRoles={['Admin', 'Employee_Stocks']}><ProductEditForm /></ProtectedRoute>} />
        <Route path="/inventory/stock/:id" element={<ProtectedRoute allowedRoles={['Admin', 'Employee_Stocks']}><StockMovementForm /></ProtectedRoute>} />
        <Route path="/inventory/movements" element={<ProtectedRoute allowedRoles={['Admin', 'Employee_Stocks']}><StockMovementList /></ProtectedRoute>} />
        
        {}
        <Route path="/categories" element={<ProtectedRoute allowedRoles={['Admin']}><CategoryList /></ProtectedRoute>} />
        <Route path="/categories/new" element={<ProtectedRoute allowedRoles={['Admin']}><CategoryForm /></ProtectedRoute>} />
        <Route path="/categories/edit/:id" element={<ProtectedRoute allowedRoles={['Admin']}><CategoryForm /></ProtectedRoute>} />
        
        <Route path="/delivery-companies" element={<ProtectedRoute allowedRoles={['Admin']}><DeliveryCompanyList /></ProtectedRoute>} />
        <Route path="/delivery-companies/new" element={<ProtectedRoute allowedRoles={['Admin']}><DeliveryCompanyForm /></ProtectedRoute>} />
        <Route path="/delivery-companies/edit/:id" element={<ProtectedRoute allowedRoles={['Admin']}><DeliveryCompanyForm /></ProtectedRoute>} />

            <Route path="/unauthorized" element={<div className="flex h-screen flex-col items-center justify-center bg-gray-50">
                  <h1 className="text-4xl font-bold text-red-600 mb-4">{t('unauthorized.title')}</h1>
                  <p className="text-xl text-gray-700">{t('unauthorized.message')}</p>
                </div>} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>;
}
export default App;