import React, { useEffect, useMemo, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { Trash2, Image as ImageIcon, Upload, Filter, Plus } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const CLOUDINARY_CLOUD_NAME = 'ditok7ztl';
const CLOUDINARY_UPLOAD_PRESET = 'Swami-Viveka';

const CATEGORIES = ["Campus", "Sports", "Cultural", "Students"];

const AdminGallery = () => {
  const { success, error: toastError } = useToast();
  const galleryCol = useMemo(() => collection(db, 'gallery_images'), []);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('All');

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [imageUrl, setImageUrl] = useState('');

  const load = async () => {
    setError('');
    setIsLoading(true);

    try {
      const snap = await getDocs(galleryCol);
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      // Sort by newest first
      rows.sort((a, b) => {
          const tA = a.createdAt?.toMillis?.() || 0;
          const tB = b.createdAt?.toMillis?.() || 0;
          return tB - tA;
      });

      setItems(rows);
    } catch (e) {
      setError(e?.message || 'Failed to load gallery images');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [galleryCol]);

  const handleUpload = async (file) => {
    if (!file) return;
    setError('');
    setIsSaving(true);

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
      success('Image Uploaded', 'Image uploaded to Cloudinary successfully');
    } catch (e) {
      if (e.name === 'AbortError') {
        setError('Upload timeout. Please try again.');
        toastError('Upload Timeout', 'Upload took too long');
      } else {
        setError(e.message);
        toastError('Upload Failed', e.message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl) {
      setError('Title and Image are required');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      await addDoc(galleryCol, {
        title: title.trim(),
        cat: category,
        src: imageUrl,
        createdAt: serverTimestamp(),
      });

      // Reset form
      setTitle('');
      setCategory(CATEGORIES[0]);
      setCategory(CATEGORIES[0]);
      setImageUrl('');
      await load();
      success('Success', 'Image added to gallery');
    } catch (err) {
      setError(err?.message || 'Failed to save');
      toastError('Error', err?.message || 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    try {
      await deleteDoc(doc(db, 'gallery_images', id));
      await load();
      success('Deleted', 'Image removed from gallery');
    } catch (e) {
      setError('Failed to delete');
      toastError('Error', 'Failed to delete image');
    }
  };

  const filteredItems = filter === 'All' ? items : items.filter(item => item.cat === filter);

  return (
    <div className="space-y-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h1 className="text-2xl font-bold text-gray-800">Gallery Management</h1>
            <p className="text-gray-500 mt-1">Upload and manage photos for the gallery page.</p>
        </div>

        {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">{error}</div>}

        {/* Add New Image Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Plus size={20} className="text-sv-blue" /> Add New Photo
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                
                <div className="md:col-span-1">
                     <label className="block text-sm font-semibold text-gray-700 mb-1">Image Upload *</label>
                     <div className="w-full relative group">
                        <label className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${imageUrl ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:bg-gray-50'}`}>
                            {imageUrl ? (
                                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                            ) : (
                                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-500">
                                    <Upload size={24} className="mb-2" />
                                    <p className="text-xs">Click to upload</p>
                                </div>
                            )}
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e.target.files[0])} disabled={isSaving} />
                        </label>
                        {imageUrl && (
                            <button 
                                type="button"
                                onClick={() => setImageUrl('')}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                     </div>
                </div>

                <div className="md:col-span-2 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Title / Caption *</label>
                            <input 
                                type="text" 
                                value={title} 
                                onChange={e => setTitle(e.target.value)} 
                                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-sv-blue" 
                                placeholder="e.g. Annual Sports Day"
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                            <select 
                                value={category} 
                                onChange={e => setCategory(e.target.value)} 
                                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-sv-blue"
                            >
                                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={isSaving || !imageUrl} 
                        className="w-full bg-sv-blue text-white py-3 rounded-lg font-bold hover:bg-blue-900 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isSaving ? 'Uploading...' : 'Add to Gallery'}
                    </button>
                </div>
            </form>
        </div>

        {/* Gallery List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                    <ImageIcon size={18} /> All Photos ({items.length})
                </h3>
                
                <div className="flex gap-2">
                    <button 
                         onClick={() => setFilter('All')} 
                         className={`px-3 py-1 text-xs font-bold rounded-full border ${filter === 'All' ? 'bg-sv-blue text-white border-sv-blue' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                    >
                        All
                    </button>
                    {CATEGORIES.map(cat => (
                         <button 
                            key={cat}
                            onClick={() => setFilter(cat)} 
                            className={`px-3 py-1 text-xs font-bold rounded-full border ${filter === cat ? 'bg-sv-blue text-white border-sv-blue' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                       >
                           {cat}
                       </button>
                    ))}
                </div>
            </div>

            {isLoading ? (
                <div className="p-12 text-center text-gray-400">Loading gallery...</div>
            ) : filteredItems.length === 0 ? (
                <div className="p-12 text-center text-gray-400 flex flex-col items-center">
                    <ImageIcon size={48} className="mb-2 opacity-20" />
                    No images found{filter !== 'All' ? ` in ${filter}` : ''}.
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 p-6">
                    {filteredItems.map(item => (
                        <div key={item.id} className="relative group rounded-lg overflow-hidden shadow-sm hover:shadow-md border border-gray-200 bg-gray-50 aspect-square">
                            <img src={item.src} alt={item.title} className="w-full h-full object-cover" />
                            
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                <p className="text-white text-xs font-bold truncate">{item.title}</p>
                                <span className="text-gray-300 text-[10px]">{item.cat}</span>
                                
                                <button 
                                    onClick={() => handleDelete(item.id)} 
                                    className="absolute top-2 right-2 bg-white text-red-500 p-1.5 rounded-full hover:bg-red-50"
                                    title="Delete"
                                >
                                    <Trash2 size={14} />
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

export default AdminGallery;
