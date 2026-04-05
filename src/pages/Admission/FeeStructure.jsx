import React from 'react';
import { motion } from 'framer-motion';
import { Check, Users, ExternalLink } from 'lucide-react';
import SEO from '../../components/SEO';

// Data from your 2026-27 Fee Chart with Curriculum Colors applied
const feeData = [
  {
    category: "Junior College (11th & 12th)",
    courses: [
      {
        name: "Science Stream",
        code: "11SCI / 12SCI",
        total: "₹ 35,000",
        oneTime: "₹ 32,500",
        // Theme: Blue (Matches Science in Curriculum)
        color: "bg-gradient-to-r from-blue-500 to-cyan-500",
        features: ["Tuition Fee: ₹25,000", "Admission Fee: ₹1,000", "Co-curricular: ₹6,000", "Exam Fee: ₹3,000"]
      },
      {
        name: "Commerce Stream",
        code: "11COM / 12COM",
        total: "₹ 21,500",
        oneTime: "₹ 20,000",
        // Theme: Orange (Matches Commerce in Curriculum)
        color: "bg-gradient-to-r from-orange-500 to-red-500",
        features: ["Tuition Fee: ₹14,500", "Admission Fee: ₹1,000", "Co-curricular: ₹3,000", "Exam Fee: ₹3,000"]
      },
      {
        name: "Arts Stream",
        code: "11ARTS / 12ARTS",
        total: "₹ 12,000",
        oneTime: "₹ 11,000",
        // Theme: Teal (Matches Arts Theme)
        color: "bg-gradient-to-r from-teal-500 to-emerald-600",
        features: ["Tuition Fee: ₹7,000", "Admission Fee: ₹1,000", "Co-curricular: ₹3,000", "Exam Fee: ₹1,000"]
      },
      {
        name: "CET Batch (MHT-CET/JEE)",
        code: "11CET / 12CET",
        total: "₹ 55,000",
        oneTime: "₹ 52,500",
        // Theme: Deep Blue / Purple (Special Mode)
        color: "bg-gradient-to-r from-blue-700 to-indigo-800",
        features: ["Tuition Fee: ₹45,000", "Admission Fee: ₹1,000", "Co-curricular: ₹6,000", "Exam Fee: ₹3,000"]
      }
    ]
  },
  {
    category: "Senior College (Undergraduate)",
    courses: [
      {
        name: "BBA (Management)",
        code: "FY/SY/TY BBA",
        total: "₹ 55,000",
        oneTime: "₹ 52,500",
        // Theme: Indigo (Matches BBA in Curriculum)
        color: "bg-gradient-to-r from-indigo-500 to-purple-500",
        features: ["Tuition Fee: ₹40,000", "Admission Fee: ₹2,500", "Co-curricular: ₹10,000", "Exam Fee: ₹2,500"]
      },
      {
        name: "BCA (Computer Appl.)",
        code: "FY/SY/TY BCA",
        total: "₹ 55,000",
        oneTime: "₹ 52,500",
        // Theme: Blue/Cyan (Tech theme)
        color: "bg-gradient-to-r from-cyan-500 to-blue-600",
        features: ["Tuition Fee: ₹40,000", "Admission Fee: ₹2,500", "Co-curricular: ₹10,000", "Exam Fee: ₹2,500"]
      },
      {
        name: "B.Com",
        code: "FY/SY/TY B.Com",
        total: "₹ 18,000",
        oneTime: "₹ 17,000",
        // Theme: Emerald (Matches B.Com in Curriculum)
        color: "bg-gradient-to-r from-emerald-500 to-teal-500",
        features: ["Tuition Fee: ₹12,000", "Admission Fee: ₹1,000", "Co-curricular: ₹2,500", "Exam Fee: ₹2,500"]
      },
      {
        name: "B.A. (Arts)",
        code: "FY/SY/TY B.A.",
        total: "₹ 12,500",
        oneTime: "₹ 11,000",
        // Theme: Amber (Matches B.A. in Curriculum)
        color: "bg-gradient-to-r from-amber-500 to-orange-500",
        features: ["Tuition Fee: ₹7,000", "Admission Fee: ₹1,000", "Co-curricular: ₹3,000", "Exam Fee: ₹1,500"]
      }
    ]
  }
];

