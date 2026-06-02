import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const UserEditForm = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'Employee_Commercial', avatarUrl: '' });
  const [pendingFile, setPendingFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get('http://localhost:5000/api/auth/users', config);
        const currentUser = data.find(u => u._id === id);
        if (currentUser) {
          setFormData({
            firstName: currentUser.firstName,
            lastName: currentUser.lastName,
            email: currentUser.email,
            password: '',
            role: currentUser.role,
            avatarUrl: currentUser.avatarUrl || ''
          });
        }
      } catch (error) {
        console.error('Error fetching user', error);
      }
    };
    if (user) fetchUser();
  }, [id, user]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPendingFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setPendingFile(null);
    setPreviewUrl('');
    setFormData({ ...formData, avatarUrl: '' });
    const fileInput = document.getElementById('avatar-upload');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      let uploadedUrl = formData.avatarUrl;
      if (pendingFile) {
        const formDataFile = new FormData();
        formDataFile.append('image', pendingFile);
        const uploadConfig = { headers: { 'Content-Type': 'multipart/form-data' } };
        const { data } = await axios.post('http://localhost:5000/api/upload/users', formDataFile, uploadConfig);
        uploadedUrl = data;
      }

      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const payload = { ...formData, avatarUrl: uploadedUrl };
      if (!payload.password) delete payload.password;
      
      await axios.put(`http://localhost:5000/api/auth/users/${id}`, payload, config);
      navigate('/users');
    } catch (error) {
      console.error(error);
      setUploading(false);
      alert(error.response?.data?.message || t('users.errorUpdating'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex justify-center items-start pt-16">
      <div className="w-full max-w-lg bg-card p-8 rounded-xl shadow-sm border">
        <h1 className="text-2xl font-bold mb-6 text-foreground">{t('users.editEmployee')}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('users.firstName')}</label>
              <input className="w-full p-2.5 border rounded bg-white focus:ring-2 focus:ring-primary focus:outline-none" required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('users.lastName')}</label>
              <input className="w-full p-2.5 border rounded bg-white focus:ring-2 focus:ring-primary focus:outline-none" required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('users.emailAddress')}</label>
            <input type="email" className="w-full p-2.5 border rounded bg-white focus:ring-2 focus:ring-primary focus:outline-none" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('users.newPassword')}</label>
            <input type="password" minLength="6" className="w-full p-2.5 border rounded bg-white focus:ring-2 focus:ring-primary focus:outline-none" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('users.avatarUpload')}</label>
            <div className="flex items-center gap-4">
              {previewUrl || formData.avatarUrl || formData.firstName ? (
                <img 
                  src={previewUrl || (formData.avatarUrl ? (formData.avatarUrl.startsWith('/uploads') ? `http://localhost:5000${formData.avatarUrl}` : formData.avatarUrl) : `https://ui-avatars.com/api/?name=${formData.firstName}+${formData.lastName}&background=random`)} 
                  alt="Preview" 
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 shadow-sm" 
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
              )}
              <div className="flex-1">
                <div className="flex gap-2 items-center">
                  <input id="avatar-upload" type="file" onChange={handleFileSelect} className="w-full p-2.5 border rounded bg-white focus:ring-2 focus:ring-primary focus:outline-none text-sm" />
                  {(pendingFile || formData.avatarUrl) && (
                    <button type="button" onClick={handleRemoveImage} className="px-3 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100 transition-colors text-sm font-medium">
                      {t('common.remove')}
                    </button>
                  )}
                </div>
                {uploading && <p className="text-sm text-gray-500 mt-1">{t('common.uploadingAndSaving')}</p>}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('users.systemRole')}</label>
            <select className="w-full p-2.5 border rounded bg-white focus:ring-2 focus:ring-primary focus:outline-none" required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
              <option value="Employee_Commercial">{t('users.roleCommercial')}</option>
              <option value="Employee_Stocks">{t('users.roleStocks')}</option>
              <option value="Employee_Achats">{t('users.roleAchats')}</option>
              <option value="Employee_Finance">{t('users.roleFinance')}</option>
              <option value="Admin">{t('users.roleAdmin')}</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
            <button type="button" onClick={() => navigate('/users')} className="px-4 py-2 border rounded text-sm font-medium hover:bg-gray-50 transition-colors">{t('common.cancel')}</button>
            <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:opacity-90 transition-opacity">{t('users.updateEmployee')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserEditForm;
