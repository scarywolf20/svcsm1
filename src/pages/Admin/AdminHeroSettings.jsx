import React, { useEffect, useMemo, useState } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useToast } from '../../context/ToastContext';

const AdminHeroSettings = () => {
  const { success, error: toastError } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const [badgeText, setBadgeText] = useState('Admissions Open for 2026-27');
  const [titleLine1, setTitleLine1] = useState('Excellence in');
  const [titleHighlight, setTitleHighlight] = useState('Education & Character');
  const [subtitle, setSubtitle] = useState(
    'Join Swami Vivekananda College to experience a curriculum that blends academic rigor with moral leadership.'
  );
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop'
  );

  const docRef = useMemo(() => doc(db, 'siteContent', 'hero'), []);

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      try {
        const snap = await getDoc(docRef);
        if (!snap.exists() || ignore) {
          setIsLoading(false);
          return;
        }

        const data = snap.data() || {};
        setBadgeText(data.badgeText ?? badgeText);
        setTitleLine1(data.titleLine1 ?? titleLine1);
        setTitleHighlight(data.titleHighlight ?? titleHighlight);
        setSubtitle(data.subtitle ?? subtitle);
        setImageUrl(data.imageUrl ?? imageUrl);
        setIsLoading(false);
      } catch (e) {
        if (!ignore) {
          setError(e?.message || 'Failed to load hero settings');
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docRef]);

  const handleUploadToCloudinary = async (file) => {
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
      formData.append('upload_preset', 'Swami-Viveka');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const res = await fetch('https://api.cloudinary.com/v1_1/ditok7ztl/image/upload', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error?.message || 'Cloudinary upload failed');
      }

      const url = json?.secure_url || json?.url;
      if (!url) throw new Error('Cloudinary upload succeeded but no URL returned');

      setImageUrl(url);
      success('Image Uploaded', 'Hero background image updated successfully');
    } catch (e) {
      if (e.name === 'AbortError') {
        setError('Upload timeout. Please try again.');
        toastError('Upload Timeout', 'Upload took too long');
      } else {
        setError(e?.message || 'Failed to upload image');
        toastError('Upload Failed', e?.message || 'Failed to upload image');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');

    try {
      await setDoc(
        docRef,
        {
          badgeText,
          titleLine1,
          titleHighlight,
          subtitle,
          imageUrl,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      success('Settings Saved', 'Hero section updated successfully');
    } catch (e) {
      setError(e?.message || 'Failed to save hero settings');
      toastError('Error', e?.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center text-sm text-gray-500">Loading...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-gray-50/50">
        <h3 className="font-bold text-gray-800 text-lg">Hero Section</h3>
        <p className="text-sm text-gray-500 mt-1">Update homepage hero text and background image.</p>
      </div>

      {error && <div className="p-6 text-sm text-red-700 bg-red-50 border-b border-red-100">{error}</div>}

      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-bold mb-2 text-gray-700">Badge Text</label>
            <input
              type="text"
              value={badgeText}
              onChange={(e) => setBadgeText(e.target.value)}
              className="w-full p-3 border-2 rounded-lg focus:ring-2"
              style={{ borderColor: '#B8860B' }}
              placeholder="Admissions Open for 2026-27"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 text-gray-700">Title Line 1</label>
            <input
              type="text"
              value={titleLine1}
              onChange={(e) => setTitleLine1(e.target.value)}
              className="w-full p-3 border-2 rounded-lg focus:ring-2"
              style={{ borderColor: '#B8860B' }}
              placeholder="Excellence in"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 text-gray-700">Title Highlight</label>
            <input
              type="text"
              value={titleHighlight}
              onChange={(e) => setTitleHighlight(e.target.value)}
              className="w-full p-3 border-2 rounded-lg focus:ring-2"
              style={{ borderColor: '#B8860B' }}
              placeholder="Education & Character"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 text-gray-700">Subtitle</label>
            <textarea
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              rows={4}
              className="w-full p-3 border-2 rounded-lg focus:ring-2"
              style={{ borderColor: '#B8860B' }}
              placeholder="Hero subtitle"
            />
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
                className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-bold file:bg-sv-blue file:text-white hover:file:bg-sv-blue/90 disabled:opacity-50"
                disabled={isUploading}
              />
              <p className="text-xs text-gray-500 mt-2">Max 10MB. {isUploading && <span className="text-sv-blue font-bold">Uploading...</span>}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="w-full sm:w-auto px-5 py-3 rounded-lg font-bold text-white bg-sv-maroon hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <div>
          <div className="text-sm font-bold text-gray-700 mb-3">Preview</div>
          <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-900 relative">
            <img src={imageUrl} alt="Hero" className="w-full h-64 object-cover opacity-70" />
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <div className="text-center">
                <div className="inline-block py-1 px-4 rounded-full bg-yellow-400/20 border border-yellow-400 text-yellow-200 text-xs font-semibold mb-4 uppercase tracking-wider">
                  {badgeText || ' '}
                </div>
                <div className="text-white font-extrabold text-3xl leading-tight">
                  {titleLine1 || ' '}
                  <br />
                  <span className="text-yellow-200">{titleHighlight || ' '}</span>
                </div>
                <div className="text-gray-200 text-sm mt-3 max-w-md mx-auto">{subtitle || ' '}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHeroSettings;
