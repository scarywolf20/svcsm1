import React, { useEffect, useState, useMemo } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase';
import { ChevronLeft, Users, FileText, Download } from 'lucide-react';
import { motion } from 'framer-motion';

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

const resolveStreamLabel = (admission) => {
  const stream = admission.streamScience
    ? 'Science'
    : admission.streamCommerce
      ? 'Commerce'
      : admission.streamArts
        ? 'Arts'
        : admission.streamCET
          ? 'CET'
          : admission.stream || '-';
  return `${stream}${admission.isHybrid ? ' (Hybrid)' : ''}`;
};

const JuniorAdmissionRow = ({ row }) => {
  const standard = row.standard || '-';
  const stream = resolveStreamLabel(row);
  const student = `${row.surname || ''} ${row.fathersName || ''}`.trim() || '-';
  const createdAt = row.createdAt?.toDate ? row.createdAt.toDate() : null;
  const date = createdAt ? createdAt.toLocaleDateString() : '-';

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 font-bold text-gray-800">{row.appNo || '-'}</td>
      <td className="px-6 py-4 font-semibold text-gray-800">{student}</td>
      <td className="px-6 py-4">{standard}</td>
      <td className="px-6 py-4">{stream}</td>
      <td className="px-6 py-4 text-gray-500">{date}</td>
    </tr>
  );
};

const AdminJuniorAdmissions = () => {
  const [juniorAdmissions, setJuniorAdmissions] = useState([]);
  const [isLoadingAdmissions, setIsLoadingAdmissions] = useState(true);
  const [admissionsError, setAdmissionsError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'juniorAdmissions'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const rows = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setJuniorAdmissions(rows);
        setIsLoadingAdmissions(false);
      },
      (err) => {
        setAdmissionsError(err?.message || 'Failed to load admissions');
        setIsLoadingAdmissions(false);
      }
    );

    return unsubscribe;
  }, []);

  // Compute category counts
  const categories = useMemo(() => {
    const cats = {
      '11th Science': 0,
      '11th Commerce': 0,
      '11th CET': 0,
      '12th Science': 0,
      '12th Commerce': 0,
      '12th CET': 0,
    };

    juniorAdmissions.forEach(admission => {
      const std = admission.standard;
      const stream = resolveStreamLabel(admission).replace(' (Hybrid)', '');
      let key = `${std} ${stream}`;
      if (admission.isHybrid) {
        key += ' (Hybrid)';
      }
      cats[key] = (cats[key] || 0) + 1;
    });

    return Object.entries(cats).filter(([, count]) => count > 0).sort((a, b) => {
      if (a[0] < b[0]) return -1;
      if (a[0] > b[0]) return 1;
      return 0;
    });
  }, [juniorAdmissions]);

  const filteredAdmissions = useMemo(() => {
    if (!selectedCategory) return [];
    return juniorAdmissions.filter(admission => {
      const std = admission.standard;
      const stream = resolveStreamLabel(admission).replace(' (Hybrid)', '');
      let key = `${std} ${stream}`;
      if (admission.isHybrid) {
        key += ' (Hybrid)';
      }
      return key === selectedCategory;
    });
  }, [juniorAdmissions, selectedCategory]);


  const handleExport = () => {
    const exportRows = selectedCategory ? filteredAdmissions : juniorAdmissions;

    const exportColumns = [
      { header: 'Application Number', getValue: (r) => r?.appNo },
      { header: 'Std', getValue: (r) => r?.standard },
      {
        header: 'Stream',
        getValue: (r) => {
          let s = r?.streamScience
            ? 'Science'
            : r?.streamCommerce
              ? 'Commerce'
              : r?.streamArts
                ? 'Arts'
                : r?.streamCET
                  ? 'CET'
                  : r?.stream || '';
          if (r?.isHybrid) s += ' (Hybrid)';
          return s;
        },
      },
      { header: 'Last Name', getValue: (r) => r?.surname },
      { header: 'First Name', getValue: (r) => r?.firstName },
      { header: 'Middle Name', getValue: (r) => r?.middleName },
      { header: 'Gender', getValue: (r) => r?.gender },
      { header: 'Mother Name', getValue: (r) => r?.mothersName },
      { header: 'Father Name', getValue: (r) => r?.fathersName || r?.fullNameFather },
      { header: 'Father Occupation', getValue: (r) => r?.occupation },
      { header: 'Office Address', getValue: (r) => r?.officeAddress },
      { header: 'Parent Mobile Number', getValue: (r) => r?.parentMobile },
      { header: 'Candidate Mobile Number', getValue: (r) => r?.candidateMobile },
      { header: 'Email', getValue: (r) => r?.email },
      { header: 'DOB', getValue: (r) => r?.dobString || r?.birthDateString },
      { header: 'Place Of Birth', getValue: (r) => r?.placeOfBirth || r?.birthPlace },
      { header: 'State', getValue: (r) => r?.birthState },
      { header: 'Caste', getValue: (r) => r?.caste },
      { header: 'Address', getValue: (r) => r?.permanentAddress || r?.correspondenceAddress },
      {
        header: 'Previous Exam Details',
        getValue: (r) => {
          const parts = [
            r?.sscStream ? `Stream: ${r.sscStream}` : '',
            r?.sscYear ? `Year: ${r.sscYear}` : '',
            r?.sscBoard ? `Board: ${r.sscBoard}` : '',
            r?.sscPercentage ? `Percentage: ${r.sscPercentage}` : '',
            r?.sscMarksObtained ? `Marks: ${r.sscMarksObtained}` : '',
            r?.sscTotalMarks ? `Out Of: ${r.sscTotalMarks}` : '',
          ].filter(Boolean);
          return parts.join(', ');
        },
      },
    ];

    const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    downloadCsvWithColumns(`junior-admissions-${selectedCategory || 'all'}-${ts}.csv`, exportColumns, exportRows);
  };

  if (isLoadingAdmissions) {
    return <div className="p-10 text-center text-sm text-gray-500">Loading submissions...</div>;
  }

  if (!selectedCategory) {
    return (
      <div>
        <div className="mb-6 flex justify-between items-center">
            <div>
                 <h2 className="text-2xl font-bold text-gray-800">Junior Admission Dashboard</h2>
                 <p className="text-gray-500">Select a category to view applications</p>
            </div>
             <button
            type="button"
            onClick={handleExport}
            disabled={juniorAdmissions.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-sv-blue text-white hover:bg-sv-maroon transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={16} />
            Export All Data
          </button>
        </div>
       
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(([name, count]) => (
            <motion.div
              key={name}
              whileHover={{ y: -4 }}
              onClick={() => setSelectedCategory(name)}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:border-sv-blue transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                  <FileText className="text-sv-blue" size={24} />
                </div>
                <span className={`bg-gray-100 px-2 py-1 rounded text-xs font-bold ${name.includes('Hybrid') ? 'text-orange-600 bg-orange-100' : 'text-gray-600'}`}>
                  {name.includes('Science') ? 'SCI' : name.includes('Commerce') ? 'COM' : 'GEN'}
                  {name.includes('Hybrid') ? ' (H)' : ''}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-800">{name}</h3>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900">{count}</span>
                <span className="text-sm text-gray-500">applications</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSelectedCategory(null)}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h3 className="font-bold text-gray-800 text-lg">{selectedCategory} Applications</h3>
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
                <th className="px-6 py-4">Standard</th>
                <th className="px-6 py-4">Stream</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAdmissions.map((row) => (
                <JuniorAdmissionRow key={row.id} row={row} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminJuniorAdmissions;
