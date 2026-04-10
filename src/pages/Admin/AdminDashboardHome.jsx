import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, FileText, GraduationCap, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { formatCourseName } from '../../utils';

const MotionDiv = motion.div;

const getJuniorStreamLabel = (data) => {
  if (data.streamScience) return 'Science';
  if (data.streamCommerce) return 'Commerce';
  if (data.streamArts) return 'Arts';
  if (data.streamCET) return 'CET';
  return data.stream || 'Unknown';
};

const AdminDashboardHome = () => {
  const [stats, setStats] = useState({
    juniorCount: 0,
    seniorCount: 0,
    facultyCount: 0,
    noticesCount: 0
  });
  const [recentAdmissions, setRecentAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscibers = [];

    // 1. Fetch Junior Admissions
    const juniorq = query(collection(db, 'juniorAdmissions'), orderBy('createdAt', 'desc'));
    const unsubJunior = onSnapshot(juniorq, (snapshot) => {
      const juniorDocs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        type: 'Junior',
        studentName: `${doc.data().firstName || ''} ${doc.data().surname || ''}`.trim() || 'Unknown',
        courseName: `${doc.data().standard} ${getJuniorStreamLabel(doc.data())}`,
        date: doc.data().createdAt?.toDate() || new Date()
      }));

      setStats(prev => ({ ...prev, juniorCount: snapshot.size }));
      updateRecents(juniorDocs);
    });
    unsubscibers.push(unsubJunior);

    // 2. Fetch Senior Admissions
    const seniorq = query(collection(db, 'seniorAdmissions'), orderBy('createdAt', 'desc'));
    const unsubSenior = onSnapshot(seniorq, (snapshot) => {
      const seniorDocs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        type: 'Senior',
        studentName: `${doc.data().firstName || ''} ${doc.data().lastName || ''}`.trim() || 'Unknown',
        courseName: `${doc.data().year} ${formatCourseName(doc.data().course)}`,
        date: doc.data().createdAt?.toDate() || new Date()
      }));

      setStats(prev => ({ ...prev, seniorCount: snapshot.size }));
      updateRecents(seniorDocs, true); // Pass true to indicate this is a partial update trigger
    });
    unsubscibers.push(unsubSenior);

    // 3. Fetch Faculty
    const facultyq = collection(db, 'faculty');
    const unsubFaculty = onSnapshot(facultyq, (snapshot) => {
      setStats(prev => ({ ...prev, facultyCount: snapshot.size }));
    });
    unsubscibers.push(unsubFaculty);

    // 4. Fetch Notices
    const noticesq = collection(db, 'notices');
    const unsubNotices = onSnapshot(noticesq, (snapshot) => {
      setStats(prev => ({ ...prev, noticesCount: snapshot.size }));
    });
    unsubscibers.push(unsubNotices);

    // Helper to merge and sort recent admissions
    let allJunior = [];
    let allSenior = [];

    const updateRecents = (docs, isSenior = false) => {
      if (isSenior) {
        allSenior = docs;
      } else {
        allJunior = docs;
      }

      const combined = [...allJunior, ...allSenior]
        .sort((a, b) => b.date - a.date)
        .slice(0, 5);
      
      setRecentAdmissions(combined);
      setLoading(false);
    };

    return () => unsubscibers.forEach(unsub => unsub());
  }, []);

  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Overview</h2>
        <p className="text-gray-500 mt-1">Real-time update of your institute's metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          icon={Users} 
          title="Junior Applications" 
          value={stats.juniorCount} 
          subText="Total received"
          color="bg-blue-100 text-blue-700" 
        />
        <StatCard 
          icon={GraduationCap} 
          title="Senior Applications" 
          value={stats.seniorCount} 
          subText="Total received"
          color="bg-purple-100 text-purple-700" 
        />
        <StatCard 
          icon={Users} 
          title="Faculty Members" 
          value={stats.facultyCount} 
          subText="Active staff"
          color="bg-orange-100 text-orange-700" 
        />
        <StatCard 
          icon={FileText} 
          title="Notices Published" 
          value={stats.noticesCount} 
          subText="Total notices"
          color="bg-green-100 text-green-700" 
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-gray-800 text-lg">Recent Admission Requests</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 uppercase font-bold text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Course</th>
                <th className="px-6 py-4">Date applied</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentAdmissions.length > 0 ? (
                recentAdmissions.map((admission) => (
                  <TableRow 
                    key={admission.id}
                    name={admission.studentName}
                    type={admission.type}
                    course={admission.courseName}
                    date={admission.date.toLocaleDateString()}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-400">
                    No admission requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="h-10"></div>
    </>
  );
};

const StatCard = ({ icon: Icon, title, value, subText, color }) => {
  return (
    <MotionDiv
      whileHover={{ y: -4 }}
      className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between min-h-[8rem] h-auto"
    >
      <div className="flex justify-between items-start">
        <div className={`p-2.5 rounded-lg ${color} bg-opacity-20`}>
          <Icon size={22} className={color.split(' ')[1]} />
        </div>
      </div>
      <div>
        <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wide">{title}</h3>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-400 mt-1">{subText}</p>
      </div>
    </MotionDiv>
  );
};

const TableRow = ({ name, type, course, date }) => {
  return (
    <tr className="hover:bg-gray-50 transition-colors group">
      <td className="px-6 py-4 font-bold text-gray-800">{name}</td>
      <td className="px-6 py-4">
        <span className={`text-xs px-2 py-1 rounded bg-gray-100 text-gray-600 font-medium`}>
          {type}
        </span>
      </td>
      <td className="px-6 py-4">{course}</td>
      <td className="px-6 py-4 text-gray-500">{date}</td>
    </tr>
  );
};

export default AdminDashboardHome;
