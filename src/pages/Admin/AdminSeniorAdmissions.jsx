import React, { useEffect, useState, useMemo } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase';
import { ChevronLeft, FileText, Download, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCourseName } from '../../utils';

const formatCsvValue = (value) => {
  if (value === null || value === undefined) return '';
  if (value?.toDate && typeof value.toDate === 'function') {
    const d = value.toDate();
    return d instanceof Date && !Number.isNaN(d.getTime()) ? d.toISOString() : '';
  }
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map((v) => String(v ?? '')).join(' | ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

const downloadCsvWithColumns = (filename, columns, rows) => {
  const escapeCell = (cell) => {
    const str = formatCsvValue(cell);
    const escaped = str.replace(/"/g, '""');
    return `"${escaped}"`;
  };

  const headers = columns.map((c) => c.header);
  const csvLines = [headers.map((h) => escapeCell(h)).join(',')];
  rows.forEach((r) => {
    csvLines.push(columns.map((c) => escapeCell(c.getValue(r))).join(','));
  });

  const csv = csvLines.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

const SeniorAdmissionRow = ({ row }) => {
  const year = row.year || '-';
  const course = `${formatCourseName(row.course)}${row.isHybrid ? ' (Hybrid)' : ''}` || '-';
  const student = `${row.lastName || ''} ${row.firstName || ''}`.trim() || '-';
  const createdAt = row.createdAt?.toDate ? row.createdAt.toDate() : null;
  const date = createdAt ? createdAt.toLocaleDateString() : '-';

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 font-bold text-gray-800">{row.appNo || '-'}</td>
      <td className="px-6 py-4 font-semibold text-gray-800">{student}</td>
      <td className="px-6 py-4">{year}</td>
      <td className="px-6 py-4">{course}</td>
      <td className="px-6 py-4 text-gray-500">{date}</td>
    </tr>
  );
};

const AdminSeniorAdmissions = () => {
  const [seniorAdmissions, setSeniorAdmissions] = useState([]);
  const [isLoadingAdmissions, setIsLoadingAdmissions] = useState(true);
  const [admissionsError, setAdmissionsError] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'seniorAdmissions'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const rows = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setSeniorAdmissions(rows);
        setIsLoadingAdmissions(false);
      },
      (err) => {
        setAdmissionsError(err?.message || 'Failed to load admissions');
        setIsLoadingAdmissions(false);
      }
    );

    return unsubscribe;
  }, []);

  // Compute course counts
  const courses = useMemo(() => {
    const counts = {};
    
    seniorAdmissions.forEach(admission => {
      let course = formatCourseName(admission.course || 'Unknown');
      if (admission.isHybrid) {
        course += ' (Hybrid)';
      }
      counts[course] = (counts[course] || 0) + 1;
    });

    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [seniorAdmissions]);

  const filteredAdmissions = useMemo(() => {
    if (!selectedCourse) return [];
    return seniorAdmissions.filter(admission => {
      let course = formatCourseName(admission.course || 'Unknown');
      if (admission.isHybrid) {
        course += ' (Hybrid)';
      }
      return course === selectedCourse;
    });
  }, [seniorAdmissions, selectedCourse]);

  const handleExport = () => {
    const exportRows = selectedCourse ? filteredAdmissions : seniorAdmissions;

    const exportColumns = [
      { header: 'Application Number', getValue: (r) => r?.appNo },
      { header: 'Year', getValue: (r) => r?.year },
      { header: 'Course', getValue: (r) => `${formatCourseName(r?.course)}${r?.isHybrid ? ' (Hybrid)' : ''}` },
      { header: 'Last Name', getValue: (r) => r?.lastName },
      { header: 'First Name', getValue: (r) => r?.firstName },
      { header: 'Middle Name', getValue: (r) => r?.middleName },
      { header: 'Gender', getValue: (r) => r?.gender },
      { header: 'Mother Name', getValue: (r) => r?.motherName },
      { header: 'Father Name', getValue: (r) => r?.parentName },
      { header: 'Father Occupation', getValue: (r) => r?.parentOccupation },
      { header: 'Office Address', getValue: (r) => r?.parentAddress },
      { header: 'Parent Mobile Number', getValue: (r) => r?.parentMobile },
      { header: 'Candidate Mobile Number', getValue: (r) => r?.candidateMobile },
      { header: 'Email', getValue: (r) => r?.email },
      { header: 'DOB', getValue: (r) => r?.dobString || [r?.dobDay, r?.dobMonth, r?.dobYear].filter(Boolean).join('-') },
      { header: 'Blood Group', getValue: (r) => r?.bloodGroup },
      { header: 'State', getValue: (r) => r?.state },
      { header: 'Caste', getValue: (r) => r?.category || r?.casteName },
      {
        header: 'Address',
        getValue: (r) => {
          const parts = [r?.buildingName, r?.streetName, r?.village, r?.district, r?.state, r?.pinCode].filter(Boolean);
          return parts.join(', ');
        },
      },
      {
        header: 'Bank Details',
        getValue: (r) => {
          const parts = [
            r?.bankAccountNumber ? `A/C: ${r.bankAccountNumber}` : '',
            r?.bankIFSC ? `IFSC: ${r.bankIFSC}` : '',
            r?.bankName ? `Bank: ${r.bankName}` : '',
            r?.bankBranch ? `Branch: ${r.bankBranch}` : '',
          ].filter(Boolean);
          return parts.join(', ');
        },
      },
      { header: 'Parent Income', getValue: (r) => r?.parentIncome },
      {
        header: 'Previous Exam Details',
        getValue: (r) => {
          const parts = [
            r?.lastCourseName ? `Course: ${r.lastCourseName}` : '',
            r?.lastSchoolCollege ? `Institute: ${r.lastSchoolCollege}` : '',
            r?.lastExamMonth ? `Month: ${r.lastExamMonth}` : '',
            r?.lastExamYear ? `Year: ${r.lastExamYear}` : '',
            r?.lastPercentage ? `Percentage: ${r.lastPercentage}` : '',
          ].filter(Boolean);
          return parts.join(', ');
        },
      },
      { header: 'Late Fine Amount', getValue: (r) => r?.lateFineAmount || 0 },
    ];

    const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    downloadCsvWithColumns(`senior-admissions-${selectedCourse || 'all'}-${ts}.csv`, exportColumns, exportRows);
  };

  if (isLoadingAdmissions) {
    return <div className="p-10 text-center text-sm text-gray-500">Loading submissions...</div>;
  }

  if (!selectedCourse) {
    return (
      <div>
        <div className="mb-6 flex justify-between items-center">
             <div>
                <h2 className="text-2xl font-bold text-gray-800">Senior Admission Dashboard</h2>
                <p className="text-gray-500">Select a course to view applications</p>
             </div>
             <button
            type="button"
            onClick={handleExport}
            disabled={seniorAdmissions.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-sv-blue text-white hover:bg-sv-maroon transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={16} />
            Export All Data
          </button>
        </div>
        
        {courses.length === 0 ? (
          <div className="p-10 text-center text-gray-500 bg-white rounded-xl shadow-sm border border-gray-200">
            No submissions yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(([name, count]) => (
              <motion.div
                key={name}
                whileHover={{ y: -4 }}
                onClick={() => setSelectedCourse(name)}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:border-sv-blue transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                    <GraduationCap className="text-purple-600" size={24} />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-800">{name}</h3>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">{count}</span>
                  <span className="text-sm text-gray-500">applications</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSelectedCourse(null)}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h3 className="font-bold text-gray-800 text-lg">{selectedCourse} Applications</h3>
            <p className="text-xs text-gray-500">Showing {filteredAdmissions.length} records</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExport}
            disabled={filteredAdmissions.length === 0}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Download size={14} />
            Export This List
          </button>
        </div>
      </div>

      {admissionsError && (
        <div className="p-6 text-sm text-red-700 bg-red-50 border-b border-red-100">{admissionsError}</div>
      )}

      {filteredAdmissions.length === 0 ? (
        <div className="p-10 text-center text-sm text-gray-500">No submissions in this category yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 uppercase font-bold text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">App No</th>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Year</th>
                <th className="px-6 py-4">Course</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAdmissions.map((row) => (
                <SeniorAdmissionRow key={row.id} row={row} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminSeniorAdmissions;
