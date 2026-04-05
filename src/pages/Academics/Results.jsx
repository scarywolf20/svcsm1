import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Calendar, Star, TrendingUp, Medal, Quote } from 'lucide-react';
import SEO from '../../components/SEO';

// --- DATA CONFIGURATION ---
const resultsData = {
  "2024-25": {
    type: "current",
    description: "Setting new benchmarks in academic excellence.",
    scienceToppers: [
      { name: "Gayatri Sarode", percent: "81.50%", rank: "1st", image: "https://res.cloudinary.com/ditok7ztl/image/upload/v1775376270/Gayatri_Sarode_xnvjlo.png" },
      { name: "Varsha Purkar", percent: "80.83%", rank: "2nd", image: "https://res.cloudinary.com/ditok7ztl/image/upload/v1775376297/Varsha_Purkar_e244ba.png" },
      { name: "Krushna More", percent: "78.17%", rank: "3rd", image: "https://res.cloudinary.com/ditok7ztl/image/upload/v1775376286/Krushna_More_lrtait.png" },
    ],
    commerceToppers: [
      { name: "Prachi Jagoo", percent: "84.17%", rank: "1st", image: "https://res.cloudinary.com/ditok7ztl/image/upload/v1775376378/Prachi_Jajoo_nhxcso.png" },
      { name: "Sarthak Pawar", percent: "83.17%", rank: "2nd", image: "https://res.cloudinary.com/ditok7ztl/image/upload/v1775376378/Sarthak_Pawar_smjoyu.png" },
      { name: "Prince Himthani", percent: "82.67%", rank: "3rd", image: "https://res.cloudinary.com/ditok7ztl/image/upload/v1775376399/Prince_Himthani_jpgjg6.png" },
    ]
  },
  "2023-24": {
    type: "banner-only",
    description: "A historic year with 100% pass results across all streams.",
    bannerImage: "https://res.cloudinary.com/ditok7ztl/image/upload/v1775376517/Screenshot_2026-02-02_at_11.27.28_AM_iytchr.png" 
  },
  "2022-23": {
    type: "mixed",
    description: "The 'Ek Number' Batch that started the legacy.",
    toppers: [
      { name: "Adesh Athawale", percent: "88.50%", badge: "Acc: 96", image: "https://res.cloudinary.com/ditok7ztl/image/upload/v1775376603/IMG-20240111-WA0001_yfvvzq.jpg" },
      { name: "Parul Soni", percent: "87.67%", badge: "Acc: 96", image: "https://res.cloudinary.com/ditok7ztl/image/upload/v1775376603/IMG-20240111-WA0002_s61xl8.jpg" },
      { name: "Sarthak Jivrak", percent: "80.67%", badge: "Acc: 96", image: "https://res.cloudinary.com/ditok7ztl/image/upload/v1775376606/IMG-20240111-WA0004_easx2t.jpg" },
    ],
    bannerImage: "https://res.cloudinary.com/ditok7ztl/image/upload/v1775376605/IMG-20240111-WA0008_ijyfld.jpg" 
  }
};

// --- COMPONENTS ---

const StudentCard = ({ student, index, color = "blue" }) => {
  const isGold = index === 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 group flex flex-col w-full max-w-sm mx-auto"
    >
      <div className="relative w-full aspect-[3/5] overflow-hidden bg-gray-100">
        
        {/* Rank Badge */}
        <div className={`absolute top-0 right-0 z-10 px-4 py-2 rounded-bl-2xl font-bold text-white shadow-md text-sm md:text-base
          ${isGold ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 'bg-sv-blue'}`}>
          {student.rank || student.badge || `#${index + 1}`}
        </div>
        
        <img 
          src={student.image} 
          alt={student.name} 
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80"></div>
        
        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 w-full p-4 md:p-6">
          <p className="text-gray-300 text-[10px] md:text-xs uppercase tracking-wider font-semibold mb-1">Percentage</p>
          <div className="flex items-baseline gap-2 mb-2">
             <span className="text-3xl md:text-4xl font-bold text-white">{student.percent}</span>
             <TrendingUp className="text-green-400 w-4 h-4 md:w-5 md:h-5" />
          </div>
           <h3 className="text-lg md:text-xl font-bold text-white leading-tight">{student.name}</h3>
        </div>
      </div>
      
      {/* Bottom accent bar */}
      <div className={`h-2 w-full ${isGold ? 'bg-sv-gold' : 'bg-sv-blue'}`}></div>
    </motion.div>
  );
};

