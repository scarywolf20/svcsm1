import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { FileText, Save, Download, CheckCircle, RefreshCcw, Upload } from 'lucide-react';
import JuniorAdmissionPDF from '../../components/PDF/JuniorAdmissionPDF';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import SEO from '../../components/SEO';

const JuniorAdmissionForm = () => {
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting }, reset } = useForm();
  const [formData, setFormData] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const selectedStandard = watch("standard");
  const selectedStream = watch("stream");
  const isHybrid = watch("isHybrid");

  // Real-time percentage calculation
  const sscMarksObtained = watch("sscMarksObtained");
  const sscTotalMarks = watch("sscTotalMarks");
  const hscMarksObtained = watch("hscMarksObtained");
  const hscTotalMarks = watch("hscTotalMarks");

  useEffect(() => {
    if (sscMarksObtained && sscTotalMarks && parseFloat(sscTotalMarks) > 0) {
      const percentage = (parseFloat(sscMarksObtained) / parseFloat(sscTotalMarks)) * 100;
      setValue("sscPercentage", percentage.toFixed(2));
    } else {
      setValue("sscPercentage", "");
    }
  }, [sscMarksObtained, sscTotalMarks, setValue]);

  useEffect(() => {
    if (selectedStandard === "12th" && hscMarksObtained && hscTotalMarks && parseFloat(hscTotalMarks) > 0) {
      const percentage = (parseFloat(hscMarksObtained) / parseFloat(hscTotalMarks)) * 100;
      setValue("hscPercentage", percentage.toFixed(2));
    } else {
      setValue("hscPercentage", "");
    }
  }, [hscMarksObtained, hscTotalMarks, selectedStandard, setValue]);

  const feeStructure = {
    '11thCom': { name: '11th Commerce', admission: 1000, tuition: 14500, coActivity: 3000, exam: 3000, total: 21500, oneTime: 20000, inst1: 11500, inst2: 10000 },
    '12thCom': { name: '12th Commerce', admission: 1000, tuition: 14500, coActivity: 3000, exam: 3000, total: 21500, oneTime: 20000, inst1: 11500, inst2: 10000 },
    '11thSci': { name: '11th Science', admission: 1000, tuition: 25000, coActivity: 6000, exam: 3000, total: 35000, oneTime: 32500, inst1: 20000, inst2: 15000 },
    '12thSci': { name: '12th Science', admission: 1000, tuition: 25000, coActivity: 6000, exam: 3000, total: 35000, oneTime: 32500, inst1: 20000, inst2: 15000 },
    '11thArts': { name: '11th Arts', admission: 1000, tuition: 7000, coActivity: 3000, exam: 1000, total: 12000, oneTime: 11000, inst1: 6000, inst2: 6000 },
    '12thArts': { name: '12th Arts', admission: 1000, tuition: 7000, coActivity: 3000, exam: 1000, total: 12000, oneTime: 11000, inst1: 6000, inst2: 6000 },
    '11thCET': { name: '11th CET Batch', admission: 1000, tuition: 45000, coActivity: 6000, exam: 3000, total: 55000, oneTime: 52500, inst1: 30000, inst2: 25000 },
    '12thCET': { name: '12th CET Batch', admission: 1000, tuition: 45000, coActivity: 6000, exam: 3000, total: 55000, oneTime: 52500, inst1: 30000, inst2: 25000 }
  };

  const hybridFees = {
    'Commerce': { admission: 1000, tuition: 19500, coActivity: 3000, exam: 3000, total: 26500, oneTime: 25000, inst1: 16500, inst2: 10000 },
    'Science': { admission: 1000, tuition: 30000, coActivity: 6000, exam: 3000, total: 40000, oneTime: 37500, inst1: 25000, inst2: 15000 },
    'Arts': { admission: 1000, tuition: 10000, coActivity: 3000, exam: 1000, total: 15000, oneTime: 14000, inst1: 8000, inst2: 7000 }
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

  const onInvalid = (invalidErrors) => {
    const firstField = Object.keys(invalidErrors || {})[0];
    if (!firstField) return;
    const el = document.querySelector(`[name="${CSS.escape(firstField)}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (typeof el.focus === 'function') el.focus();
    }
  };

  const getSelectedCourseFees = () => {
    if (selectedStandard && selectedStream) {
      if (isHybrid && selectedStream !== 'CET') {
        const fees = hybridFees[selectedStream];
        if (fees) return { ...fees, name: `${selectedStandard} ${selectedStream} (Hybrid)` };
      }
      const courseKey = `${selectedStandard}${selectedStream === 'Science' ? 'Sci' : selectedStream === 'Commerce' ? 'Com' : selectedStream === 'Arts' ? 'Arts' : 'CET'}`;
      return feeStructure[courseKey];
    }
    return null;
  };

  const currentCourseFees = getSelectedCourseFees();

  const onSubmit = async (data) => {
    const joinDigits = (prefix, count) => {
      let out = '';
      for (let i = 0; i < count; i++) out += data[`${prefix}${i}`] ?? '';
      return out;
    };

    const digitFieldSpecs = [
      { prefix: 'aadhar', count: 12 },
      { prefix: 'parentMobile', count: 10 },
      { prefix: 'candidateMobile', count: 10 },
      { prefix: 'birthDate', count: 2 },
      { prefix: 'birthMonth', count: 2 },
      { prefix: 'birthYear', count: 4 },
      { prefix: 'dobDay', count: 2 },
      { prefix: 'dobMonth', count: 2 },
      { prefix: 'dobYear', count: 4 },
      { prefix: 'ageYears', count: 2 },
      { prefix: 'ageMonths', count: 2 },
      { prefix: 'ageDays', count: 2 },
    ];

    const appNo = `SV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    data.appNo = appNo;

    if (photoPreview) data.photoData = photoPreview;

    if (selectedStream === 'Science') {
      data.streamScience = true; data.streamCommerce = false; data.streamArts = false; data.streamCET = false;
    } else if (selectedStream === 'Commerce') {
      data.streamCommerce = true; data.streamScience = false; data.streamArts = false; data.streamCET = false;
    } else if (selectedStream === 'Arts') {
      data.streamArts = true; data.streamCommerce = false; data.streamScience = false; data.streamCET = false;
    } else if (selectedStream === 'CET') {
      data.streamCET = true; data.streamArts = false; data.streamCommerce = false; data.streamScience = false;
    }

    const combinedFields = {
      aadhar: joinDigits('aadhar', 12),
      parentMobile: joinDigits('parentMobile', 10),
      candidateMobile: joinDigits('candidateMobile', 10),
      birthDate: joinDigits('birthDate', 2),
      birthMonth: joinDigits('birthMonth', 2),
      birthYear: joinDigits('birthYear', 4),
      birthDateString: `${joinDigits('birthDate', 2)}/${joinDigits('birthMonth', 2)}/${joinDigits('birthYear', 4)}`,
      dobDay: joinDigits('dobDay', 2),
      dobMonth: joinDigits('dobMonth', 2),
      dobYear: joinDigits('dobYear', 4),
      dobString: `${joinDigits('dobDay', 2)}/${joinDigits('dobMonth', 2)}/${joinDigits('dobYear', 4)}`,
      ageYears: joinDigits('ageYears', 2),
      ageMonths: joinDigits('ageMonths', 2),
      ageDays: joinDigits('ageDays', 2),
      ageString: `${joinDigits('ageYears', 2)}Y ${joinDigits('ageMonths', 2)}M ${joinDigits('ageDays', 2)}D`,
    };

    const payload = {
      ...data,
      ...combinedFields,
      appNo,
      formType: 'junior',
      status: 'Pending',
      createdAt: serverTimestamp(),
      isHybrid: !!data.isHybrid
    };

    delete payload.photoData;
    for (const spec of digitFieldSpecs) {
      for (let i = 0; i < spec.count; i++) delete payload[`${spec.prefix}${i}`];
    }

    try {
      const docRef = await addDoc(collection(db, 'juniorAdmissions'), payload);
      await addDoc(collection(db, 'notifications'), {
        type: 'junior_admission',
        title: 'New Junior Admission',
        message: `${data.surname || ''} ${data.middleName || ''} - ${data.standard} ${data.stream}${data.isHybrid ? ' (Hybrid)' : ''}`,
        createdAt: serverTimestamp(),
        read: false,
        link: '/admin/junior-admissions'
      });

      data.submissionId = docRef.id;
      setFormData(data);
      setIsSubmitted(true);
      // Scroll to top on successful submission
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
    setValue("surname", "Sharma");
    setValue("fathersName", "Rajesh");
    setValue("mothersName", "Priya");
    setValue("middleName", "Amit");
    setValue("nameDevanagari", "अमित कुमार शर्मा");
    setValue("placeOfBirth", "Nashik");
    setValue("gender", "Male");
    setValue("religion", "Hindu");
    setValue("caste", "Open");
    setValue("subCaste", "N/A");
    setValue("motherTongue", "Marathi");
    setValue("nationality", "Indian");

    // DOB digits
    const dobDigits = ['1','5']; for(let i=0;i<2;i++) setValue(`dobDay${i}`, dobDigits[i]);
    const mobDigits = ['0','6']; for(let i=0;i<2;i++) setValue(`dobMonth${i}`, mobDigits[i]);
    const yearDigits = ['2','0','0','8']; for(let i=0;i<4;i++) setValue(`dobYear${i}`, yearDigits[i]);

    const ageY = ['1','7']; for(let i=0;i<2;i++) setValue(`ageYears${i}`, ageY[i]);
    const ageM = ['0','6']; for(let i=0;i<2;i++) setValue(`ageMonths${i}`, ageM[i]);
    const ageD = ['1','5']; for(let i=0;i<2;i++) setValue(`ageDays${i}`, ageD[i]);

    setValue("bloodGroup", "O+");

    const aadharDigits = '123456789012'.split('');
    for(let i=0;i<12;i++) setValue(`aadhar${i}`, aadharDigits[i]);

    const parentMob = '9876543210'.split('');
    for(let i=0;i<10;i++) setValue(`parentMobile${i}`, parentMob[i]);
    const candMob = '8765432109'.split('');
    for(let i=0;i<10;i++) setValue(`candidateMobile${i}`, candMob[i]);

    setValue("permanentAddress", "123, Shivaji Nagar, Near Main Market, Pimpalgaon Baswant, Nashik - 422209");
    setValue("correspondenceAddress", "123, Shivaji Nagar, Near Main Market, Pimpalgaon Baswant, Nashik - 422209");

    setValue("standard", "11th");
    setValue("stream", "Commerce");
    setValue("boardStateBoard", true);

    setValue("sscStream", "General");
    setValue("sscYear", "2024");
    setValue("sscMarksObtained", "450");
    setValue("sscTotalMarks", "600");
    setValue("sscBoard", "Maharashtra State Board");

    setValue("fullNameFather", "Rajesh Sharma");
    setValue("occupation", "Business");
    setValue("officeAddress", "Market Area, Nashik");
    setValue("guardianName", "");
    setValue("guardianRelation", "");

    const bDate = ['1','5']; for(let i=0;i<2;i++) setValue(`birthDate${i}`, bDate[i]);
    const bMonth = ['0','6']; for(let i=0;i<2;i++) setValue(`birthMonth${i}`, bMonth[i]);
    const bYear = ['2','0','0','8']; for(let i=0;i<4;i++) setValue(`birthYear${i}`, bYear[i]);

    setValue("birthPlace", "Nashik");
    setValue("birthState", "Maharashtra");

    setValue("docLeavingCert", true);
    setValue("docMigration", false);
    setValue("docMarksheet", true);
    setValue("docAadhar", true);

    setValue("declarationAccepted", true);
    setValue("email", "student@example.com");
  };

  // Enhanced DigitBoxes with backspace navigation
  const DigitBoxes = ({ name, count, label }) => {
    return (
      <div>
        <label className="block text-sm font-bold mb-2 text-gray-700">{label} *</label>
        <div className="flex flex-wrap gap-2">
          {[...Array(count)].map((_, i) => (
            <input
              key={i}
              type="text"
              maxLength="1"
              {...register(`${name}${i}`, {
                required: `${label} digit ${i+1} required`,
                pattern: { value: /^[0-9]$/, message: "Only digits" }
              })}
              className="w-8 h-10 sm:w-10 sm:h-12 text-center border-2 rounded-lg text-base sm:text-lg font-bold focus:ring-2"
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

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6" style={{ backgroundColor: '#f8f7f3' }}>
      <SEO
        title="Junior College Admission Form"
        description="Apply for 11th and 12th standard admission at Swami Vivekananda Junior College. Science and Commerce streams available."
        keywords="admission form, junior college admission, 11th admission, 12th admission, online application"
        url="/admissions/junior-form"
      />
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden" style={{ borderColor: '#002147', borderWidth: '3px' }}>
          {/* Header Strip */}
          <div className="px-4 sm:px-6 md:px-8 py-5 flex flex-col md:flex-row md:justify-between md:items-center gap-4 text-white" style={{ backgroundColor: '#800020' }}>
            <div className="flex items-center gap-3">
              <FileText size={28} />
              <div>
                <span className="font-bold text-xl">Junior College Admission Form</span>
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
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold mb-3 text-gray-700">Standard *</label>
                      <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 md:gap-12">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input type="radio" value="11th" {...register("standard", { required: "Please select a standard" })} className="w-6 h-6 cursor-pointer" style={{ accentColor: '#B8860B' }} />
                          <span className="text-gray-800 font-bold text-lg">11th Standard</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input type="radio" value="12th" {...register("standard", { required: "Please select a standard" })} className="w-6 h-6 cursor-pointer" style={{ accentColor: '#B8860B' }} />
                          <span className="text-gray-800 font-bold text-lg">12th Standard</span>
                        </label>
                      </div>
                      {errors.standard && <p className="text-red-600 text-xs mt-2">{errors.standard.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-3 text-gray-700">Stream/Subject *</label>
                      <div className="flex flex-wrap gap-8 md:gap-12">
                        {["Science","Commerce","Arts","CET"].map(stream => (
                          <label key={stream} className="flex items-center gap-3 cursor-pointer">
                            <input type="radio" value={stream} {...register("stream", { required: "Please select a stream" })} className="w-6 h-6 cursor-pointer" style={{ accentColor: '#B8860B' }} />
                            <span className="text-gray-800 font-bold text-lg">{stream}{stream==="CET"?" Batch":""}</span>
                          </label>
                        ))}
                      </div>
                      {errors.stream && <p className="text-red-600 text-xs mt-2">{errors.stream.message}</p>}
                    </div>

                    <div>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" {...register("boardStateBoard")} className="w-5 h-5 cursor-pointer" style={{ accentColor: '#B8860B' }} defaultChecked />
                        <span className="text-gray-800 font-medium">State Board (HSC)</span>
                      </label>
                    </div>

                    {selectedStream !== 'CET' && (
                      <div>
                        <label className="flex items-center gap-2 cursor-pointer p-4 rounded-lg bg-orange-50 border-2" style={{ borderColor: '#B8860B' }}>
                          <input type="checkbox" {...register("isHybrid")} className="w-6 h-6 cursor-pointer" style={{ accentColor: '#B8860B' }} />
                          <div>
                            <span className="font-bold text-gray-800 text-lg">Apply for Hybrid Mode</span>
                            <p className="text-sm text-gray-600">Students can only visit institute for exams. Fees structure is different for hybrid mode.</p>
                          </div>
                        </label>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-bold mb-2 text-gray-700">Upload Photo</label>
                      <div className="flex gap-4 items-center">
                        <div className="relative">
                          <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" id="photo-upload" />
                          <label htmlFor="photo-upload" className="flex items-center justify-center gap-2 p-3 border-2 border-dashed rounded-lg bg-white hover:bg-gray-50 cursor-pointer transition-all" style={{ borderColor: '#B8860B' }}>
                            <Upload size={18} /><span className="text-sm">{photoFile ? photoFile.name : 'Choose Photo'}</span>
                          </label>
                        </div>
                        {photoPreview && <img src={photoPreview} alt="Preview" className="w-20 h-24 object-cover border-2 rounded" style={{ borderColor: '#B8860B' }} />}
                      </div>
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

                {/* Personal Information with capitalization */}
                <section className="p-4 sm:p-6 rounded-xl bg-gray-50 border" style={{ borderColor: '#002147', borderWidth: '1px' }}>
                  <h3 className="text-xl font-bold mb-5 flex items-center gap-2" style={{ color: '#002147' }}><span className="text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: '#800020' }}>2</span>Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div><label className="block text-sm font-bold mb-2 text-gray-700">Surname *</label><input type="text" {...capitalizeRegister("surname", { required: "Surname is required" })} className="w-full p-3 border-2 rounded-lg uppercase focus:ring-2" style={{ borderColor: '#B8860B' }} placeholder="SURNAME" />{errors.surname && <p className="text-red-600 text-xs mt-1">{errors.surname.message}</p>}</div>
                    <div><label className="block text-sm font-bold mb-2 text-gray-700">First Name *</label><input type="text" {...capitalizeRegister("middleName", { required: "First name is required" })} className="w-full p-3 border-2 rounded-lg uppercase focus:ring-2" style={{ borderColor: '#B8860B' }} placeholder="FIRST NAME" />{errors.middleName && <p className="text-red-600 text-xs mt-1">{errors.middleName.message}</p>}</div>
                    <div><label className="block text-sm font-bold mb-2 text-gray-700">Father's Name *</label><input type="text" {...capitalizeRegister("fathersName", { required: "Father's name is required" })} className="w-full p-3 border-2 rounded-lg uppercase focus:ring-2" style={{ borderColor: '#B8860B' }} placeholder="FATHER'S NAME" />{errors.fathersName && <p className="text-red-600 text-xs mt-1">{errors.fathersName.message}</p>}</div>
                  </div>
                  <div className="mt-6"><label className="block text-sm font-bold mb-2 text-gray-700">Name in Devanagari (नाव देवनागरी लिपीत)</label><input type="text" {...register("nameDevanagari")} className="w-full p-3 border-2 rounded-lg focus:ring-2" style={{ borderColor: '#B8860B' }} placeholder="देवनागरी लिपीत नाव" /></div>
                  <div className="mt-6"><label className="block text-sm font-bold mb-2 text-gray-700">Mother's Name *</label><input type="text" {...capitalizeRegister("motherName", { required: "Mother's name is required" })} className="w-full p-3 border-2 rounded-lg focus:ring-2" style={{ borderColor: '#B8860B' }} placeholder="Mother's Full Name" />{errors.motherName && <p className="text-red-600 text-xs mt-1">{errors.motherName.message}</p>}</div>
                  <div className="mt-6"><label className="block text-sm font-bold mb-3 text-gray-700">Gender *</label><div className="flex gap-6"><label className="flex items-center gap-2 cursor-pointer"><input type="radio" value="Male" {...register("gender", { required: "Please select gender" })} className="w-5 h-5 cursor-pointer" style={{ accentColor: '#B8860B' }} /><span className="text-gray-800 font-medium">Male</span></label><label className="flex items-center gap-2 cursor-pointer"><input type="radio" value="Female" {...register("gender", { required: "Please select gender" })} className="w-5 h-5 cursor-pointer" style={{ accentColor: '#B8860B' }} /><span className="text-gray-800 font-medium">Female</span></label></div>{errors.gender && <p className="text-red-600 text-xs mt-1">{errors.gender.message}</p>}</div>
                </section>

                {/* Father & Guardian Information */}
                <section className="p-4 sm:p-6 rounded-xl bg-gray-50 border" style={{ borderColor: '#002147', borderWidth: '1px' }}>
                  <h3 className="text-xl font-bold mb-5 flex items-center gap-2" style={{ color: '#002147' }}><span className="text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: '#800020' }}>3</span>Father & Guardian Information</h3>
                  <div className="space-y-6">
                    <div><label className="block text-sm font-bold mb-2 text-gray-700">Full Name of Father *</label><input type="text" {...capitalizeRegister("fullNameFather", { required: "Father's full name is required" })} className="w-full p-3 border-2 rounded-lg focus:ring-2" style={{ borderColor: '#B8860B' }} placeholder="Father's Full Name" />{errors.fullNameFather && <p className="text-red-600 text-xs mt-1">{errors.fullNameFather.message}</p>}</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div><label className="block text-sm font-bold mb-2 text-gray-700">Occupation & Designation</label><input type="text" {...capitalizeRegister("occupation")} className="w-full p-3 border-2 rounded-lg focus:ring-2" style={{ borderColor: '#B8860B' }} placeholder="Occupation & Designation" /></div><div><label className="block text-sm font-bold mb-2 text-gray-700">Office Address</label><input type="text" {...capitalizeRegister("officeAddress")} className="w-full p-3 border-2 rounded-lg focus:ring-2" style={{ borderColor: '#B8860B' }} placeholder="Office Address" /></div></div>
                    <div><label className="block text-sm font-bold mb-2 text-gray-700">Full Name of Guardian (For non-localities)</label><input type="text" {...capitalizeRegister("guardianName")} className="w-full p-3 border-2 rounded-lg focus:ring-2" style={{ borderColor: '#B8860B' }} placeholder="Guardian's Full Name" /></div>
                    <div><label className="block text-sm font-bold mb-2 text-gray-700">Relationship of Guardian with Candidate</label><input type="text" {...capitalizeRegister("guardianRelation")} className="w-full p-3 border-2 rounded-lg focus:ring-2" style={{ borderColor: '#B8860B' }} placeholder="e.g., Uncle, Aunt, Brother" /></div>
                  </div>
                </section>

                {/* Address & Contact */}
                <section className="p-4 sm:p-6 rounded-xl bg-gray-50 border" style={{ borderColor: '#002147', borderWidth: '1px' }}>
                  <h3 className="text-xl font-bold mb-5 flex items-center gap-2" style={{ color: '#002147' }}><span className="text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: '#800020' }}>4</span>Address & Contact Information</h3>
                  <div className="space-y-6">
                    <div><label className="block text-sm font-bold mb-2 text-gray-700">Permanent Address *</label><textarea {...register("permanentAddress", { required: "Permanent address is required" })} rows="3" className="w-full p-3 border-2 rounded-lg focus:ring-2" style={{ borderColor: '#B8860B' }} placeholder="Complete Address with Village/City, Taluka, District, State, PIN" />{errors.permanentAddress && <p className="text-red-600 text-xs mt-1">{errors.permanentAddress.message}</p>}</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><DigitBoxes name="parentMobile" count={10} label="Parent/Guardian Mobile No." /><DigitBoxes name="candidateMobile" count={10} label="Candidate Mobile No." /></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div><label className="block text-sm font-bold mb-2 text-gray-700">Telephone No. (With STD Code)</label><input type="text" {...register("telephone")} className="w-full p-3 border-2 rounded-lg focus:ring-2" style={{ borderColor: '#B8860B' }} placeholder="STD-Telephone" /></div><div><label className="block text-sm font-bold mb-2 text-gray-700">E-Mail ID *</label><input type="email" {...register("email", { required: "Email is required", pattern: { value: /^\S+@\S+$/i, message: "Invalid email address" } })} className="w-full p-3 border-2 rounded-lg focus:ring-2" style={{ borderColor: '#B8860B' }} placeholder="email@example.com" />{errors.email && <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>}</div></div>
                    <div><label className="block text-sm font-bold mb-2 text-gray-700">Full Address of Correspondence</label><textarea {...register("correspondenceAddress")} rows="2" className="w-full p-3 border-2 rounded-lg focus:ring-2" style={{ borderColor: '#B8860B' }} placeholder="Correspondence Address (if different from permanent address)" /></div>
                  </div>
                </section>

                {/* Birth Details */}
                <section className="p-4 sm:p-6 rounded-xl bg-gray-50 border" style={{ borderColor: '#002147', borderWidth: '1px' }}>
                  <h3 className="text-xl font-bold mb-5 flex items-center gap-2" style={{ color: '#002147' }}><span className="text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: '#800020' }}>5</span>Birth Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6"><DigitBoxes name="birthDate" count={2} label="Date" /><DigitBoxes name="birthMonth" count={2} label="Month" /><DigitBoxes name="birthYear" count={4} label="Year" /></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6"><div><label className="block text-sm font-bold mb-2 text-gray-700">Place of Birth *</label><input type="text" {...capitalizeRegister("birthPlace", { required: "Place of birth is required" })} className="w-full p-3 border-2 rounded-lg focus:ring-2" style={{ borderColor: '#B8860B' }} placeholder="City/Village" />{errors.birthPlace && <p className="text-red-600 text-xs mt-1">{errors.birthPlace.message}</p>}</div><div><label className="block text-sm font-bold mb-2 text-gray-700">State *</label><input type="text" {...capitalizeRegister("birthState", { required: "State is required" })} className="w-full p-3 border-2 rounded-lg focus:ring-2" style={{ borderColor: '#B8860B' }} placeholder="State" />{errors.birthState && <p className="text-red-600 text-xs mt-1">{errors.birthState.message}</p>}</div></div>
                </section>

                {/* Caste Category */}
                <section className="p-4 sm:p-6 rounded-xl bg-gray-50 border" style={{ borderColor: '#002147', borderWidth: '1px' }}>
                  <h3 className="text-xl font-bold mb-5 flex items-center gap-2" style={{ color: '#002147' }}><span className="text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: '#800020' }}>6</span>Caste Category</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {["SC","ST","DT-VJ","NT-B","NT-C","NT-D","OBC","SBC","OPEN","General"].map(cat => <label key={cat} className="flex items-center gap-2 cursor-pointer"><input type="radio" value={cat} {...register("caste")} className="w-5 h-5 cursor-pointer" style={{ accentColor: '#B8860B' }} /><span className="text-gray-800 font-medium">{cat}</span></label>)}
                  </div>
                </section>

                {/* Previous Year Academic Details with auto percentage */}
                <section className="p-4 sm:p-6 rounded-xl bg-gray-50 border" style={{ borderColor: '#002147', borderWidth: '1px' }}>
                  <h3 className="text-xl font-bold mb-5 flex items-center gap-2" style={{ color: '#002147' }}><span className="text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: '#800020' }}>7</span>Previous Year Academic Details</h3>
                  <div className="mb-6">
                    <h4 className="font-bold text-gray-800 mb-3">Standard X (10th) Details *</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div><label className="block text-sm font-bold mb-2 text-gray-700">Stream</label><select {...register("sscStream")} className="w-full p-3 border-2 rounded-lg" style={{ borderColor: '#B8860B' }}><option value="">Select</option><option value="Science">Science</option><option value="Commerce">Commerce</option><option value="General">General</option></select></div>
                      <div><label className="block text-sm font-bold mb-2 text-gray-700">Year of Passing *</label><input type="text" {...register("sscYear", { required: "Year is required", pattern: { value: /^\d{4}$/, message: "Enter valid year" } })} className="w-full p-3 border-2 rounded-lg" style={{ borderColor: '#B8860B' }} placeholder="YYYY" />{errors.sscYear && <p className="text-red-600 text-xs mt-1">{errors.sscYear.message}</p>}</div>
                      <div><label className="block text-sm font-bold mb-2 text-gray-700">Marks Obtained *</label><input type="number" {...register("sscMarksObtained", { required: "Marks required", valueAsNumber: true, min: 0 })} className="w-full p-3 border-2 rounded-lg" style={{ borderColor: '#B8860B' }} placeholder="e.g., 450" />{errors.sscMarksObtained && <p className="text-red-600 text-xs mt-1">{errors.sscMarksObtained.message}</p>}</div>
                      <div><label className="block text-sm font-bold mb-2 text-gray-700">Total Marks *</label><input type="number" {...register("sscTotalMarks", { required: "Total marks required", valueAsNumber: true, min: 1 })} className="w-full p-3 border-2 rounded-lg" style={{ borderColor: '#B8860B' }} placeholder="e.g., 600" />{errors.sscTotalMarks && <p className="text-red-600 text-xs mt-1">{errors.sscTotalMarks.message}</p>}</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div><label className="block text-sm font-bold mb-2 text-gray-700">Percentage *</label><input type="text" {...register("sscPercentage", { required: "Percentage will auto-calculate" })} className="w-full p-3 border-2 rounded-lg bg-gray-100" style={{ borderColor: '#B8860B' }} readOnly placeholder="Auto-calculated" /></div>
                      <div><label className="block text-sm font-bold mb-2 text-gray-700">Board *</label><input type="text" {...capitalizeRegister("sscBoard", { required: "Board required" })} className="w-full p-3 border-2 rounded-lg" style={{ borderColor: '#B8860B' }} placeholder="e.g., Maharashtra State Board" />{errors.sscBoard && <p className="text-red-600 text-xs mt-1">{errors.sscBoard.message}</p>}</div>
                    </div>
                  </div>
                  {selectedStandard === "12th" && (
                    <div>
                      <h4 className="font-bold text-gray-800 mb-3">Standard XI (11th) Details *</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div><label className="block text-sm font-bold mb-2 text-gray-700">Stream</label><select {...register("hscStream")} className="w-full p-3 border-2 rounded-lg" style={{ borderColor: '#B8860B' }}><option value="">Select</option><option value="Science">Science</option><option value="Commerce">Commerce</option></select></div>
                        <div><label className="block text-sm font-bold mb-2 text-gray-700">Year of Passing *</label><input type="text" {...register("hscYear", { required: selectedStandard === "12th" ? "Year required" : false, pattern: { value: /^\d{4}$/, message: "Valid year" } })} className="w-full p-3 border-2 rounded-lg" style={{ borderColor: '#B8860B' }} placeholder="YYYY" />{errors.hscYear && <p className="text-red-600 text-xs mt-1">{errors.hscYear.message}</p>}</div>
                        <div><label className="block text-sm font-bold mb-2 text-gray-700">Marks Obtained *</label><input type="number" {...register("hscMarksObtained", { required: selectedStandard === "12th" ? "Marks required" : false, valueAsNumber: true, min: 0 })} className="w-full p-3 border-2 rounded-lg" style={{ borderColor: '#B8860B' }} placeholder="e.g., 450" />{errors.hscMarksObtained && <p className="text-red-600 text-xs mt-1">{errors.hscMarksObtained.message}</p>}</div>
                        <div><label className="block text-sm font-bold mb-2 text-gray-700">Total Marks *</label><input type="number" {...register("hscTotalMarks", { required: selectedStandard === "12th" ? "Total marks required" : false, valueAsNumber: true, min: 1 })} className="w-full p-3 border-2 rounded-lg" style={{ borderColor: '#B8860B' }} placeholder="e.g., 600" />{errors.hscTotalMarks && <p className="text-red-600 text-xs mt-1">{errors.hscTotalMarks.message}</p>}</div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div><label className="block text-sm font-bold mb-2 text-gray-700">Percentage *</label><input type="text" {...register("hscPercentage")} className="w-full p-3 border-2 rounded-lg bg-gray-100" style={{ borderColor: '#B8860B' }} readOnly placeholder="Auto-calculated" /></div>
                        <div><label className="block text-sm font-bold mb-2 text-gray-700">Board *</label><input type="text" {...capitalizeRegister("hscBoard", { required: selectedStandard === "12th" ? "Board required" : false })} className="w-full p-3 border-2 rounded-lg" style={{ borderColor: '#B8860B' }} placeholder="e.g., Maharashtra State Board" />{errors.hscBoard && <p className="text-red-600 text-xs mt-1">{errors.hscBoard.message}</p>}</div>
                      </div>
                    </div>
                  )}
                </section>

                {/* Documents Required */}
                <section className="p-4 sm:p-6 rounded-xl border-2" style={{ backgroundColor: '#faf6f0', borderColor: '#B8860B' }}>
                  <h3 className="text-lg font-bold mb-4" style={{ color: '#800020' }}>📄 Documents Required at Time of Admission</h3>
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer"><input type="checkbox" {...register("docLeavingCert")} className="mt-1 w-5 h-5 cursor-pointer" style={{ accentColor: '#B8860B' }} /><span className="text-sm text-gray-700"><strong>1.</strong> School/College Leaving Certificate (Duly counter-signed by Principal/College Authorities) - Original + 2 Xerox Copies</span></label>
                    <label className="flex items-start gap-3 cursor-pointer"><input type="checkbox" {...register("docMigration")} className="mt-1 w-5 h-5 cursor-pointer" style={{ accentColor: '#B8860B' }} /><span className="text-sm text-gray-700"><strong>2.</strong> Migration Certificate (If necessary) - Original + 2 Xerox Copies</span></label>
                    <label className="flex items-start gap-3 cursor-pointer"><input type="checkbox" {...register("docMarksheet")} className="mt-1 w-5 h-5 cursor-pointer" style={{ accentColor: '#B8860B' }} /><span className="text-sm text-gray-700"><strong>3.</strong> Previous Year Marksheet (SSC/11th) - Original + 2 Xerox Copies</span></label>
                    <label className="flex items-start gap-3 cursor-pointer"><input type="checkbox" {...register("docAadhar")} className="mt-1 w-5 h-5 cursor-pointer" style={{ accentColor: '#B8860B' }} /><span className="text-sm text-gray-700"><strong>4.</strong> Aadhar Card - Original + 2 Xerox Copies</span></label>
                  </div>
                  <div className="mt-5 pt-4" style={{ borderTop: '2px solid #B8860B' }}><p className="text-xs text-gray-600 italic">I hereby agree that, I have attached copies of only mentioned documents to my application and understand that my application will be approved on the basis of above documents.</p></div>
                </section>

                {/* Declaration */}
                <section className="p-4 sm:p-6 rounded-xl border-2" style={{ backgroundColor: '#fef5f5', borderColor: '#800020' }}>
                  <h3 className="text-lg font-bold mb-4 text-center underline" style={{ color: '#800020' }}>DECLARATION TO BE SIGNED BY THE CANDIDATE & PARENT/GUARDIAN AT THE TIME OF ADMISSION</h3>
                  <div className="space-y-2 text-sm text-gray-700 max-h-80 overflow-y-auto pr-2">
                    <p className="font-semibold">I hereby declare and agree that:</p>
                    <ol className="list-decimal list-inside space-y-2 leading-relaxed">
                      <li>I have read the Rules of Admission for the year 2026-27 and I have consulted my father/guardian and after understanding these rules, I have filled in the application form.</li>
                      <li>The information given by me in this application is true to the best of my knowledge.</li>
                      <li>I have not been debarred from appearing at any examination held by any Government or Statutory examination authority in India.</li>
                      <li>I fully understand that I will be offered admission strictly on the basis of my merit and availability of seat.</li>
                      <li>I hereby abide by all the Rules, Acts and Laws enforced by Government/College Principal/College Authorities of the Institute from time to time.</li>
                      <li>The Institute will deal strictly with students who organize, assist or lead in strikes or any way found guilty of serious breach of discipline.</li>
                      <li>I fully understand that the Principal/Management of the college will have full right to expel me from College for infringement of rules.</li>
                      <li>I know that my ward will not be permitted to appear for examination if not meeting requirements.</li>
                      <li>I have noted that it may not be possible for the college authorities to inform me about progress regularly.</li>
                      <li>I am aware that if my ward desires to leave the college, I shall inform the college authorities in writing.</li>
                      <li>I hold myself responsible for full payment of fees at the time of admission.</li>
                      <li>I am aware that use of mobile phones is prohibited during academic activities.</li>
                      <li>The student should carry identity card regularly.</li>
                      <li><strong>About Fees Submission:</strong> (Uniform/Books/Exam Fees are not Included)</li>
                    </ol>
                  </div>
                  <div className="mt-6 pt-4" style={{ borderTop: '2px solid #800020' }}>
                    <label className="flex items-start gap-3 cursor-pointer"><input type="checkbox" {...register("declarationAccepted", { required: "You must accept the declaration" })} className="mt-1 w-6 h-6 cursor-pointer" style={{ accentColor: '#B8860B' }} /><span className="font-semibold text-gray-800">I have read and understood all the above declarations and undertakings. I accept all terms and conditions stated above. *</span></label>
                    {errors.declarationAccepted && <p className="text-red-600 text-sm mt-2">{errors.declarationAccepted.message}</p>}
                  </div>
                </section>

                <div className="flex justify-center pt-6">
                  <button type="submit" disabled={isSubmitting} className="text-white text-lg px-12 py-5 rounded-full font-bold shadow-2xl flex items-center gap-3 transition-all" style={{ backgroundColor: '#800020' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#600015'} onMouseLeave={(e) => e.target.style.backgroundColor = '#800020'}><Save size={24} /> Generate Application PDF</button>
                </div>
              </form>
            ) : (
              <div className="text-center py-16">
                <div className="w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg" style={{ backgroundColor: '#f0f4f8', color: '#800020' }}><CheckCircle size={64} /></div>
                <h2 className="text-4xl font-bold mb-3" style={{ color: '#002147' }}>Application Generated Successfully!</h2>
                <p className="text-lg mb-4" style={{ color: '#002147' }}>Application No: <span className="font-bold" style={{ color: '#B8860B' }}>{formData.appNo}</span></p>
                <p className="text-gray-600 mb-10 max-w-2xl mx-auto">Your admission form for <strong>{formData.standard} {formData.stream}</strong> has been generated successfully. Please download the PDF, print it, affix your photograph, and sign at designated places.</p>
                <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
                  <PDFDownloadLink document={<JuniorAdmissionPDF data={formData} />} fileName={`SV_Admission_${formData.surname}_${formData.fathersName}_${formData.appNo}.pdf`} className="flex items-center gap-3 text-white px-10 py-5 rounded-xl font-bold shadow-2xl transition-all transform hover:scale-105" style={{ backgroundColor: '#800020' }}>{({ loading }) => loading ? 'Generating PDF...' : (<><Download size={24} /> Download Official Application Form</>)}</PDFDownloadLink>
                  <button onClick={resetForm} className="flex items-center gap-3 px-8 py-5 font-semibold border-2 rounded-xl transition-all" style={{ borderColor: '#B8860B', color: '#002147' }}><RefreshCcw size={20} /> Fill Another Form</button>
                </div>
                <div className="mt-12 p-6 rounded-xl max-w-2xl mx-auto border-2" style={{ backgroundColor: '#f0f4f8', borderColor: '#002147' }}>
                  <h4 className="font-bold mb-3" style={{ color: '#002147' }}>Next Steps:</h4>
                  <ul className="text-left text-sm text-gray-700 space-y-2">
                    <li>✓ Download and print the application form</li>
                    <li>✓ Affix your recent passport-size photograph in the designated box</li>
                    <li>✓ Sign at the designated places (Date and signature to be filled after printing)</li>
                    <li>✓ Parent/Guardian should also sign at the designated places</li>
                    <li>✓ Attach all required documents (originals + 2 photocopies)</li>
                    <li>✓ Submit at the college office with Rs. 100/- form fees</li>
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

export default JuniorAdmissionForm;