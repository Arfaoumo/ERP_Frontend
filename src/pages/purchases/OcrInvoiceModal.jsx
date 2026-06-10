import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
const OcrInvoiceModal = ({
  isOpen,
  onClose,
  supplier,
  supplierName,
  categories,
  onResolved
}) => {
  const {
    user
  } = useContext(AuthContext);
  const {
    t
  } = useTranslation();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState('');
  const [extracted, setExtracted] = useState(null);
  const [rows, setRows] = useState([]);
  if (!isOpen) return null;
  const reset = () => {
    setFile(null);
    setPreviewUrl('');
    setExtracted(null);
    setRows([]);
    setError('');
  };
  const handleClose = () => {
    reset();
    onClose();
  };
  const handleFileSelect = e => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setExtracted(null);
    setRows([]);
    setError('');
    if (f.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(f));
    } else {
      setPreviewUrl('');
    }
  };
  const handleExtract = async () => {
    if (!file) {
      setError(t('purchases.ocr.fileRequired'));
      return;
    }
    setExtracting(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data'
        }
      };
      const {
        data
      } = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ocr/invoice/extract`, formData, config);
      setExtracted(data);
      const mapped = (data.items || []).map(it => ({
        ...it,
        useExisting: Boolean(it.matchedProductId),
        categoryId: it.matchedCategoryId || '',
        sellingPrice: ''
      }));
      setRows(mapped);
      if (mapped.length === 0) {
        setError(t('purchases.ocr.noItemsExtracted'));
      }
    } catch (err) {
      console.error('OCR extract error', err);
      setError(err.response?.data?.message || t('purchases.ocr.extractFailed'));
    } finally {
      setExtracting(false);
    }
  };
  const updateRow = (idx, patch) => {
    setRows(prev => prev.map((r, i) => i === idx ? {
      ...r,
      ...patch
    } : r));
  };
  const removeRow = idx => {
    setRows(prev => prev.filter((_, i) => i !== idx));
  };
  const handleImport = async () => {
    if (!supplier) {
      setError(t('purchases.ocr.supplierRequired'));
      return;
    }
    if (rows.length === 0) {
      setError(t('purchases.ocr.noItemsToImport'));
      return;
    }
    for (const r of rows) {
      if (!r.useExisting) {
        if (!r.name?.trim() || !r.sku?.trim() || !r.categoryId) {
          setError(t('purchases.ocr.newProductFieldsRequired'));
          return;
        }
      }
      if (!(Number(r.quantity) > 0)) {
        setError(t('purchases.ocr.invalidQuantity'));
        return;
      }
      if (!(Number(r.buyingPrice) >= 0)) {
        setError(t('purchases.ocr.invalidPrice'));
        return;
      }
    }
    setResolving(true);
    setError('');
    try {
      const payload = {
        supplierId: supplier,
        items: rows.map(r => ({
          matchedProductId: r.useExisting ? r.matchedProductId : null,
          name: r.name,
          sku: r.sku,
          description: r.description,
          categoryId: r.useExisting ? undefined : r.categoryId,
          quantity: Number(r.quantity),
          buyingPrice: Number(r.buyingPrice),
          sellingPrice: r.sellingPrice ? Number(r.sellingPrice) : undefined
        }))
      };
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
      const {
        data
      } = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ocr/invoice/resolve`, payload, config);
      onResolved(data);
      reset();
      onClose();
    } catch (err) {
      console.error('OCR resolve error', err);
      setError(err.response?.data?.message || t('purchases.ocr.importFailed'));
    } finally {
      setResolving(false);
    }
  };
  const totalPreview = rows.reduce((acc, r) => acc + (Number(r.quantity) || 0) * (Number(r.buyingPrice) || 0), 0);
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
              </svg>
              {t('purchases.ocr.title')}
            </h2>
            <p className="text-xs text-slate-500 mt-1">{t('purchases.ocr.subtitle')}</p>
          </div>
          <button type="button" onClick={handleClose} className="text-slate-400 hover:text-slate-600 font-mono text-2xl leading-none">&times;</button>
        </div>

        {}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {!supplier && <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl">
              {t('purchases.ocr.selectSupplierFirst')}
            </div>}

          {supplier && !extracted && <div className="space-y-4">
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl" dangerouslySetInnerHTML={{
            __html: t('purchases.ocr.targetSupplier', {
              name: supplierName || ''
            })
          }}></div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">{t('purchases.ocr.uploadLabel')}</label>
                <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={handleFileSelect} className="w-full p-2 border rounded-lg bg-white text-sm" />
                <p className="text-xs text-slate-500 mt-1">{t('purchases.ocr.formats')}</p>
              </div>
              {previewUrl && <div className="border rounded-lg p-3 bg-slate-50 flex justify-center">
                  <img src={previewUrl} alt="invoice preview" className="max-h-80 rounded object-contain" />
                </div>}
              {file && !previewUrl && <div className="border rounded-lg p-3 bg-slate-50 text-sm text-slate-600 flex items-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                  <span className="font-mono">{file.name}</span>
                  <span className="text-slate-400">({(file.size / 1024).toFixed(1)} KB)</span>
                </div>}
            </div>}

          {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">{error}</div>}

          {extracted && <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-800 text-sm">{t('purchases.ocr.reviewItems')}</h3>
                <button type="button" onClick={() => {
              setExtracted(null);
              setRows([]);
              setError('');
            }} className="text-xs text-slate-500 hover:text-slate-700 underline">
                  {t('purchases.ocr.uploadDifferent')}
                </button>
              </div>

              {(extracted.documentNumber || extracted.supplierName || extracted.totalAmount) && <div className="text-xs text-slate-600 grid grid-cols-1 md:grid-cols-3 gap-2 bg-slate-50 p-3 rounded-lg border">
                  {extracted.supplierName && <div><span className="font-bold text-slate-500 uppercase tracking-wider">{t('purchases.ocr.detectedSupplier')}: </span>{extracted.supplierName}</div>}
                  {extracted.documentNumber && <div><span className="font-bold text-slate-500 uppercase tracking-wider">{t('purchases.ocr.detectedDocNumber')}: </span><span className="font-mono">{extracted.documentNumber}</span></div>}
                  {extracted.totalAmount !== null && extracted.totalAmount !== undefined && <div><span className="font-bold text-slate-500 uppercase tracking-wider">{t('purchases.ocr.detectedTotal')}: </span>€{Number(extracted.totalAmount).toFixed(2)}</div>}
                </div>}

              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr className="text-left text-[10px] font-black uppercase tracking-wider text-slate-500 border-b">
                      <th className="p-2 w-28">{t('purchases.ocr.colStatus')}</th>
                      <th className="p-2">{t('purchases.ocr.colName')}</th>
                      <th className="p-2 w-32">{t('purchases.ocr.colSku')}</th>
                      <th className="p-2 w-40">{t('purchases.ocr.colCategory')}</th>
                      <th className="p-2 w-20">{t('purchases.ocr.colQty')}</th>
                      <th className="p-2 w-28">{t('purchases.ocr.colPrice')}</th>
                      <th className="p-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => <tr key={idx} className={`border-b align-top ${row.useExisting ? 'bg-emerald-50/40' : 'bg-amber-50/30'}`}>
                        <td className="p-2 align-middle">
                          {row.matchedProductId ? <div className="space-y-1">
                              <span className={`inline-block text-[9px] font-bold uppercase px-2 py-0.5 rounded ${row.useExisting ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                {row.useExisting ? t('purchases.ocr.matched') : t('purchases.ocr.willCreate')}
                              </span>
                              <button type="button" onClick={() => updateRow(idx, {
                        useExisting: !row.useExisting
                      })} className="block text-[10px] text-slate-500 hover:text-slate-800 underline">
                                {row.useExisting ? t('purchases.ocr.createNewInstead') : t('purchases.ocr.useMatched')}
                              </button>
                            </div> : <span className="inline-block text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                              {t('purchases.ocr.willCreate')}
                            </span>}
                        </td>
                        <td className="p-2">
                          <input type="text" value={row.name || ''} onChange={e => updateRow(idx, {
                      name: e.target.value
                    })} disabled={row.useExisting} className="w-full p-1.5 border rounded text-sm disabled:bg-slate-100 disabled:text-slate-500" />
                          {row.useExisting && row.matchedProductName && row.matchedProductName !== row.name && <p className="text-[10px] text-slate-400 mt-1">{t('purchases.ocr.dbName')}: {row.matchedProductName}</p>}
                        </td>
                        <td className="p-2">
                          <input type="text" value={row.sku || ''} onChange={e => updateRow(idx, {
                      sku: e.target.value
                    })} disabled={row.useExisting} placeholder={row.useExisting ? '' : t('purchases.skuPlaceholder')} className="w-full p-1.5 border rounded text-sm font-mono disabled:bg-slate-100 disabled:text-slate-500" />
                        </td>
                        <td className="p-2">
                          {row.useExisting ? <span className="text-xs text-slate-600">{row.matchedCategoryName || '—'}</span> : <select value={row.categoryId || ''} onChange={e => updateRow(idx, {
                      categoryId: e.target.value
                    })} className="w-full p-1.5 border rounded text-sm bg-white">
                              <option value="">{t('purchases.selectCategory')}</option>
                              {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </select>}
                        </td>
                        <td className="p-2">
                          <input type="number" min="1" value={row.quantity} onChange={e => updateRow(idx, {
                      quantity: e.target.value
                    })} className="w-full p-1.5 border rounded text-sm" />
                        </td>
                        <td className="p-2">
                          <input type="number" step="0.01" min="0" value={row.buyingPrice} onChange={e => updateRow(idx, {
                      buyingPrice: e.target.value
                    })} className="w-full p-1.5 border rounded text-sm" />
                        </td>
                        <td className="p-2 text-right align-middle">
                          <button type="button" onClick={() => removeRow(idx)} className="text-rose-500 hover:text-rose-700">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path></svg>
                          </button>
                        </td>
                      </tr>)}
                    {rows.length === 0 && <tr><td colSpan="7" className="p-6 text-center text-slate-400 text-sm">{t('purchases.ocr.noRows')}</td></tr>}
                  </tbody>
                  {rows.length > 0 && <tfoot>
                      <tr className="bg-slate-50 border-t">
                        <td colSpan="5" className="p-2 text-right text-xs font-bold uppercase tracking-wider text-slate-500">{t('purchases.totalAmount')}</td>
                        <td colSpan="2" className="p-2 font-bold text-slate-800">€{totalPreview.toFixed(2)}</td>
                      </tr>
                    </tfoot>}
                </table>
              </div>
              <div className="text-xs text-slate-500">{t('purchases.ocr.reviewHint')}</div>
            </div>}
        </div>

        {}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button type="button" onClick={handleClose} className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-white transition-colors">
            {t('common.cancel')}
          </button>
          {!extracted ? <button type="button" onClick={handleExtract} disabled={!supplier || !file || extracting} className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2">
              {extracting && <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10" opacity="0.25"></circle><path d="M22 12a10 10 0 0 1-10 10"></path></svg>}
              {extracting ? t('purchases.ocr.extracting') : t('purchases.ocr.extractBtn')}
            </button> : <button type="button" onClick={handleImport} disabled={resolving || rows.length === 0} className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2">
              {resolving && <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10" opacity="0.25"></circle><path d="M22 12a10 10 0 0 1-10 10"></path></svg>}
              {resolving ? t('purchases.ocr.importing') : t('purchases.ocr.importBtn', {
            count: rows.length
          })}
            </button>}
        </div>
      </div>
    </div>;
};
export default OcrInvoiceModal;