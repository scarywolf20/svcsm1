import React, { useEffect, useMemo, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { Trash2, Edit2, CheckCircle, XCircle, Home, EyeOff, Eye } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const CLOUDINARY_CLOUD_NAME = 'ditok7ztl';
const CLOUDINARY_UPLOAD_PRESET = 'Swami-Viveka';

const AdminTestimonials = () => {
  const { success, error: toastError } = useToast();
  const testimonialsCol = useMemo(() => collection(db, 'testimonials'), []);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const [items, setItems] = useState([]);

  // Form State
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [currentStatus, setCurrentStatus] = useState('');
  const [quote, setQuote] = useState('');
  const [rating, setRating] = useState(5);
  const [imageUrl, setImageUrl] = useState('');
  const [approved, setApproved] = useState(false);
  const [showOnHome, setShowOnHome] = useState(false);

  const load = async () => {
    setError('');
    setIsLoading(true);

    try {
      const snap = await getDocs(testimonialsCol);
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      // Sort by newest first
      rows.sort((a, b) => {
          const tA = a.createdAt?.toMillis?.() || 0;
          const tB = b.createdAt?.toMillis?.() || 0;
          return tB - tA;
      });

      setItems(rows);
    } catch (e) {
      setError(e?.message || 'Failed to load testimonials');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testimonialsCol]);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setRole('');
    setCurrentStatus('');
    setQuote('');
    setRating(5);
    setImageUrl('');
    setApproved(false);
    setShowOnHome(false);
  };

  const startEdit = (row) => {
    setEditingId(row.id);
    setName(row.name || '');
    setRole(row.role || '');
    setCurrentStatus(row.currentStatus || '');
    setQuote(row.quote || '');
    setRating(row.rating || 5);
    setImageUrl(row.image || '');
    setApproved(!!row.approved);
    setShowOnHome(!!row.showOnHome);
    // Scroll to form logic if needed
  };

  const handleUpload = async (file) => {
    if (!file) return;
    setError('');
    setIsUploading(true);

    try {
      // Validate file
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error('File too large. Maximum size: 10MB');
      }
      if (!file.type.startsWith('image/')) {
        throw new Error('Only image files are allowed');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message || 'Upload failed');
      
      const url = json.secure_url || json.url;
      if (!url) throw new Error('Upload succeeded but no URL returned');
      
      setImageUrl(url);
      success('Image Uploaded', 'Image uploaded to Cloudinary');
    } catch (e) {
      if (e.name === 'AbortError') {
        setError('Upload timeout. Please try again.');
        toastError('Upload Timeout', 'Upload took too long');
      } else {
        setError(e.message);
        toastError('Upload Failed', e.message);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !quote.trim()) {
      setError('Name and Quote are required');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const payload = {
        name: name.trim(),
        role: role.trim(),
        currentStatus: currentStatus.trim(),
        quote: quote.trim(),
        rating: Number(rating),
        image: imageUrl.trim(),
        approved,
        showOnHome,
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(doc(db, 'testimonials', editingId), payload);
      } else {
        await addDoc(testimonialsCol, {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }

      resetForm();
      await load();
      success('Success', editingId ? 'Testimonial updated' : 'Testimonial added');
    } catch (err) {
      setError(err?.message || 'Failed to save');
      toastError('Error', err?.message || 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      await deleteDoc(doc(db, 'testimonials', id));
      await load();
      success('Deleted', 'Testimonial removed');
    } catch (e) {
      setError('Failed to delete');
      toastError('Delete Failed', 'Could not delete testimonial');
    }
  };

  const toggleField = async (row, field) => {
      try {
          await updateDoc(doc(db, 'testimonials', row.id), {
              [field]: !row[field],
              updatedAt: serverTimestamp()
          });
          load(); // Reload to refresh UI properly
          success('Updated', `${field} updated successfully`);
      } catch (e) {
          setError('Failed to update status');
          toastError('Update Failed', 'Could not update status');
      }
  }

  return (
    <div className="space-y-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h1 className="text-2xl font-bold text-gray-800">Testimonials Management</h1>
            <p className="text-gray-500 mt-1">Manage user reviews, approve them for the site, or feature them on the home page.</p>
        </div>

        {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">{error}</div>}

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">{editingId ? 'Edit Testimonial' : 'Add / Review Testimonial'}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Name *</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-sv-blue" required />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Role (e.g. Alumni, Parent)</label>
                        <input type="text" value={role} onChange={e => setRole(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-sv-blue" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Current Status</label>
                        <input type="text" value={currentStatus} onChange={e => setCurrentStatus(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-sv-blue" placeholder="e.g. Software Engineer at Google" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Rating</label>
                        <select value={rating} onChange={e => setRating(Number(e.target.value))} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-sv-blue">
                            {[1,2,3,4,5].map(r => <option key={r} value={r}>{r} Stars</option>)}
                        </select>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Photo</label>
                        <input type="file" accept="image/*" onChange={e => handleUpload(e.target.files?.[0])} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-sv-blue file:text-white disabled:opacity-50" disabled={isUploading} />
                        <p className="text-xs text-gray-500 mt-1">Max 10MB. {isUploading && <span className="text-sv-blue font-bold">Uploading...</span>}</p>
                        {imageUrl && <img src={imageUrl} alt="Preview" className="w-16 h-16 rounded-full object-cover mt-2 border border-gray-200" />}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Quote *</label>
                        <textarea value={quote} onChange={e => setQuote(e.target.value)} rows={4} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-sv-blue" required />
                    </div>
                    <div className="flex gap-6 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={approved} onChange={e => setApproved(e.target.checked)} className="w-5 h-5 rounded text-sv-blue" />
                            <span className="text-sm font-medium">Approve for Testimonials Page</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={showOnHome} onChange={e => setShowOnHome(e.target.checked)} className="w-5 h-5 rounded text-sv-blue" />
                            <span className="text-sm font-medium">Show on Home Page</span>
                        </label>
                    </div>
                </div>

                <div className="md:col-span-2 pt-4 border-t flex gap-3">
                    <button type="submit" disabled={isSaving || isUploading} className="bg-sv-blue text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-900 disabled:opacity-50">
                        {editingId ? 'Update Testimonial' : 'Add Testimonial'}
                    </button>
                    {editingId && (
                        <button type="button" onClick={resetForm} className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-bold hover:bg-gray-200">
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>

        {/* List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
                <h3 className="font-bold text-gray-700">All Testimonials ({items.length})</h3>
            </div>
            {isLoading ? (
                <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : items.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No testimonials found.</div>
            ) : (
                <div className="divide-y divide-gray-100">
                    {items.map(item => (
                        <div key={item.id} className="p-6 flex flex-col md:flex-row gap-4 items-start md:items-center">
                            <img src={item.image || 'https://via.placeholder.com/150'} alt={item.name} className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-bold text-gray-900">{item.name}</h4>
                                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full border">{item.role}</span>
                                    <div className="flex text-yellow-500 text-xs gap-0.5">
                                        {[...Array(item.rating || 5)].map((_, i) => <span key={i}>★</span>)}
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 italic">"{item.quote}"</p>
                                <div className="flex gap-2 mt-2 text-xs font-semibold">
                                    {item.approved ? (
                                        <span className="text-green-600 flex items-center gap-1"><CheckCircle size={12} /> Approved</span>
                                    ) : (
                                        <span className="text-amber-600 flex items-center gap-1"><EyeOff size={12} /> Pending</span>
                                    )}
                                    {item.showOnHome && (
                                        <span className="text-sv-blue flex items-center gap-1"><Home size={12} /> On Home</span>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <button onClick={() => toggleField(item, 'approved')} title={item.approved ? "Unapprove" : "Approve"} className={`p-2 rounded-lg ${item.approved ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400 hover:bg-green-50 hover:text-green-600'}`}>
                                    {item.approved ? <CheckCircle size={18} /> : <CheckCircle size={18} />}
                                </button>
                                <button onClick={() => toggleField(item, 'showOnHome')} title={item.showOnHome ? "Remove from Home" : "Show on Home"} className={`p-2 rounded-lg ${item.showOnHome ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400 hover:bg-blue-50 hover:text-blue-600'}`}>
                                    <Home size={18} />
                                </button>
                                <button onClick={() => startEdit(item)} className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
                                    <Edit2 size={18} />
                                </button>
                                <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
};

export default AdminTestimonials;