const Results = () => {
  const [activeTab, setActiveTab] = useState("2024-25");

  return (
    <div className="pt-5 min-h-screen bg-gray-50">
      <SEO 
        title="Results & Achievements" 
        description="Check our academic results and toppers. SVICSM celebrates student success."
        keywords="results, academic excellence, toppers, exam results, SVICSM achievements"
        url="/academics/results"
      />
      {/* --- HERO SECTION --- */}
      <section className="bg-sv-blue text-white py-12 md:py-20 relative overflow-hidden px-4">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 md:w-64 md:h-64 bg-sv-gold/10 rounded-full blur-3xl -ml-10 -mb-10"></div>
        
        <div className="container mx-auto relative z-10 text-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center justify-center p-2 md:p-3 bg-white/10 rounded-full mb-6 backdrop-blur-sm border border-white/20"
          >
            <Trophy className="text-sv-gold w-6 h-6 md:w-8 md:h-8 mr-2" />
            <span className="font-bold tracking-wider uppercase text-xs md:text-sm">Hall of Fame</span>
          </motion.div>
          
          <h1 className="text-3xl md:text-6xl font-bold mb-4 font-serif leading-tight">
            Academic Excellence
          </h1>
          <p className="text-base md:text-xl text-gray-300 max-w-2xl mx-auto">
            Celebrating the hard work and dedication of our students.
          </p>
        </div>
      </section>

      {/* --- TAB NAVIGATION (Scrollable on Mobile) --- */}
      <section className="sticky top-20 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-start md:justify-center gap-2 md:gap-8 overflow-x-auto py-4 scrollbar-hide">
            {Object.keys(resultsData).map((year) => (
              <button
                key={year}
                onClick={() => setActiveTab(year)}
                className={`relative px-4 py-2 md:px-6 rounded-full text-xs md:text-base font-bold transition-all duration-300 flex-shrink-0 whitespace-nowrap
                  ${activeTab === year 
                    ? 'bg-sv-maroon text-white shadow-lg shadow-sv-maroon/30' 
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="md:w-4 md:h-4" />
                  Batch {year}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* --- DYNAMIC CONTENT AREA --- */}
      <section className="container mx-auto px-4 py-12 md:py-16 min-h-[600px]">
        <AnimatePresence mode="wait">
          
          {/* 1. LATEST BATCH (2024-25) */}
          {activeTab === "2024-25" && (
            <motion.div
              key="2024-25"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-8 md:mb-12">
                <Quote className="w-8 h-8 md:w-10 md:h-10 text-sv-gold/50 mx-auto mb-2 md:mb-4" />
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">{resultsData["2024-25"].description}</h2>
              </div>

              {/* Science Section */}
              <div className="mb-12 md:mb-16">
                 <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
                    <div className="w-1.5 h-6 md:w-2 md:h-8 bg-sv-blue rounded-full"></div>
                    <h3 className="text-xl md:text-2xl font-bold text-sv-blue">Science Toppers</h3>
                    <div className="h-px bg-gray-200 flex-grow"></div>
                 </div>
                 
                 {/* Mobile: 1 col, Tablet: 2 col, Desktop: 3 col */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 justify-items-center">
                    {resultsData["2024-25"].scienceToppers.map((student, idx) => (
                      <StudentCard key={idx} student={student} index={idx} color="blue" />
                    ))}
                 </div>
              </div>

              {/* Commerce Section */}
              <div>
                 <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
                    <div className="w-1.5 h-6 md:w-2 md:h-8 bg-sv-maroon rounded-full"></div>
                    <h3 className="text-xl md:text-2xl font-bold text-sv-maroon">Commerce Toppers</h3>
                    <div className="h-px bg-gray-200 flex-grow"></div>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 justify-items-center">
                    {resultsData["2024-25"].commerceToppers.map((student, idx) => (
                      <StudentCard key={idx} student={student} index={idx} color="maroon" />
                    ))}
                 </div>
              </div>
            </motion.div>
          )}

          {/* 2. PREVIOUS BATCH (2023-24) */}
          {activeTab === "2023-24" && (
            <motion.div
              key="2023-24"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="max-w-5xl mx-auto"
            >
               <div className="text-center mb-6 md:mb-8">
                 <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Class of 2023-24</h2>
                 <p className="text-sm md:text-base text-gray-500">{resultsData["2023-24"].description}</p>
               </div>
               
               <div className="bg-white p-2 rounded-xl shadow-xl border border-gray-200">
                  <img 
                    src={resultsData["2023-24"].bannerImage} 
                    alt="2023-24 Results" 
                    className="w-full h-auto rounded-lg"
                  />
               </div>
            </motion.div>
          )}

          {/* 3. OLDER BATCH (2022-23) */}
          {activeTab === "2022-23" && (
            <motion.div
              key="2022-23"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="max-w-6xl mx-auto mb-12 md:mb-16">
                 <div className="text-center mb-8 md:mb-10">
                   <div className="inline-block bg-sv-gold/20 text-sv-maroon px-4 py-1 rounded-full text-xs md:text-sm font-bold mb-2 md:mb-4">
                     Star Performers
                   </div>
                   <h2 className="text-2xl md:text-3xl font-bold text-gray-800">The 'Ek Number' Batch</h2>
                 </div>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 justify-items-center mb-10 md:mb-12">
                    {resultsData["2022-23"].toppers.map((student, idx) => (
                      <StudentCard key={idx} student={student} index={idx} />
                    ))}
                 </div>
              </div>

              <div className="max-w-6xl mx-auto bg-white p-2 rounded-xl shadow-xl border border-gray-200 mt-8">
                  <div className="text-center mb-4">
                    <span className="inline-block bg-sv-blue text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                        Full Batch Result
                    </span>
                  </div>
                  <img 
                    src={resultsData["2022-23"].bannerImage} 
                    alt="2022-23 Results" 
                    className="w-full h-auto rounded-lg"
                  />
               </div>
            </motion.div>
          )}

        </AnimatePresence>
      </section>

    </div>
  );
};

export default Results;