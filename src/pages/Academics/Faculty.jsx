import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Briefcase, Award } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import SEO from '../../components/SEO';
import PricipalImg from '../../assets/img.png';
import Mapari from '../../assets/mp3.png';
import Mahale from '../../assets/mh3.png';
import Pardeshi from '../../assets/p1.png';
import Saiyyad from '../../assets/saiyyad.png';
import Pagare from '../../assets/pagare.png';
import Nilima from '../../assets/faculty/nil.png'
import Chetan from '../../assets/faculty/chetan.png'
// --- DATA CONFIGURATION ---
const leadershipData = [
  {
    name: "Mr. Chetan N. Bargal",
    role: "Principal",
    qual: "B.E. (Mechanical), MBA",
    exp: "10 Years",
    image: Chetan
  },
  {
    name: "Mr. Vivek S. Mapari",
    role: "HR & Management",
    qual: "B.E. (Mechanical), MBA",
    exp: "10 Years",
    image: Mapari
  },
  {
    name: "Mrs. Prachi Mahale",
    role: "Administration",
    qual: "M.Com",
    exp: "5 Years",
    image: Mahale
  },
  {
    name: "Mr. Akshay Pardeshi",
    role: "Campus In-charge",
    qual: "M.Com",
    exp: "8 Years",
    image: Pardeshi
  }
];

const facultyData = [
  {
    name: "Mr. Chetan N. Bargal",
    role: "HOD: Business Management",
    qual: "B.E. (Mechanical), MBA",
    exp: "10 Years",
    image: Chetan
  },
  {
    name: "Mr. Vivek S. Mapari",
    role: "HOD: Science",
    qual: "B.E. (Mechanical), MBA",
    exp: "10 Years",
    image: Mapari 
  },
  {
    name: "Mrs. Samina Saiyyad",
    role: "HOD: Arts & Humanity",
    qual: "M.A",
    exp: "10 Years",
    image: Saiyyad
  },
  {
    name: "Mr. Akshay Pardeshi",
    role: "HOD: Commerce (JR)",
    qual: "M.Com",
    exp: "8 Years",
    image: Pardeshi
  },
  {
    name: "Miss. Akankasha Pagare",
    role: "HOD: Commerce (SR)",
    qual: "M.Com",
    exp: "8 Years",
    image: Pagare
  },
  {
    name: "Mrs. Nilima Jadhav",
    role: "HOD: Language & Lit.",
    qual: "M.A (English)",
    exp: "8 Years",
    image: Nilima
  }
];

// --- COMPONENTS ---

const ProfileCard = ({ person, index }) => {
  // Theme logic for dynamic colors
  const themeColors = {
    maroon: {
        gradient: "from-sv-maroon/90 to-sv-maroon/70",
        borderHover: "group-hover:border-sv-maroon",
        textHover: "group-hover:text-sv-maroon",
        bgBlob: "bg-sv-maroon"
    },
    blue: {
        gradient: "from-sv-blue/90 to-sv-blue/70",
        borderHover: "group-hover:border-sv-blue",
        textHover: "group-hover:text-sv-blue",
        bgBlob: "bg-sv-blue"
    }
  };

  const activeTheme = index % 2 === 0 ? themeColors.maroon : themeColors.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      viewport={{ once: true }}
      className="group h-full"
    >
      {/* CARD CONTAINER 
         - Added 'border-2' and 'border-gray-200' for visible border
         - Added hover transition for border color
      */}
      <div className={`relative bg-white rounded-2xl overflow-hidden h-full flex flex-col
                       border-2 border-gray-200 ${activeTheme.borderHover}
                       shadow-md hover:shadow-xl transition-all duration-300`}>
        
        {/* Image Area */}
        <div className="relative h-64 w-full bg-gray-50 overflow-hidden flex items-end justify-center pt-8 border-b border-gray-100">
          {/* Animated Background Blob */}
          <div className={`absolute bottom-0 w-64 h-64 rounded-t-full opacity-10 ${activeTheme.bgBlob} 
                          transition-all duration-500 transform scale-90 group-hover:scale-100`}></div>
          
          {/* Person Image */}
          <img 
            src={person.image || 'https://via.placeholder.com/800x600?text=Faculty+Image'} 
            alt={person.name} 
            className="relative z-10 h-full w-auto object-contain drop-shadow-md transform group-hover:scale-105 transition-transform duration-500 origin-bottom"
          />
        </div>

        {/* Content Area */}
        <div className="p-5 flex-grow flex flex-col relative">
          
          <div className="mb-4">
            <span className="inline-block py-1 px-3 rounded-full bg-gray-100 text-gray-600 text-[10px] md:text-xs font-bold tracking-wider uppercase mb-2">
              {person.role}
            </span>
            <h3 className={`text-xl font-bold text-gray-800 leading-tight ${activeTheme.textHover} transition-colors`}>
              {person.name}
            </h3>
          </div>

          <div className="space-y-3 mt-auto border-t border-gray-100 pt-4">
            <div className="flex items-start gap-3">
              <GraduationCap className="w-5 h-5 text-sv-gold mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold">Qualification</p>
                <p className="text-sm font-medium text-gray-700">{person.qual}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Award className="w-5 h-5 text-sv-gold mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold">Experience</p>
                <p className="text-sm font-medium text-gray-700">{person.exp}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Color Strip */}
        <div className={`h-1.5 w-full bg-gradient-to-r ${activeTheme.gradient}`}></div>
      </div>
    </motion.div>
  );
};

const Faculty = () => {
  const facultyCol = useMemo(() => collection(db, 'faculty'), []);

  const [leadershipRows, setLeadershipRows] = useState(leadershipData);
  const [hodRows, setHodRows] = useState(facultyData);

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      try {
        const snap = await getDocs(facultyCol);
        if (ignore) return;

        const rows = snap.docs.map((d) => {
          const data = d.data() || {};
          return {
            id: d.id,
            category: data.category,
            name: data.name,
            role: data.role,
            qual: data.qual,
            exp: data.exp,
            image: data.imageUrl,
            order: data.order,
            active: data.active,
            createdAt: data.createdAt,
          };
        });

        const toMillis = (v) => {
          if (!v) return 0;
          if (typeof v?.toMillis === 'function') return v.toMillis();
          if (typeof v?.toDate === 'function') return v.toDate().getTime();
          const d = new Date(v);
          if (Number.isNaN(d.getTime())) return 0;
          return d.getTime();
        };

        const sortedActive = rows
          .filter((r) => r.active === true)
          .sort((a, b) => {
            const catA = String(a?.category || '');
            const catB = String(b?.category || '');
            if (catA !== catB) return catA.localeCompare(catB);

            const orderA = Number.isFinite(a?.order) ? a.order : 0;
            const orderB = Number.isFinite(b?.order) ? b.order : 0;
            if (orderA !== orderB) return orderA - orderB;

            return toMillis(b?.createdAt) - toMillis(a?.createdAt);
          });

        const leadership = sortedActive.filter((r) => r.category === 'leadership');
        const hod = sortedActive.filter((r) => r.category === 'hod');

        if (leadership.length > 0) {
          // Merge Firebase leadership with static leadership, putting Firebase ones first.
          // Alternatively, just replace if they intend to manage fully via Firebase. 
          // Assuming replacement to allow admin to delete static items.
          setLeadershipRows(leadership);
        }
        if (hod.length > 0) {
          setHodRows(hod);
        }
      } catch {
        if (ignore) return;
      }
    };

    void load();

    return () => {
      ignore = true;
    };
  }, [facultyCol]);

  return (
    <div className="pt-5 min-h-screen bg-gray-50">
      <SEO 
        title="Faculty" 
        description="Meet our highly qualified and experienced faculty members at SVICSM."
        keywords="faculty, teachers, professors, SVICSM staff, education experts"
        url="/academics/faculty"
      />
      {/* HERO SECTION */}
      <section className="relative bg-sv-maroon text-white py-24 overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
          </svg>
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 font-serif">
              Meet Our Faculty
            </h1>
            <p className="text-xl text-white/90 leading-relaxed">
              Highly qualified and experienced leadership dedicated to academic excellence and student development.
            </p>
          </motion.div>
        </div>
      </section>

      {/* LEADERSHIP SECTION */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-10 text-center">
          <div className="h-0.5 w-12 bg-sv-gold hidden md:block"></div>
          <h2 className="text-2xl md:text-3xl font-bold text-sv-blue uppercase tracking-wide">
            Institute Leadership
          </h2>
          <div className="h-0.5 w-12 bg-sv-gold hidden md:block"></div>
        </div>

        {/* RESPONSIVE GRID:
           grid-cols-1 (Mobile)
           md:grid-cols-2 (Tablet)
           lg:grid-cols-4 (Desktop - Fits all 4 leaders in one row)
        */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {leadershipRows.map((person, index) => (
            <ProfileCard key={index} person={person} index={index} />
          ))}
        </div>
      </section>

      {/* HOD SECTION */}
      <section className="bg-white py-16 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3 mb-12">
             <Briefcase className="text-sv-maroon w-6 h-6 md:w-8 md:h-8" />
             <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center">
               Heads of Departments
             </h2>
          </div>

          {/* RESPONSIVE GRID:
             grid-cols-1 (Mobile)
             md:grid-cols-2 (Tablet)
             lg:grid-cols-3 (Desktop - Standard 3-col layout)
          */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {hodRows.map((person, index) => (
              <ProfileCard key={index} person={person} index={index + 4} />
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Faculty;