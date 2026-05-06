import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, Star, Upload, CheckCircle } from 'lucide-react';
import { collection, addDoc, getDocs, query, where, serverTimestamp, orderBy } from 'firebase/firestore';

import { db } from '../../firebase';
import SEO from '../../components/SEO';

const CLOUDINARY_CLOUD_NAME = 'ditok7ztl';
const CLOUDINARY_UPLOAD_PRESET = 'Swami-Viveka';

const TestimonialsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const testimonialsCol = useMemo(() => collection(db, 'testimonials'), []);

  const staticReviews = [
    { id: 's1', name: "Rahul Sharma", role: "Alumni '23", quote: "The best two years of my academic life.", rating: 5, approved: true },
    { id: 's2', name: "Priya Patil", role: "Student (12th)", quote: "Teachers are very supportive and labs are great.", rating: 5, approved: true },
    { id: 's3', name: "Amit Verma", role: "Parent", quote: "Very disciplined environment. Happy with my son's progress.", rating: 5, approved: true },
    { id: 's4', name: "Sneha Gupta", role: "Alumni '22", quote: "Helped me crack NEET in first attempt!", rating: 4, approved: true },
    { id: 's5', name: "Karan Singh", role: "Student (11th)", quote: "Sports facilities are top notch.", rating: 5, approved: true },
    { id: 's6', name: "Dr. A. Kulkarni", role: "Guest Lecturer", quote: "Impressed by the student quality here.", rating: 5, approved: true },
  ];

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // Only fetch approved testimonials
        const q = query(testimonialsCol, where("approved", "==", true));
        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        // Sort manually if needed
        data.sort((a, b) => {
             const tA = a.createdAt?.toMillis?.() || 0;
             const tB = b.createdAt?.toMillis?.() || 0;
             return tB - tA;
        });

        if (data.length > 0) {
            setReviews(data);
        } else {
            setReviews(staticReviews);
        }
      } catch (error) {
        console.error("Error fetching testimonials:", error);
        setReviews(staticReviews);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [testimonialsCol]);

  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploadError('');
    setIsUploadingImage(true);

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
      setImage(null); // Clear file input
    } catch (e) {
      if (e.name === 'AbortError') {
        setUploadError('Upload timeout. Please try again.');
      } else {
        setUploadError(e.message || 'Image upload failed. Please try again.');
      }
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !text) return;

    setIsSubmitting(true);
    
    try {
      await addDoc(testimonialsCol, {
        name,
        role,
        quote: text,
        rating: Number(rating),
        image: imageUrl, // Can be empty if no image uploaded
        approved: false, // Default to false, requires admin approval
        showOnHome: false,
        createdAt: serverTimestamp()
      });

      setIsSuccess(true);
      // Reset form
      setName('');
      setRole('');
      setText('');
      setRating(5);
      setImageUrl('');
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-5 min-h-screen bg-gray-50">
      <SEO 
        title="Testimonials" 
        description="Read what our students, parents, and alumni have to say about SVICSM."
        keywords="testimonials, reviews, student feedback, alumni stories"
        url="/campus-life/testimonials"
      />
      {/* Header */}
      <section className="bg-sv-blue py-20 text-center text-white">
        <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-4">Voices of SVICSM</h1>
            <p className="text-xl text-white/80">Hear from our students, alumni, and parents.</p>
        </div>
      </section>

      {/* Review Grid */}
      <section className="container mx-auto px-4 py-16">
        
        {isLoading ? (
             <div className="text-center py-20 text-gray-500">Loading stories...</div>
        ) : reviews.length === 0 ? (
             <div className="text-center py-20 text-gray-500">No stories yet. Be the first to share!</div>
        ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
            {reviews.map((review, i) => (
                <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow flex flex-col"
                >
                <div className="flex items-center gap-4 mb-6">
                    <img 
                        src={review.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.name)}&background=random`} 
                        alt={review.name} 
                        className="w-14 h-14 rounded-full object-cover border-2 border-gray-100"
                    />
                    <div>
                        <h4 className="font-bold text-gray-900 leading-tight">{review.name}</h4>
                        <span className="text-xs text-sv-blue uppercase tracking-wide font-bold">{review.role}</span>
                    </div>
                </div>

                <div className="flex text-sv-gold mb-4">
                    {[...Array(review.rating || 5)].map((_, idx) => <Star key={idx} size={16} fill="currentColor" />)}
                </div>
                
                <div className="flex-1">
                     <p className="text-gray-700 italic leading-relaxed">"{review.quote}"</p>
                </div>
                
                {review.currentStatus && (
                    <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-400 font-medium">
                        {review.currentStatus}
                    </div>
                )}
                </motion.div>
            ))}
            </div>
        )}

        {/* Submit Review Form */}
        <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-xl border-t-8 border-sv-maroon text-center relative overflow-hidden">
            {/* Background Icon */}
            <Quote className="absolute top-10 right-10 text-gray-100 -rotate-12" size={150} />

            <div className="relative z-10">
                <h2 className="text-2xl font-bold text-sv-blue mb-2">Share Your Experience</h2>
                <p className="text-gray-500 mb-8">Are you a student, parent, or alumni? Let us know your thoughts.</p>
                
                {isSuccess ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-green-50 text-green-800 p-8 rounded-2xl border border-green-100"
                    >
                        <CheckCircle size={48} className="mx-auto mb-4 text-green-600" />
                        <h3 className="text-xl font-bold mb-2">Thank you for sharing!</h3>
                        <p>Your review has been submitted and is pending approval. It will be visible once approved by the administration.</p>
                        <button onClick={() => setIsSuccess(false)} className="mt-6 text-sm font-bold text-green-700 underline hover:text-green-900">
                            Submit another review
                        </button>
                    </motion.div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5 text-left">
                        <div className="grid md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Your Name *</label>
                                <input 
                                    type="text" 
                                    required
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Enter your full name" 
                                    className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:outline-none focus:border-sv-maroon focus:ring-1 focus:ring-sv-maroon transition-all" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Role / Batch</label>
                                <input 
                                    type="text" 
                                    value={role}
                                    onChange={e => setRole(e.target.value)}
                                    placeholder="e.g. Alumni '22, Parent" 
                                    className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:outline-none focus:border-sv-maroon focus:ring-1 focus:ring-sv-maroon transition-all" 
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Your Review *</label>
                            <textarea 
                                required
                                rows="4" 
                                value={text}
                                onChange={e => setText(e.target.value)}
                                placeholder="Share your experience at SVCMS..." 
                                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:outline-none focus:border-sv-maroon focus:ring-1 focus:ring-sv-maroon transition-all"
                            ></textarea>
                        </div>

                        <div className="grid md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Rating</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            type="button"
                                            key={star}
                                            onClick={() => setRating(star)}
                                            className={`p-2 rounded-lg transition-colors ${rating >= star ? 'text-sv-gold' : 'text-gray-300'}`}
                                        >
                                            <Star size={24} fill={rating >= star ? "currentColor" : "none"} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Profile Photo (Optional)</label>
                                <div className="flex items-center gap-3">
                                    <label className={`cursor-pointer ${isUploadingImage ? 'opacity-50 cursor-not-allowed' : ''} bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors`}>
                                        <Upload size={16} />
                                        {isUploadingImage ? 'Uploading...' : imageUrl ? 'Change Photo' : 'Upload Photo'}
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            className="hidden" 
                                            onChange={e => handleImageUpload(e.target.files?.[0])}
                                            disabled={isUploadingImage}
                                        />
                                    </label>
                                    {imageUrl && (
                                        <div className="relative">
                                            <img src={imageUrl} alt="Preview" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                                            <button 
                                                type="button"
                                                onClick={() => setImageUrl('')}
                                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {uploadError && <p className="text-xs text-red-500 mt-1">{uploadError}</p>}
                            </div>
                        </div>

                        <button 
                            disabled={isSubmitting}
                            className="w-full bg-sv-maroon text-white font-bold py-4 rounded-xl hover:bg-red-900 transition-colors shadow-lg shadow-red-900/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </form>
                )}
            </div>
        </div>

      </section>
    </div>
  );
};

export default TestimonialsPage;