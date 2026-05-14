import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { FileText, Save, Download, CheckCircle, RefreshCcw, Upload } from 'lucide-react';
import SeniorAdmissionPDF from '../../components/PDF/SeniorAdmissionPDF';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import SEO from '../../components/SEO';

const SeniorAdmissionForm = () => {
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting }, reset } = useForm();
  const [formData, setFormData] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const selectedYear = watch("year");
  const selectedCourse = watch("course");
  const isHybrid = watch("isHybrid");

  const courseStructure = {
    'FY': {
      'BBA': { name: 'FY BBA', admission: 2500, tuition: 40000, coActivity: 10000, exam: 2500, total: 55000, oneTime: 52500, inst1: 30250, inst2: 24750 },
      'BCA': { name: 'FY BCA', admission: 2500, tuition: 40000, coActivity: 10000, exam: 2500, total: 55000, oneTime: 52500, inst1: 30250, inst2: 24750 },
      'BCOM': { name: 'FY B.COM', admission: 1000, tuition: 12000, coActivity: 2500, exam: 2500, total: 18000, oneTime: 17000, inst1: 9900, inst2: 8100 },
      'BA': { name: 'FY BA', admission: 1000, tuition: 7000, coActivity: 3000, exam: 1500, total: 12500, oneTime: 11000, inst1: 6875, inst2: 5625 }
    },
    'SY': {
      'BBA': { name: 'SY BBA', admission: 2500, tuition: 40000, coActivity: 10000, exam: 2500, total: 55000, oneTime: 52500, inst1: 30250, inst2: 24750 },
      'BCA': { name: 'SY BCA', admission: 2500, tuition: 40000, coActivity: 10000, exam: 2500, total: 55000, oneTime: 52500, inst1: 30250, inst2: 24750 },
      'BCOM': { name: 'SY B.COM', admission: 1000, tuition: 12000, coActivity: 2500, exam: 2500, total: 18000, oneTime: 17000, inst1: 9900, inst2: 8100 },
      'BA': { name: 'SY BA', admission: 1000, tuition: 7000, coActivity: 3000, exam: 1500, total: 12500, oneTime: 11000, inst1: 6875, inst2: 5625 }
    },
    'TY': {
      'BBA': { name: 'TY BBA', admission: 2500, tuition: 40000, coActivity: 10000, exam: 2500, total: 55000, oneTime: 52500, inst1: 30250, inst2: 24750 },
      'BCA': { name: 'TY BCA', admission: 2500, tuition: 40000, coActivity: 10000, exam: 2500, total: 55000, oneTime: 52500, inst1: 30250, inst2: 24750 },
      'BCOM': { name: 'TY B.COM', admission: 1000, tuition: 12000, coActivity: 2500, exam: 2500, total: 18000, oneTime: 17000, inst1: 9900, inst2: 8100 },
      'BA': { name: 'TY BA', admission: 1000, tuition: 7000, coActivity: 3000, exam: 1500, total: 12500, oneTime: 11000, inst1: 6875, inst2: 5625 }
    }
  };

  const hybridFees = {
    'BBA': { admission: 2500, tuition: 45000, coActivity: 10000, exam: 2500, total: 60000, oneTime: 57500, inst1: 35000, inst2: 25000 },
    'BCA': { admission: 2500, tuition: 45000, coActivity: 10000, exam: 2500, total: 60000, oneTime: 57500, inst1: 35000, inst2: 25000 },
    'BCOM': { admission: 1000, tuition: 14000, coActivity: 2500, exam: 2500, total: 20000, oneTime: 19000, inst1: 12000, inst2: 8000 },
    'BA': { admission: 1000, tuition: 8500, coActivity: 3000, exam: 1500, total: 14000, oneTime: 12500, inst1: 9000, inst2: 5000 }
  };

  // Helper: Capitalize first letter of each word
  const capitalizeWords = (str) => {
    if (!str) return '';
    return str.replace(/\b\w/g, (char) => char.toUpperCase()).replace(/\B[A-Z]/g, (char) => char.toLowerCase());
  };

  // Wrapper for text inputs to auto-capitalize
  const capitalizeRegister = (name, options = {}) => {
    return register(name, {
      ...options,
      onChange: (e) => {
        const capitalized = capitalizeWords(e.target.value);
        e.target.value = capitalized;
        setValue(name, capitalized, { shouldValidate: true });
      }
    });
  };

  const getSelectedCourseFees = () => {
    if (selectedYear && selectedCourse) {
      const baseFees = courseStructure[selectedYear]?.[selectedCourse];
      if (isHybrid && hybridFees[selectedCourse]) {
        return {
          ...baseFees,
          ...hybridFees[selectedCourse],
          name: `${baseFees.name} (Hybrid)`
        };
      }
      return baseFees;
    }
    return null;
  };

  const currentCourseFees = getSelectedCourseFees();

  const onInvalid = (invalidErrors) => {
    const firstField = Object.keys(invalidErrors || {})[0];
    if (!firstField) return;
    const el = document.querySelector(`[name="${CSS.escape(firstField)}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (typeof el.focus === 'function') el.focus();
    }
  };

  const onSubmit = async (data) => {
    const joinDigits = (prefix, count) => {
      let out = '';
      for (let i = 0; i < count; i++) out += data[`${prefix}${i}`] ?? '';
      return out;
    };

    const digitFieldSpecs = [
      { prefix: 'aadhar', count: 12 },
      { prefix: 'candidateMobile', count: 10 },
      { prefix: 'parentMobile', count: 10 },
    ];

    const appNo = `SVIM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    data.appNo = appNo;

    if (photoPreview) data.photoData = photoPreview;

    const combinedFields = {
      aadhar: joinDigits('aadhar', 12),
      candidateMobile: joinDigits('candidateMobile', 10),
      parentMobile: joinDigits('parentMobile', 10),
    };

    const payload = {
      ...data,
      ...combinedFields,
      appNo,
      formType: 'senior',
      status: 'Pending',
      createdAt: serverTimestamp(),
      isHybrid: !!data.isHybrid
    };

    delete payload.photoData;

    for (const spec of digitFieldSpecs) {
      for (let i = 0; i < spec.count; i++) delete payload[`${spec.prefix}${i}`];
    }

    try {
      const docRef = await addDoc(collection(db, 'seniorAdmissions'), payload);
      await addDoc(collection(db, 'notifications'), {
        type: 'senior_admission',
        title: 'New Senior Admission',
        message: `${data.firstName || ''} ${data.lastName || ''} - ${data.year} ${data.course}${data.isHybrid ? ' (Hybrid)' : ''}`,
        createdAt: serverTimestamp(),
        read: false,
        link: '/admin/senior-admissions'
      });

      data.submissionId = docRef.id;
      setFormData(data);
      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Failed to submit admission form:', err);
      alert('Submission failed. Please try again.');
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setFormData(null);
    setPhotoFile(null);
    setPhotoPreview(null);
    reset();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quickFillForm = () => {
    setValue("firstName", "Amit");
    setValue("middleName", "Kumar");
    setValue("lastName", "Sharma");
    setValue("motherName", "Priya Sharma");
    setValue("nameDevanagari", "अमित कुमार शर्मा");

    for (let i = 0; i < 12; i++) {
      const aadhar = "123456789012";
      setValue(`aadhar${i}`, aadhar[i]);
    }

    setValue("buildingName", "Shivaji Nivas");
    setValue("streetName", "Station Road");
    setValue("village", "Pimpalgaon (B)");
    setValue("district", "Nashik");
    setValue("state", "Maharashtra");
    setValue("pinCode", "422209");

    setValue("dobDay", "15");
    setValue("dobMonth", "08");
    setValue("dobYear", "2005");

    setValue("category", "Open");
    setValue("casteName", "N/A");
    setValue("gender", "Male");
    setValue("maritalStatus", "Unmarried");
    setValue("bloodGroup", "O+");

    setValue("email", "amit.sharma@example.com");

    for (let i = 0; i < 10; i++) {
      const mobile = "9876543210";
      setValue(`candidateMobile${i}`, mobile[i]);
      const parentMobile = "8765432109";
      setValue(`parentMobile${i}`, parentMobile[i]);
    }

    setValue("candidateWhatsapp", true);
    setValue("parentWhatsapp", true);

    setValue("lastExamMonth", "April");
    setValue("lastExamYear", "2024");
    setValue("lastSchoolCollege", "ABC College, Nashik");
    setValue("lastCourseName", "12th Commerce");
    setValue("lastPercentage", "75.50");
    setValue("lastResult", "Pass");
    setValue("applyScholarship", true);

    setValue("year", "FY");
    setValue("course", "BCA");

    setValue("bankAccountNumber", "1234567890123456");
    setValue("bankIFSC", "SBIN0001234");
    setValue("bankName", "State Bank of India");
    setValue("bankBranch", "Pimpalgaon");

    setValue("parentName", "Rajesh Sharma");
    setValue("relationWithCandidate", "Father");
    setValue("parentAddress", "Shivaji Nivas, Station Road, Pimpalgaon (B), Nashik - 422209");
    setValue("parentOccupation", "Business");
    setValue("parentIncome", "500000");

    setValue("declarationAccepted", true);
  };

  // DigitBoxes component (single line, no scrollbar)
  const DigitBoxes = ({ name, count, label }) => {
    return (
      <div>
        <label className="block text-sm font-bold mb-2 text-gray-700">{label} *</label>
        <div className="flex flex-nowrap gap-1 sm:gap-2">
          {[...Array(count)].map((_, i) => (
            <input
              key={i}
              type="text"
              maxLength="1"
              {...register(`${name}${i}`, {
                required: `${label} digit ${i + 1} required`,
                pattern: { value: /^[0-9]$/, message: "Only digits" }
              })}
              className="w-6 h-8 sm:w-10 sm:h-12 text-center border-2 rounded-lg text-sm sm:text-lg font-bold focus:ring-2 shrink-0"
              style={{ borderColor: '#B8860B', outlineColor: '#800020' }}
              onKeyDown={(e) => {
                const target = e.target;
                if (e.key === 'Backspace' && target.value === '' && i > 0) {
                  const prevInput = target.parentElement.children[i - 1];
                  if (prevInput) prevInput.focus();
                }
              }}
              onInput={(e) => {
                if (e.target.value && i < count - 1) {
                  const nextInput = e.target.parentElement.children[i + 1];
                  if (nextInput) nextInput.focus();
                }
              }}
            />
          ))}
        </div>
        {errors[`${name}0`] && <p className="text-red-600 text-xs mt-1">All digits required</p>}
      </div>
    );
  };

  const getCourseName = () => {
    if (formData && formData.year && formData.course) {
      return courseStructure[formData.year]?.[formData.course]?.name || 'Selected Course';
    }
    return 'Selected Course';
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6" style={{ backgroundColor: '#f8f7f3' }}>
      <SEO
        title="Senior College Admission Form"
        description="Apply for BBA, B.Com, and other degree courses at SVICSM. Start your professional journey today."
        keywords="senior college admission, BBA admission, BCom admission, undergraduate admission, nashik college"
        url="/admissions/senior-form"
      />
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden" style={{ borderColor: '#002147', borderWidth: '3px' }}>
          {/* Header Strip */}
          <div className="px-4 sm:px-6 md:px-8 py-5 flex flex-col md:flex-row md:justify-between md:items-center gap-4 text-white" style={{ backgroundColor: '#800020' }}>
            <div className="flex items-center gap-3">
              <FileText size={28} />
              <div>
                <span className="font-bold text-xl">Senior College Admission Form</span>
                <p className="text-sm opacity-90">Academic Year 2026-27</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              {/* <button type="button" onClick={quickFillForm} className="text-sm px-4 py-2 rounded-full transition-all flex items-center justify-center gap-2" style={{ backgroundColor: 'rgba(184, 134, 11, 0.3)' }}>
                <RefreshCcw size={16} /> Quick Fill Demo
              </button> */}
              {/* <span className="text-sm px-4 py-2 rounded-full text-center" style={{ backgroundColor: 'rgba(184, 134, 11, 0.3)' }}>Official Application</span> */}
            </div>
          </div>

          <div className="p-4 sm:p-6 md:p-10">
            {!isSubmitted ? (
              <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-10">
                {/* Course Selection */}
                <section className="p-4 sm:p-6 rounded-xl" style={{ backgroundColor: '#f0f4f8', borderColor: '#002147', borderWidth: '2px' }}>
                  <h3 className="text-xl font-bold mb-5 flex items-center gap-2" style={{ color: '#002147' }}>
                    <span className="text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: '#800020' }}>1</span>
                    Course Selection
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold mb-3 text-gray-700">Year *</label>
                      <select {...register("year", { required: "Please select a year" })} className="w-full p-3 border-2 rounded-lg focus:ring-2" style={{ borderColor: '#B8860B' }}>
                        <option value="">Select Year</option>
                        <option value="FY">First Year (FY)</option>
                        <option value="SY">Second Year (SY)</option>
                        <option value="TY">Third Year (TY)</option>
                      </select>
                      {errors.year && <p className="text-red-600 text-xs mt-2">{errors.year.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-3 text-gray-700">Course *</label>
                      <select {...register("course", { required: "Please select a course" })} className="w-full p-3 border-2 rounded-lg focus:ring-2" style={{ borderColor: '#B8860B' }}>
                        <option value="">Select Course</option>
                        <option value="BBA">BBA</option>
                        <option value="BCA">BCA</option>
                        <option value="BCOM">B.COM</option>
                        <option value="BA">BA</option>
                      </select>
                      {errors.course && <p className="text-red-600 text-xs mt-2">{errors.course.message}</p>}
                    </div>
                    <div className="md:col-span-2">
                      <label className="flex items-center gap-2 cursor-pointer p-4 rounded-lg bg-orange-50 border-2" style={{ borderColor: '#B8860B' }}>
                        <input type="checkbox" {...register("isHybrid")} className="w-6 h-6 cursor-pointer" style={{ accentColor: '#B8860B' }} />
                        <div>
                          <span className="font-bold text-gray-800 text-lg">Apply for Hybrid Mode</span>
                          <p className="text-sm text-gray-600">Students can only visit institute for exams. Fees structure is different for hybrid mode.</p>
                        </div>
                      </label>
                    </div>
                  </div>
                  <div className="mt-6">
                    <label className="block text-sm font-bold mb-2 text-gray-700">Upload Photo</label>
                    <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                      <div className="relative">
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" id="photo-upload" />
                        <label htmlFor="photo-upload" className="flex items-center justify-center gap-2 p-3 border-2 border-dashed rounded-lg bg-white hover:bg-gray-50 cursor-pointer transition-all" style={{ borderColor: '#B8860B' }}>
                          <Upload size={18} /><span className="text-sm">{photoFile ? photoFile.name : 'Choose Photo'}</span>
                        </label>
                      </div>
                      {photoPreview && <img src={photoPreview} alt="Preview" className="w-20 h-24 object-cover border-2 rounded" style={{ borderColor: '#B8860B' }} />}
                    </div>
                  </div>
                </section>

                {/* Fee Structure */}
                {currentCourseFees && (
                  <section className="p-4 sm:p-6 rounded-xl" style={{ backgroundColor: '#fafaf8', borderColor: '#B8860B', borderWidth: '2px' }}>
                    <h3 className="text-xl font-bold mb-5" style={{ color: '#002147' }}>💰 Fee Structure for {currentCourseFees.name}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border">
                          <thead><tr style={{ backgroundColor: '#B8860B' }}><th className="border p-3 text-left font-bold text-white">Fee Type</th><th className="border p-3 text-right font-bold text-white">Amount</th></tr></thead>
                          <tbody>
                            <tr className="bg-white"><td className="border p-3">Admission Fees</td><td className="border p-3 text-right font-semibold">Rs. {currentCourseFees.admission}</td></tr>
                            <tr className="bg-white"><td className="border p-3">Tuition Fees</td><td className="border p-3 text-right font-semibold">Rs. {currentCourseFees.tuition}</td></tr>
                            <tr className="bg-white"><td className="border p-3">Co-curricular Activities</td><td className="border p-3 text-right font-semibold">Rs. {currentCourseFees.coActivity}</td></tr>
                            <tr className="bg-white"><td className="border p-3">Exam Fees</td><td className="border p-3 text-right font-semibold">Rs. {currentCourseFees.exam}</td></tr>
                            <tr style={{ backgroundColor: '#f0f4f8' }}><td className="border p-3 font-bold">TOTAL FEES</td><td className="border p-3 text-right font-bold text-lg" style={{ color: '#800020' }}>Rs. {currentCourseFees.total}</td></tr>
                          </tbody>
                        </table>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border">
                          <thead><tr style={{ backgroundColor: '#B8860B' }}><th className="border p-3 text-left font-bold text-white">Payment Mode</th><th className="border p-3 text-right font-bold text-white">Amount</th></tr></thead>
                          <tbody>
                            <tr className="bg-white"><td className="border p-3">One Time Payment</td><td className="border p-3 text-right font-semibold">Rs. {currentCourseFees.oneTime}</td></tr>
                            <tr className="bg-white"><td className="border p-3">First Installment</td><td className="border p-3 text-right font-semibold">Rs. {currentCourseFees.inst1}</td></tr>
                            <tr className="bg-white"><td className="border p-3">Second Installment</td><td className="border p-3 text-right font-semibold">Rs. {currentCourseFees.inst2}</td></tr>
                            <tr style={{ backgroundColor: '#f0f4f8' }}><td className="border p-3 text-sm italic">Form Fees (Non-Refundable)</td><td className="border p-3 text-right font-semibold">Rs. 100/-</td></tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div className="mt-4 p-4 rounded" style={{ backgroundColor: '#ffe6e6', borderLeft: '4px solid #800020' }}>
                      <p className="text-sm" style={{ color: '#800020' }}><strong>Note:</strong> Uniform/Books/Exam Fees are not included in the above fees. Admission will be finalized only after submission of all documents & full payment of fees.</p>
                    </div>
                  </section>
                )}

                {/* Personal Information */}
                <section className="p-4 sm:p-6 rounded-xl bg-gray-50 border" style={{ borderColor: '#002147', borderWidth: '1px' }}>
                  <h3 className="text-xl font-bold mb-5 flex items-center gap-2" style={{ color: '#002147' }}><span className="text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: '#800020' }}>2</span>Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block text-sm font-bold mb-2 text-gray-700">First Name *</label><input type="text" {...capitalizeRegister("firstName", { required: "First name is required" })} className="w-full p-3 border-2 rounded-lg uppercase focus:ring-2" style={{ borderColor: '#B8860B' }} placeholder="FIRST NAME" />{errors.firstName && <p className="text-red-600 text-xs mt-1">{errors.firstName.message}</p>}</div>
                    <div><label className="block text-sm font-bold mb-2 text-gray-700">Middle Name</label><input type="text" {...capitalizeRegister("middleName")} className="w-full p-3 border-2 rounded-lg uppercase focus:ring-2" style={{ borderColor: '#B8860B' }} placeholder="MIDDLE NAME" /></div>
                    <div><label className="block text-sm font-bold mb-2 text-gray-700">Last Name *</label><input type="text" {...capitalizeRegister("lastName", { required: "Last name is required" })} className="w-full p-3 border-2 rounded-lg uppercase focus:ring-2" style={{ borderColor: '#B8860B' }} placeholder="LAST NAME" />{errors.lastName && <p className="text-red-600 text-xs mt-1">{errors.lastName.message}</p>}</div>
                    <div><label className="block text-sm font-bold mb-2 text-gray-700">Mother's Name *</label><input type="text" {...capitalizeRegister("motherName", { required: "Mother's name is required" })} className="w-full p-3 border-2 rounded-lg focus:ring-2" style={{ borderColor: '#B8860B' }} placeholder="Mother's Full Name" />{errors.motherName && <p className="text-red-600 text-xs mt-1">{errors.motherName.message}</p>}</div>
                  </div>
                  <div className="mt-6"><label className="block text-sm font-bold mb-2 text-gray-700">Name in Devanagari</label><input type="text" {...capitalizeRegister("nameDevanagari")} className="w-full p-3 border-2 rounded-lg focus:ring-2" style={{ borderColor: '#B8860B' }} placeholder="देवनागरी लिपीत नाव" /></div>
                  <div className="mt-6"><DigitBoxes name="aadhar" count={12} label="Aadhar Number" /></div>
                  <div className="mt-6"><label className="block text-sm font-bold mb-3 text-gray-700">Gender *</label><div className="flex gap-6"><label className="flex items-center gap-2 cursor-pointer"><input type="radio" value="Male" {...register("gender", { required: "Please select gender" })} className="w-5 h-5 cursor-pointer" style={{ accentColor: '#B8860B' }} /><span className="text-gray-800 font-medium">Male</span></label><label className="flex items-center gap-2 cursor-pointer"><input type="radio" value="Female" {...register("gender", { required: "Please select gender" })} className="w-5 h-5 cursor-pointer" style={{ accentColor: '#B8860B' }} /><span className="text-gray-800 font-medium">Female</span></label></div>{errors.gender && <p className="text-red-600 text-xs mt-1">{errors.gender.message}</p>}</div>
                </section>

                {/* Address Information */}
                <section className="p-4 sm:p-6 rounded-xl bg-gray-50 border" style={{ borderColor: '#002147', borderWidth: '1px' }}>
                  <h3 className="text-xl font-bold mb-5 flex items-center gap-2" style={{ color: '#002147' }}><span className="text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: '#800020' }}>3</span>Permanent Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block text-sm font-bold mb-2 text-gray-700">Building Name</label><input type="text" {...capitalizeRegister("buildingName")} className="w-full p-3 border-2 rounded-lg uppercase focus:ring-2" style={{ borderColor: '#B8860B' }} placeholder="BUILDING NAME" /></div>
                    <div><label className="block text-sm font-bold mb-2 text-gray-700">Street Name / Nagar *</label><input type="text" {...capitalizeRegister("streetName", { required: "Street name is required" })} className="w-full p-3 border-2 rounded-lg uppercase focus:ring-2" style={{ borderColor: '#B8860B' }} placeholder="STREET NAME" />{errors.streetName && <p className="text-red-600 text-xs mt-1">{errors.streetName.message}</p>}</div>
                    <div><label className="block text-sm font-bold mb-2 text-gray-700">Village / Tahsil *</label><input type="text" {...capitalizeRegister("village", { required: "Village is required" })} className="w-full p-3 border-2 rounded-lg uppercase focus:ring-2" style={{ borderColor: '#B8860B' }} placeholder="VILLAGE" />{errors.village && <p className="text-red-600 text-xs mt-1">{errors.village.message}</p>}</div>
                    <div><label className="block text-sm font-bold mb-2 text-gray-700">District *</label><input type="text" {...capitalizeRegister("district", { required: "District is required" })} className="w-full p-3 border-2 rounded-lg uppercase focus:ring-2" style={{ borderColor: '#B8860B' }} placeholder="DISTRICT" defaultValue="NASHIK" />{errors.district && <p className="text-red-600 text-xs mt-1">{errors.district.message}</p>}</div>
                    <div><label className="block text-sm font-bold mb-2 text-gray-700">State *</label><input type="text" {...capitalizeRegister("state", { required: "State is required" })} className="w-full p-3 border-2 rounded-lg uppercase focus:ring-2" style={{ borderColor: '#B8860B' }} placeholder="STATE" defaultValue="MAHARASHTRA" />{errors.state && <p className="text-red-600 text-xs mt-1">{errors.state.message}</p>}</div>
                    <div><label className="block text-sm font-bold mb-2 text-gray-700">PIN Code *</label><input type="text" {...register("pinCode", { required: "PIN code is required", pattern: { value: /^\d{6}$/, message: "Enter valid 6-digit PIN" } })} className="w-full p-3 border-2 rounded-lg focus:ring-2" style={{ borderColor: '#B8860B' }} placeholder="422209" maxLength="6" />{errors.pinCode && <p className="text-red-600 text-xs mt-1">{errors.pinCode.message}</p>}</div>
                  </div>
                </section>

                {/* Other Personnel Details */}
                <section className="p-4 sm:p-6 rounded-xl bg-gray-50 border" style={{ borderColor: '#002147', borderWidth: '1px' }}>
                  <h3 className="text-xl font-bold mb-5 flex items-center gap-2" style={{ color: '#002147' }}><span className="text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: '#800020' }}>4</span>Other Personnel Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block text-sm font-bold mb-2 text-gray-700">Date of Birth (DD-MM-YYYY) *</label><div className="flex flex-wrap items-center gap-2"><input type="text" {...register("dobDay", { required: true, pattern: { value: /^\d{2}$/, message: "Day required" } })} className="w-16 sm:w-20 px-3 py-3 border-2 rounded-lg text-center" style={{ borderColor: '#B8860B' }} placeholder="DD" maxLength="2" /><span className="text-2xl">-</span><input type="text" {...register("dobMonth", { required: true, pattern: { value: /^\d{2}$/, message: "Month required" } })} className="w-16 sm:w-20 px-3 py-3 border-2 rounded-lg text-center" style={{ borderColor: '#B8860B' }} placeholder="MM" maxLength="2" /><span className="text-2xl">-</span><input type="text" {...register("dobYear", { required: true, pattern: { value: /^\d{4}$/, message: "Year required" } })} className="w-24 sm:w-28 px-3 py-3 border-2 rounded-lg text-center" style={{ borderColor: '#B8860B' }} placeholder="YYYY" maxLength="4" /></div></div>
                    <div><label className="block text-sm font-bold mb-2 text-gray-700">Category *</label><select {...register("category", { required: "Category is required" })} className="w-full p-3 border-2 rounded-lg focus:ring-2" style={{ borderColor: '#B8860B' }}><option value="">Select Category</option><option value="SC">SC</option><option value="ST">ST</option><option value="NT-A">NT-A</option><option value="NT-B">NT-B</option><option value="NT-C">NT-C</option><option value="NT-D">NT-D</option><option value="OBC">OBC</option><option value="SBC">SBC</option><option value="Open">Open</option></select>{errors.category && <p className="text-red-600 text-xs mt-1">{errors.category.message}</p>}</div>
                    <div><label className="block text-sm font-bold mb-2 text-gray-700">Caste Name</label><input type="text" {...capitalizeRegister("casteName")} className="w-full p-3 border-2 rounded-lg focus:ring-2" style={{ borderColor: '#B8860B' }} placeholder="Caste Name" /></div>
                    <div><label className="block text-sm font-bold mb-2 text-gray-700">Blood Group</label><select {...register("bloodGroup")} className="w-full p-3 border-2 rounded-lg focus:ring-2" style={{ borderColor: '#B8860B' }}><option value="">Select Blood Group</option><option value="A+">A+</option><option value="A-">A-</option><option value="B+">B+</option><option value="B-">B-</option><option value="AB+">AB+</option><option value="AB-">AB-</option><option value="O+">O+</option><option value="O-">O-</option></select></div>
                    <div><label className="block text-sm font-bold mb-3 text-gray-700">Marital Status *</label><div className="flex gap-6"><label className="flex items-center gap-2 cursor-pointer"><input type="radio" value="Married" {...register("maritalStatus", { required: "Marital status is required" })} className="w-5 h-5 cursor-pointer" style={{ accentColor: '#B8860B' }} /><span className="text-gray-800 font-medium">Married</span></label><label className="flex items-center gap-2 cursor-pointer"><input type="radio" value="Unmarried" {...register("maritalStatus", { required: "Marital status is required" })} className="w-5 h-5 cursor-pointer" style={{ accentColor: '#B8860B' }} /><span className="text-gray-800 font-medium">Unmarried</span></label></div>{errors.maritalStatus && <p className="text-red-600 text-xs mt-1">{errors.maritalStatus.message}</p>}</div>
                  </div>
                  <div className="mt-6"><label className="block text-sm font-bold mb-2 text-gray-700">Email *</label><input type="email" {...register("email", { required: "Email is required", pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email" } })} className="w-full p-3 border-2 rounded-lg focus:ring-2" style={{ borderColor: '#B8860B' }} placeholder="your.email@example.com" />{errors.email && <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>}</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div><DigitBoxes name="candidateMobile" count={10} label="Candidate Mobile No." /><div className="flex gap-4 mt-2"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" {...register("candidateWhatsapp")} className="w-5 h-5 cursor-pointer" style={{ accentColor: '#800020' }} /><span className="text-sm">WhatsApp</span></label><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" {...register("candidatePhonePay")} className="w-5 h-5 cursor-pointer" style={{ accentColor: '#800020' }} /><span className="text-sm">Phone Pay</span></label></div></div>
                    <div><DigitBoxes name="parentMobile" count={10} label="Parent Mobile No." /><div className="flex gap-4 mt-2"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" {...register("parentWhatsapp")} className="w-5 h-5 cursor-pointer" style={{ accentColor: '#800020' }} /><span className="text-sm">WhatsApp</span></label><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" {...register("parentPhonePay")} className="w-5 h-5 cursor-pointer" style={{ accentColor: '#800020' }} /><span className="text-sm">Phone Pay</span></label></div></div>
                  </div>
                </section>

                {/* Qualification Details */}
                <section className="p-4 sm:p-6 rounded-xl bg-gray-50 border" style={{ borderColor: '#002147', borderWidth: '1px' }}>
                  <h3 className="text-xl font-bold mb-5 flex items-center gap-2" style={{ color: '#002147' }}><span className="text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: '#800020' }}>5</span>Qualification Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block text-sm font-bold mb-2 text-gray-700">Last Exam Month *</label><input type="text" {...capitalizeRegister("lastExamMonth", { required: "Exam month is required" })} className="w-full p-3 border-2 rounded-lg focus:ring-2" style={{ borderColor: '#B8860B' }} placeholder="April" />{errors.lastExamMonth && <p className="text-red-600 text-xs mt-1">{errors.lastExamMonth.message}</p>}</div>
                    <div><label className="block text-sm font-bold mb-2 text-gray-700">Last Exam Year *</label><input type="text" {...register("lastExamYear", { required: "Exam year is required", pattern: { value: /^\d{4}$/, message: "Enter valid year" } })} className="w-full p-3 border-2 rounded-lg focus:ring-2" style={{ borderColor: '#B8860B' }} placeholder="2024" />{errors.lastExamYear && <p className="text-red-600 text-xs mt-1">{errors.lastExamYear.message}</p>}</div>
                    <div><label className="block text-sm font-bold mb-2 text-gray-700">School/College Name *</label><input type="text" {...capitalizeRegister("lastSchoolCollege", { required: "School/College name is required" })} className="w-full p-3 border-2 rounded-lg focus:ring-2" style={{ borderColor: '#B8860B' }} placeholder="School/College Name" />{errors.lastSchoolCollege && <p className="text-red-600 text-xs mt-1">{errors.lastSchoolCollege.message}</p>}</div>
                    <div><label className="block text-sm font-bold mb-2 text-gray-700">Course Name *</label><input type="text" {...capitalizeRegister("lastCourseName", { required: "Course name is required" })} className="w-full p-3 border-2 rounded-lg focus:ring-2" style={{ borderColor: '#B8860B' }} placeholder="12th Commerce" />{errors.lastCourseName && <p className="text-red-600 text-xs mt-1">{errors.lastCourseName.message}</p>}</div>
                    <div><label className="block text-sm font-bold mb-2 text-gray-700">Percentage %</label><input type="text" {...register("lastPercentage")} className="w-full p-3 border-2 rounded-lg focus:ring-2" style={{ borderColor: '#B8860B' }} placeholder="75.50" /></div>
                    <div><label className="block text-sm font-bold mb-3 text-gray-700">Result</label><div className="flex gap-6"><label className="flex items-center gap-2 cursor-pointer"><input type="radio" value="Pass" {...register("lastResult")} className="w-5 h-5 cursor-pointer" style={{ accentColor: '#B8860B' }} /><span className="text-sm">Pass</span></label><label className="flex items-center gap-2 cursor-pointer"><input type="radio" value="Fail" {...register("lastResult")} className="w-5 h-5 cursor-pointer" style={{ accentColor: '#B8860B' }} /><span className="text-sm">Fail</span></label><label className="flex items-center gap-2 cursor-pointer"><input type="radio" value="ATKT" {...register("lastResult")} className="w-5 h-5 cursor-pointer" style={{ accentColor: '#B8860B' }} /><span className="text-sm">ATKT</span></label></div></div>
                  </div>
                  <div className="mt-6 flex gap-4"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" {...register("applyScholarship")} className="w-5 h-5 cursor-pointer" style={{ accentColor: '#800020' }} /><span className="font-semibold text-gray-800">Apply for Scholarship</span></label></div>
                </section>

                {/* Bank Details */}
                <section className="p-4 sm:p-6 rounded-xl bg-gray-50 border" style={{ borderColor: '#002147', borderWidth: '1px' }}>
                  <h3 className="text-xl font-bold mb-5 flex items-center gap-2" style={{ color: '#002147' }}><span className="text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: '#800020' }}>6</span>Bank Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block text-sm font-bold mb-2 text-gray-700">Account Number *</label><input type="text" {...register("bankAccountNumber", { required: "Account number is required" })} className="w-full p-3 border-2 rounded-lg focus:ring-2" style={{ borderColor: '#B8860B' }} placeholder="Account Number" />{errors.bankAccountNumber && <p className="text-red-600 text-xs mt-1">{errors.bankAccountNumber.message}</p>}</div>
                    <div><label className="block text-sm font-bold mb-2 text-gray-700">IFSC Code *</label><input type="text" {...register("bankIFSC", { required: "IFSC code is required" })} className="w-full p-3 border-2 rounded-lg uppercase focus:ring-2" style={{ borderColor: '#B8860B' }} placeholder="IFSC CODE" />{errors.bankIFSC && <p className="text-red-600 text-xs mt-1">{errors.bankIFSC.message}</p>}</div>
                    <div><label className="block text-sm font-bold mb-2 text-gray-700">Bank Name *</label><input type="text" {...capitalizeRegister("bankName", { required: "Bank name is required" })} className="w-full p-3 border-2 rounded-lg uppercase focus:ring-2" style={{ borderColor: '#B8860B' }} placeholder="BANK NAME" />{errors.bankName && <p className="text-red-600 text-xs mt-1">{errors.bankName.message}</p>}</div>
                    <div><label className="block text-sm font-bold mb-2 text-gray-700">Branch</label><input type="text" {...capitalizeRegister("bankBranch")} className="w-full p-3 border-2 rounded-lg uppercase focus:ring-2" style={{ borderColor: '#B8860B' }} placeholder="BRANCH NAME" /></div>
                  </div>
                </section>

                {/* Parent/Guardian Details */}
                <section className="p-4 sm:p-6 rounded-xl bg-gray-50 border" style={{ borderColor: '#002147', borderWidth: '1px' }}>
                  <h3 className="text-xl font-bold mb-5 flex items-center gap-2" style={{ color: '#002147' }}><span className="text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: '#800020' }}>7</span>Parent/Guardian Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block text-sm font-bold mb-2 text-gray-700">Parent Name *</label><input type="text" {...capitalizeRegister("parentName", { required: "Parent name is required" })} className="w-full p-3 border-2 rounded-lg uppercase focus:ring-2" style={{ borderColor: '#B8860B' }} placeholder="PARENT NAME" />{errors.parentName && <p className="text-red-600 text-xs mt-1">{errors.parentName.message}</p>}</div>
                    <div><label className="block text-sm font-bold mb-2 text-gray-700">Relation with Candidate *</label><input type="text" {...capitalizeRegister("relationWithCandidate", { required: "Relation is required" })} className="w-full p-3 border-2 rounded-lg uppercase focus:ring-2" style={{ borderColor: '#B8860B' }} placeholder="FATHER/MOTHER" />{errors.relationWithCandidate && <p className="text-red-600 text-xs mt-1">{errors.relationWithCandidate.message}</p>}</div>
                    <div className="md:col-span-2"><label className="block text-sm font-bold mb-2 text-gray-700">Parent Address *</label><textarea {...capitalizeRegister("parentAddress", { required: "Address is required" })} className="w-full p-3 border-2 rounded-lg focus:ring-2" style={{ borderColor: '#B8860B' }} rows="3" placeholder="Complete Address" />{errors.parentAddress && <p className="text-red-600 text-xs mt-1">{errors.parentAddress.message}</p>}</div>
                    <div><label className="block text-sm font-bold mb-2 text-gray-700">Occupation *</label><input type="text" {...capitalizeRegister("parentOccupation", { required: "Occupation is required" })} className="w-full p-3 border-2 rounded-lg uppercase focus:ring-2" style={{ borderColor: '#B8860B' }} placeholder="OCCUPATION" />{errors.parentOccupation && <p className="text-red-600 text-xs mt-1">{errors.parentOccupation.message}</p>}</div>
                    <div><label className="block text-sm font-bold mb-2 text-gray-700">Annual Income *</label><input type="text" {...register("parentIncome", { required: "Annual income is required" })} className="w-full p-3 border-2 rounded-lg focus:ring-2" style={{ borderColor: '#B8860B' }} placeholder="Annual Income" />{errors.parentIncome && <p className="text-red-600 text-xs mt-1">{errors.parentIncome.message}</p>}</div>
                  </div>
                </section>

                {/* Declaration Section */}
                <section className="p-4 sm:p-6 rounded-xl border-2" style={{ backgroundColor: '#fef5f5', borderColor: '#800020' }}>
                  <h3 className="text-lg font-bold mb-4 text-center underline" style={{ color: '#800020' }}>DECLARATION & TERMS</h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p className="font-semibold">I hereby declare that:</p>
                    <p>1. I wish to take admission to the selected course. The personal details provided are correct to the best of my knowledge.</p>
                    <p>2. I shall abide by all rules and conditions of the University, College, and parent institution.</p>
                    <p>3. The decisions of the Principal on all college matters will be binding on me.</p>
                    <p>4. All information provided is true and accurate.</p>
                  </div>
                  <div className="mt-6 pt-4" style={{ borderTop: '2px solid #800020' }}>
                    <label className="flex items-start gap-3 cursor-pointer"><input type="checkbox" {...register("declarationAccepted", { required: "You must accept the declaration" })} className="mt-1 w-6 h-6 cursor-pointer" style={{ accentColor: '#B8860B' }} /><span className="font-semibold text-gray-800">I have read and understood all the above declarations and undertakings. I accept all terms and conditions stated above. *</span></label>
                    {errors.declarationAccepted && <p className="text-red-600 text-sm mt-2">{errors.declarationAccepted.message}</p>}
                  </div>
                </section>

                <div className="flex justify-center pt-6">
                  <button type="submit" disabled={isSubmitting} className="text-white text-lg px-12 py-5 rounded-full font-bold shadow-2xl flex items-center gap-3 transition-all" style={{ backgroundColor: '#800020' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#600015'} onMouseLeave={(e) => e.target.style.backgroundColor = '#800020'}> Generate Application PDF</button>
                </div>
              </form>
            ) : (
              <div className="text-center py-16">
                <div className="w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg" style={{ backgroundColor: '#f0f4f8', color: '#800020' }}><CheckCircle size={64} /></div>
                <h2 className="text-4xl font-bold mb-3" style={{ color: '#002147' }}>Application Generated Successfully!</h2>
                <p className="text-lg mb-4" style={{ color: '#002147' }}>Application No: <span className="font-bold" style={{ color: '#B8860B' }}>{formData.appNo}</span></p>
                <p className="text-gray-600 mb-10 max-w-2xl mx-auto">Your admission form for <strong>{getCourseName()}</strong> has been generated successfully. Please download the PDF, print it, affix your photograph, and sign at designated places.</p>
                <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
                  <PDFDownloadLink document={<SeniorAdmissionPDF data={formData} />} fileName={`SVIM_Admission_${formData.lastName}_${formData.firstName}_${formData.appNo}.pdf`} className="flex items-center gap-3 text-white px-10 py-5 rounded-xl font-bold shadow-2xl transition-all transform hover:scale-105" style={{ backgroundColor: '#800020' }}>{({ loading }) => loading ? 'Generating PDF...' : (<> Download Official Application Form</>)}</PDFDownloadLink>
                  <button onClick={resetForm} className="flex items-center gap-3 px-8 py-5 font-semibold border-2 rounded-xl transition-all" style={{ borderColor: '#B8860B', color: '#002147' }}> Fill Another Form</button>
                </div>
                <div className="mt-12 p-6 rounded-xl max-w-2xl mx-auto border-2" style={{ backgroundColor: '#f0f4f8', borderColor: '#002147' }}>
                  <h4 className="font-bold mb-3" style={{ color: '#002147' }}>📋 Next Steps:</h4>
                  <ul className="text-left text-sm text-gray-700 space-y-2">
                    <li>✓ Download and print the application form</li>
                    <li>✓ Affix your recent passport-size photograph in the designated box</li>
                    <li>✓ Sign at the designated places</li>
                    <li>✓ Parent/Guardian should also sign at the designated places</li>
                    <li>✓ Attach all required documents (originals + photocopies)</li>
                    <li>✓ Submit at the college office</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeniorAdmissionForm;