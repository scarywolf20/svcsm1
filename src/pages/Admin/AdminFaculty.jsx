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

const AdminFaculty = () => {
  const { success, error: toastError } = useToast();
  const facultyCol = useMemo(() => collection(db, 'faculty'), []);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const [items, setItems] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [category, setCategory] = useState('leadership');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [qual, setQual] = useState('');
  const [exp, setExp] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [active, setActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);

  const load = async () => {
    setError('');
    setIsLoading(true);
    try {
      const snap = await getDocs(facultyCol);
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      rows.sort((a, b) => {
        const catA = String(a?.category || '');
        const catB = String(b?.category || '');
        if (catA !== catB) return catA.localeCompare(catB);

        const orderA = Number.isFinite(a?.order) ? a.order : 0;
        const orderB = Number.isFinite(b?.order) ? b.order : 0;
        if (orderA !== orderB) return orderA - orderB;

        const toMillis = (v) => {
          if (!v) return 0;
          if (typeof v?.toMillis === 'function') return v.toMillis();
          if (typeof v?.toDate === 'function') return v.toDate().getTime();
          const d = new Date(v);
          if (Number.isNaN(d.getTime())) return 0;
          return d.getTime();
        };

        return toMillis(b?.createdAt) - toMillis(a?.createdAt);
      });
      setItems(rows);
    } catch (e) {
      setError(e?.message || 'Failed to load faculty');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facultyCol]);

  const resetForm = () => {
    setEditingId(null);
    setCategory('leadership');
    setName('');
    setRole('');
    setQual('');
    setExp('');
    setImageUrl('');
    setActive(true);
    setSortOrder(0);
  };

  const startEdit = (row) => {
    setEditingId(row.id);
    setCategory(row.category || 'leadership');
    setName(row.name || '');
    setRole(row.role || '');
    setQual(row.qual || '');
    setExp(row.exp || '');
    setImageUrl(row.imageUrl || '');
    setActive(Boolean(row.active));
    setSortOrder(Number.isFinite(row.order) ? row.order : 0);
  };

  const handleUploadToCloudinary = async (file) => {
    if (!file) return;

    setError('');
    setIsUploading(true);

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

      setImageUrl(url);
      success('Image Uploaded', 'Image uploaded to Cloudinary');
    } catch (e) {
      setError(e?.message || 'Failed to upload image');
      toastError('Upload Failed', e?.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !role.trim()) {
      setError('Name and Role are required');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const payload = {
        category,
        name: name.trim(),
        role: role.trim(),
        qual: qual.trim(),
        exp: exp.trim(),
        imageUrl: imageUrl.trim(),
        active,
        order: Number.isFinite(Number(sortOrder)) ? Number(sortOrder) : 0,
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(doc(db, 'faculty', editingId), payload);
      } else {
        await addDoc(facultyCol, {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }

      resetForm();
      await load();
      success('Success', editingId ? 'Faculty member updated' : 'Faculty member added');
    } catch (err) {
      setError(err?.message || 'Failed to save faculty');
      toastError('Error', err?.message || 'Failed to save faculty');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActive = async (row) => {
    setError('');
    try {
      await updateDoc(doc(db, 'faculty', row.id), {
        active: !row.active,
        updatedAt: serverTimestamp(),
      });
      await load();
      success('Updated', `Faculty member ${!row.active ? 'activated' : 'deactivated'}`);
    } catch (e) {
      setError(e?.message || 'Failed to update faculty');
      toastError('Error', 'Failed to update status');
    }
  };

  const remove = async (row) => {
    setError('');
    try {
      await deleteDoc(doc(db, 'faculty', row.id));
      await load();
      success('Deleted', 'Faculty member removed');
    } catch (e) {
      setError(e?.message || 'Failed to delete faculty');
      toastError('Error', 'Failed to delete faculty');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-gray-50/50">
        <h3 className="font-bold text-gray-800 text-lg">Faculty</h3>
        <p className="text-sm text-gray-500 mt-1">Manage Faculty page cards (Leadership + Heads of Departments).</p>
      </div>

      {error && <div className="p-6 text-sm text-red-700 bg-red-50 border-b border-red-100">{error}</div>}

      <div className="p-6 border-b border-gray-100">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          <div className="space-y-4 lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">Section</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-3 border-2 rounded-lg focus:ring-2"
                  style={{ borderColor: '#B8860B' }}
                >
                  <option value="leadership">Institute Leadership</option>
                  <option value="hod">Heads of Departments</option>
                </select>
              </div>

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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 border-2 rounded-lg uppercase focus:ring-2"
                  style={{ borderColor: '#B8860B' }}
                  placeholder="FULL NAME"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">Role *</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full p-3 border-2 rounded-lg focus:ring-2"
                  style={{ borderColor: '#B8860B' }}
                  placeholder="Principal / HOD: ..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">Qualification</label>
                <input
                  type="text"
                  value={qual}
                  onChange={(e) => setQual(e.target.value)}
                  className="w-full p-3 border-2 rounded-lg focus:ring-2"
                  style={{ borderColor: '#B8860B' }}
                  placeholder="B.E., MBA"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">Experience</label>
                <input
                  type="text"
                  value={exp}
                  onChange={(e) => setExp(e.target.value)}
                  className="w-full p-3 border-2 rounded-lg focus:ring-2"
                  style={{ borderColor: '#B8860B' }}
                  placeholder="10 Years"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">Image URL</label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full p-3 border-2 rounded-lg focus:ring-2"
                style={{ borderColor: '#B8860B' }}
                placeholder="https://..."
              />

              <div className="mt-3">
                <label className="block text-sm font-bold mb-2 text-gray-700">Or Upload Image (Cloudinary)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleUploadToCloudinary(e.target.files?.[0])}
                  className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-bold file:bg-sv-blue file:text-white hover:file:bg-sv-blue/90"
                />
                <p className="text-xs text-gray-500 mt-2">Upload preset: {CLOUDINARY_UPLOAD_PRESET}, Cloud name: {CLOUDINARY_CLOUD_NAME}</p>
                {isUploading && <p className="text-xs text-sv-blue mt-1 font-bold">Uploading image, please wait...</p>}
              </div>
            </div>
          </div>

          <div className="space-y-4">
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

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSaving || isUploading}
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
                src={imageUrl || 'https://via.placeholder.com/800x600?text=Faculty+Image'}
                alt="Preview"
                className="w-full h-40 object-cover opacity-80"
              />
              <div className="absolute inset-0 flex items-end p-3">
                <div className="text-xs text-white/90 font-semibold truncate">{name || ' '}</div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="text-sm text-gray-500">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-gray-500">No faculty entries yet.</div>
        ) : (
          <div className="space-y-3">
            {items.map((row) => (
              <div
                key={row.id}
                className="border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center gap-4 justify-between"
              >
                <div className="min-w-0">
                  <div className="text-sm font-bold text-gray-800 truncate">
                    {row.name} <span className="text-xs text-gray-500">({row.category || 'leadership'})</span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1 truncate">{row.role}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {row.active ? 'Active' : 'Inactive'} • Order: {Number.isFinite(row.order) ? row.order : 0}
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

export default AdminFaculty;
