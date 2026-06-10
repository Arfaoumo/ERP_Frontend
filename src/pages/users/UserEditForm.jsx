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
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/users`, config);
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
        const { data } = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/upload/users`, formDataFile, uploadConfig);
        uploadedUrl = data;
      }

      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const payload = { ...formData, avatarUrl: uploadedUrl };
      if (!payload.password) delete payload.password;
      
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/users/${id}`, payload, config);
      navigate('/users');
    } catch (error) {
      console.error(error);
      setUploading(false);
      alert(error.response?.data?.message || t('users.errorUpdating'));
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-[2rem] shadow-sm border border-slate-200/60 overflow-hidden">
        
        {/* 1. HEADER */}
        <div className="p-8 border-b flex justify-between items-center bg-white">
          <div className="flex items-center gap-4">
             <button type="button" onClick={() => navigate('/users')} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
             </button>
             <div>
               <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{t('users.editEmployee')}</h1>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t('users.subtitle', 'Team Member Profile')}</p>
             </div>
          </div>
        </div>
        
        {/* 2. FORM BODY */}
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">{t('users.firstName')}</label>
              <input 
                type="text" 
                required 
                value={formData.firstName} 
                onChange={e => setFormData({...formData, firstName: e.target.value})}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">{t('users.lastName')}</label>
              <input 
                type="text" 
                required 
                value={formData.lastName} 
                onChange={e => setFormData({...formData, lastName: e.target.value})}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm font-bold text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">{t('users.emailAddress')}</label>
              <input 
                type="email" 
                required 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm font-bold text-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">{t('users.newPassword')}</label>
              <input 
                type="password" 
                minLength="6" 
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm font-bold text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">{t('users.systemRole')}</label>
              <select 
                required 
                value={formData.role} 
                onChange={e => setFormData({...formData, role: e.target.value})}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm font-bold text-slate-900 cursor-pointer"
              >
                <option value="Employee_Commercial">{t('users.roleCommercial')}</option>
                <option value="Employee_Stocks">{t('users.roleStocks')}</option>
                <option value="Employee_Achats">{t('users.roleAchats')}</option>
                <option value="Employee_Finance">{t('users.roleFinance')}</option>
                <option value="Admin">{t('users.roleAdmin')}</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">{t('users.avatarUpload')}</label>
              <div className="flex items-center gap-4">
                {previewUrl || formData.avatarUrl || formData.firstName ? (
                  <img 
                    src={previewUrl || (formData.avatarUrl ? (formData.avatarUrl.startsWith('/uploads') ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${formData.avatarUrl}` : formData.avatarUrl) : `https://ui-avatars.com/api/?name=${formData.firstName}+${formData.lastName}&background=random`)} 
                    alt="Preview" 
                    className="w-12 h-12 rounded-full object-cover border-2 border-slate-200 shadow-sm" 
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center border-2 border-dashed border-slate-200 text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex gap-2 items-center">
                    <input 
                      id="avatar-upload" 
                      type="file" 
                      onChange={handleFileSelect} 
                      className="w-full text-xs font-bold text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:tracking-widest file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100 transition-all cursor-pointer" 
                    />
                    {(pendingFile || formData.avatarUrl) && (
                      <button 
                        type="button" 
                        onClick={handleRemoveImage} 
                        className="px-3 py-2 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-colors"
                      >
                        {t('common.remove')}
                      </button>
                    )}
                  </div>
                  {uploading && <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest animate-pulse">{t('common.uploadingAndSaving')}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* 3. FIXED ACTION FOOTER */}
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button 
              type="button" 
              onClick={() => navigate('/users')} 
              className="px-6 py-3 border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button 
              type="submit" 
              className="px-8 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
            >
              {t('users.updateEmployee')}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default UserEditForm;
