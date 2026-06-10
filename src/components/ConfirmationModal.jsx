import { useTranslation } from 'react-i18next';
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  type = 'primary'
}) => {
  const {
    t
  } = useTranslation();
  if (!isOpen) return null;
  const colorClass = type === 'danger' ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200';
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <h3 className="text-lg font-black text-slate-900 mb-2">{title}</h3>
          <p className="text-sm text-slate-500 leading-relaxed">{message}</p>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
          <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            {t('common.cancel')}
          </button>
          <button onClick={() => {
          onConfirm();
          onClose();
        }} className={`px-4 py-2 text-sm font-bold text-white rounded-lg transition-all shadow-lg active:scale-95 ${colorClass}`}>
            {confirmText || t('common.confirm')}
          </button>
        </div>
      </div>
    </div>;
};
export default ConfirmationModal;