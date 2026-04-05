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
import { useToast } from '../../context/ToastContext';

const CLOUDINARY_CLOUD_NAME = 'ditok7ztl';
const CLOUDINARY_UPLOAD_PRESET = 'Swami-Viveka';

const normalizeGallery = (thumbnail, gallery) => {
  const urls = Array.isArray(gallery) ? gallery.filter(Boolean) : [];
  const thumb = String(thumbnail || '').trim();
  if (thumb && !urls.includes(thumb)) urls.unshift(thumb);
  return urls;
};

const AdminActivitiesEvents = () => {
  const { success, error: toastError } = useToast();
  const eventsCol = useMemo(() => collection(db, 'activitiesEvents'), []);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [error, setError] = useState('');

  const [items, setItems] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [galleryText, setGalleryText] = useState('');
  const [active, setActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);

  const load = async () => {
    setError('');
    setIsLoading(true);

    try {
      const snap = await getDocs(eventsCol);
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      const toMillis = (v) => {
        if (!v) return 0;
        if (typeof v?.toMillis === 'function') return v.toMillis();
        if (typeof v?.toDate === 'function') return v.toDate().getTime();
        const dt = new Date(v);
        if (Number.isNaN(dt.getTime())) return 0;
        return dt.getTime();
      };

      rows.sort((a, b) => {
        const orderA = Number.isFinite(a?.order) ? a.order : 0;
        const orderB = Number.isFinite(b?.order) ? b.order : 0;
        if (orderA !== orderB) return orderA - orderB;
        return toMillis(b?.createdAt) - toMillis(a?.createdAt);
      });

      setItems(rows);
    } catch (e) {
      setError(e?.message || 'Failed to load activities/events');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventsCol]);

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setDate('');
    setThumbnailUrl('');
    setGalleryText('');
    setActive(true);
    setSortOrder(0);
  };

  const startEdit = (row) => {
    setEditingId(row.id);
    setTitle(row.title || '');
    setDate(row.date || '');
    setThumbnailUrl(row.thumbnailUrl || row.thumbnail || '');

    const gallery = Array.isArray(row.gallery) ? row.gallery : [];
    setGalleryText(gallery.join('\n'));

    setActive(Boolean(row.active));
    setSortOrder(Number.isFinite(row.order) ? row.order : 0);
  };

  const parseGalleryUrls = (text) => {
    return String(text || '')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const handleUploadToCloudinary = async (file) => {
    if (!file) return;

    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error?.message || 'Cloudinary upload failed');
      }

      const url = json?.secure_url || json?.url;
      if (!url) throw new Error('Cloudinary upload succeeded but no URL returned');

      return url;
    } catch (e) {
      throw new Error(e?.message || 'Failed to upload image');
    }
  };

  const handleThumbnailUpload = async (file) => {
    try {
      const url = await handleUploadToCloudinary(file);
      if (url) {
        setThumbnailUrl(url);
        const existing = parseGalleryUrls(galleryText);
        if (!existing.includes(url)) setGalleryText([url, ...existing].join('\n'));
      }
    } catch (e) {
      setError(e.message);
      toastError('Error', e.message);
    }
  };

  const handleGalleryUpload = async (files) => {
    if (!files || files.length === 0) return;

    setIsUploadingGallery(true);
    setError('');

    try {
      const newUrls = [];
      // Upload sequentially to avoid overwhelming browser/network or simple Promise.all
      // Using Promise.all for better performance if Cloudinary allows concurrency
      const uploadPromises = Array.from(files).map((file) => handleUploadToCloudinary(file));
      
      const results = await Promise.allSettled(uploadPromises);
      
      const successUrls = [];
      const errors = [];
      
      results.forEach((res) => {
        if (res.status === 'fulfilled') {
          successUrls.push(res.value);
        } else {
          errors.push(res.reason?.message);
        }
      });

      if (successUrls.length > 0) {
        setGalleryText((prev) => {
           const existing = parseGalleryUrls(prev);
           // Add new URLs to the top or bottom? Let's add to bottom.
           // Filter dupes just in case
           const combined = [...existing, ...successUrls]; 
           return combined.join('\n');
        });
      }

      if (errors.length > 0) {
        setError(`Some images failed to upload: ${errors[0]} (and ${errors.length - 1} others)`);
        toastError('Upload Warning', 'Some images failed to upload');
      } else {
        success('Gallery Uploaded', 'All images uploaded successfully');
      }

    } catch (e) {
      setError(e?.message || 'Failed to upload gallery images');
      toastError('Error', e?.message || 'Failed to upload gallery');
    } finally {
      setIsUploadingGallery(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const galleryUrls = normalizeGallery(thumbnailUrl, parseGalleryUrls(galleryText));

      const payload = {
        title: title.trim(),
        date: date.trim(),
        thumbnailUrl: thumbnailUrl.trim(),
        gallery: galleryUrls,
        active,
        order: Number.isFinite(Number(sortOrder)) ? Number(sortOrder) : 0,
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(doc(db, 'activitiesEvents', editingId), payload);
      } else {
        await addDoc(eventsCol, {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }

      resetForm();
      await load();
      success('Success', editingId ? 'Activity updated' : 'Activity added');
    } catch (err) {
      setError(err?.message || 'Failed to save activity/event');
      toastError('Error', err?.message || 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActive = async (row) => {
    setError('');
    try {
      await updateDoc(doc(db, 'activitiesEvents', row.id), {
        active: !row.active,
        updatedAt: serverTimestamp(),
      });
      await load();
      success('Updated', `Activity ${!row.active ? 'activated' : 'deactivated'}`);
    } catch (e) {
      setError(e?.message || 'Failed to update status');
      toastError('Error', 'Failed to update status');
    }
  };

  const remove = async (row) => {
    setError('');
    try {
      await deleteDoc(doc(db, 'activitiesEvents', row.id));
      await load();
      success('Deleted', 'Activity removed');
    } catch (e) {
      setError(e?.message || 'Failed to delete');
      toastError('Error', 'Failed to delete activity');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-gray-50/50">
        <h3 className="font-bold text-gray-800 text-lg">Activities & Events</h3>
        <p className="text-sm text-gray-500 mt-1">Manage the Activities & Events page cards and galleries.</p>
      </div>

      {error && <div className="p-6 text-sm text-red-700 bg-red-50 border-b border-red-100">{error}</div>}

      <div className="p-6 border-b border-gray-100">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          <div className="space-y-4 lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3 border-2 rounded-lg focus:ring-2"
                  style={{ borderColor: '#B8860B' }}
                  placeholder="Annual Cultural Fest"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">Date</label>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-3 border-2 rounded-lg focus:ring-2"
                  style={{ borderColor: '#B8860B' }}
                  placeholder="Jan 15, 2026"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">Order</label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full p-3 border-2 rounded-lg focus:ring-2"
                  style={{ borderColor: '#B8860B' }}
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">Status</label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="w-5 h-5 cursor-pointer"
                    style={{ accentColor: '#800020' }}
                  />
                  <span className="text-sm text-gray-700">Active (show on site)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">Thumbnail URL</label>
              <input
                type="text"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                className="w-full p-3 border-2 rounded-lg focus:ring-2"
                style={{ borderColor: '#B8860B' }}
                placeholder="https://..."
              />

              <div className="mt-3">
                <label className="block text-sm font-bold mb-2 text-gray-700">Or Upload Thumbnail (Cloudinary)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleThumbnailUpload(e.target.files?.[0])}
                  className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-bold file:bg-sv-blue file:text-white hover:file:bg-sv-blue/90"
                />
                <p className="text-xs text-gray-500 mt-2">Upload preset: {CLOUDINARY_UPLOAD_PRESET}, Cloud name: {CLOUDINARY_CLOUD_NAME}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">Gallery Image URLs (one per line)</label>
              <textarea
                value={galleryText}
                onChange={(e) => setGalleryText(e.target.value)}
                rows={5}
                className="w-full p-3 border-2 rounded-lg focus:ring-2"
                style={{ borderColor: '#B8860B' }}
                placeholder="https://...\nhttps://..."
              />
              <p className="text-xs text-gray-500 mt-2">Tip: add the thumbnail URL here too. If not included, it will be auto-added as the first image.</p>

              <div className="mt-4">
                <label className="block text-sm font-bold mb-2 text-gray-700">
                  Bulk Upload Gallery Images {isUploadingGallery && <span className="text-sv-blue">(Uploading...)</span>}
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                   onChange={(e) => handleGalleryUpload(e.target.files)}
                  className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-bold file:bg-sv-blue file:text-white hover:file:bg-sv-blue/90"
                  disabled={isUploadingGallery}
                />
                <p className="text-xs text-gray-500 mt-2">Select multiple files to upload at once.</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-3 rounded-lg font-bold text-white bg-sv-maroon hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingId ? (isSaving ? 'Updating...' : 'Update') : isSaving ? 'Saving...' : 'Add'}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-3 rounded-lg font-bold text-gray-700 bg-gray-100 hover:bg-gray-200"
                >
                  Cancel
                </button>
              )}
            </div>

            <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-900 relative">
              <img
                src={thumbnailUrl || 'https://via.placeholder.com/800x600?text=Thumbnail'}
                alt="Preview"
                className="w-full h-44 object-cover opacity-80"
              />
              <div className="absolute inset-0 flex items-end p-3">
                <div className="text-xs text-white/90 font-semibold truncate">{title || ' '}</div>
              </div>
            </div>

            <div className="text-xs text-gray-500">
              Gallery images: {parseGalleryUrls(galleryText).length}
            </div>
          </div>
        </form>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="text-sm text-gray-500">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-gray-500">No activities/events yet.</div>
        ) : (
          <div className="space-y-3">
            {items.map((row) => (
              <div
                key={row.id}
                className="border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center gap-4 justify-between"
              >
                <div className="min-w-0">
                  <div className="text-sm font-bold text-gray-800 truncate">{row.title}</div>
                  <div className="text-xs text-gray-500 mt-1 truncate">{row.date}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {row.active ? 'Active' : 'Inactive'} • Order: {Number.isFinite(row.order) ? row.order : 0} • Photos: {Array.isArray(row.gallery) ? row.gallery.length : 0}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => startEdit(row)}
                    className="px-4 py-2 rounded-lg text-sm font-bold bg-sv-blue text-white hover:bg-sv-blue/90"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleActive(row)}
                    className="px-4 py-2 rounded-lg text-sm font-bold bg-gray-100 text-gray-800 hover:bg-gray-200"
                  >
                    {row.active ? 'Deactivate' : 'Activate'}
                  </button>

                  <button
                    type="button"
                    onClick={() => remove(row)}
                    className="px-4 py-2 rounded-lg text-sm font-bold bg-red-50 text-red-700 hover:bg-red-100"
                  >
                    Delete
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

export default AdminActivitiesEvents;