const FeesStructure = () => {
  return (
    <div className="pt-5 min-h-screen bg-gray-50">
      <SEO 
        title="Fee Structure" 
        description="Transparent fee structure for Junior and Senior College courses at SVICSM."
        keywords="fees, college fees, reimbursement, installment, SVICSM fees"
        url="/admissions/fees"
      />
      {/* --- HERO SECTION --- */}
      <section className="bg-sv-blue py-20 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Fees & Financial Aid</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Transparent fee structure and government scholarship support for the academic year 2026-27.
          </p>
        </div>
      </section>

      {/* --- FEE STRUCTURE SECTION --- */}
      <section className="container mx-auto px-4 py-16">
        {feeData.map((section, sectionIdx) => (
          <div key={sectionIdx} className="mb-16 last:mb-0">
            {/* Section Heading */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="h-8 w-2 bg-sv-gold rounded-full"></div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">{section.category}</h2>
            </div>

            {/* Cards Container - Centered Flex Layout */}
            <div className="flex flex-wrap justify-center gap-8">
              {section.courses.map((plan, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="w-full md:w-96 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden border border-gray-100 flex flex-col"
                >
                  {/* Card Header with Gradient Theme */}
                  <div className={`p-6 text-white ${plan.color}`}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold">{plan.name}</h3>
                      <span className="bg-white/20 text-xs px-2 py-1 rounded text-white/90 font-medium">
                        {plan.code}
                      </span>
                    </div>
                    <div className="mt-4">
                      <span className="text-3xl font-bold"> {plan.total}</span>
                      <span className="text-sm opacity-80 block mt-1">Total Annual Fees</span>
                    </div>
                  </div>

                  {/* One Time Offer Strip */}
                  <div className="bg-gray-900 text-sv-gold text-xs font-bold px-6 py-2 flex justify-between items-center">
                    <span>ONE-TIME PAYMENT OFFER</span>
                    <span className="text-white">{plan.oneTime}</span>
                  </div>

                  {/* Features List */}
                  <div className="p-6 flex-1 bg-gray-50">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Fee Breakdown</p>
                    <ul className="space-y-3">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-3 text-gray-700 text-sm">
                          <Check size={14} className="text-green-500 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Installment Info */}
                  <div className="p-4 border-t border-gray-200 text-center bg-white">
                    <p className="text-xs text-gray-500">
                      Installment facility available (55% - 45%)
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* --- SCHOLARSHIPS SECTION --- */}
      <section className="bg-white py-16 border-t border-gray-200">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-sv-maroon mb-4">Scholarships</h2>
            <p className="text-gray-600">
              We facilitate government support to ensure education is accessible to everyone.
            </p>
          </div>

          {/* Single Government Scholarship Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row gap-6 bg-gradient-to-r from-purple-50 to-white p-8 rounded-2xl shadow-lg border border-purple-100 items-start"
          >
            <div className="w-20 h-20 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600 flex-shrink-0 shadow-sm">
              <Users size={40} />
            </div>
            
            <div className="flex-1">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 mb-4">
                <h3 className="text-2xl font-bold text-gray-800">Government Scholarships</h3>
                <span className="inline-block bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full w-fit">
                  State Govt. Funded
                </span>
              </div>
              
              <p className="text-gray-700 mb-6 leading-relaxed">
                We support eligible students in applying for Maharashtra State Government scholarships. 
                This applies to students from <strong className="text-gray-900">SC, ST, OBC, VJNT, and SBC</strong> categories.
              </p>

              <div className="bg-white p-4 rounded-lg border border-purple-100 mb-6">
                <p className="text-sm font-bold text-gray-500 mb-2 uppercase text-xs">Requirements</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-md border border-gray-200">Valid Caste Certificate</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-md border border-gray-200">Income Certificate</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-md border border-gray-200">Domicile Certificate</span>
                </div>
              </div>

              <a 
                href="https://mahadbt.maharashtra.gov.in/" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-white bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-bold transition-colors text-sm"
              >
                Visit MahaDBT Portal <ExternalLink size={16} />
              </a>
            </div>
          </motion.div>

        </div>
      </section>
    </div>
  );
};

export default FeesStructure;