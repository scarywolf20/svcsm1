import React from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, Lightbulb, Target, Calendar, Award } from 'lucide-react';
import SEO from '../../components/SEO';

const AboutSVCMS = () => {
  return (
    <div className="bg-white min-h-screen pt-5">
      <SEO 
        title="About SVICSM" 
        description="About SVICSM (Year of establishment: 2021). Eduparivartan Intellectual Services LLP is the parent organisation of SVICSM."
        keywords="SVICSM, Swami Vivekananda Institute, Eduparivartan, About Us, Mission, Vision"
        url="/about/svicsm"
      />
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://res.cloudinary.com/ditok7ztl/image/upload/v1775375424/20250807_112400_z9jz8q.jpg" 
            alt="SVICSM College Building" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-sv-blue/80 mix-blend-multiply" />
        </div>
        <div className="relative z-10 text-center px-4">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sv-gold font-bold uppercase tracking-widest text-sm block mb-4"
          >
            Since 2021
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6"
          >
            About SVICSM
          </motion.h1>
          <p className="text-gray-200 text-lg max-w-2xl mx-auto">
            The story of how Eduparivartan's "Fearless Exam Campaign" evolved into a premier educational institution.
          </p>
        </div>
      </section>

      {/* Main Content: Our Journey */}
      <section className="py-12">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-sv-blue mb-6">About SVICSM (Year of establishment: 2021)</h2>
            
            <div className="prose prose-lg text-gray-600">
              <p className="mb-6">
                <strong>Eduparivartan Intellectual Services LLP</strong> is the parent organisation of SVICSM. Working since 2012 in an educational sector through “fearless exam campaign”. It serves more than 5000+ students with the help of a team of 250+ intellectual persons.
              </p>
              <p className="mb-6">
                In 2021, Team Eduparivartan has decided to build an educational institution by the name <strong>Swami Vivekananda Institute</strong> to provide NEP2020 ready platform for students in rural sector. It aims to build future ready generations through modern formative assessments methodology and concept boat pattern.
              </p>
              <p className="mb-6">
                Swami Vivekananda Institute is a distinguished educational institution committed to fostering academic excellence and holistic development in students. Known for its strong values and student-centric approach, the institute offers a diverse range of programs in Commerce, Science, and Management, designed to equip students with both theoretical knowledge and practical skills relevant to today’s competitive world.
              </p>
              <p className="mb-6">
                In the Commerce stream, students explore subjects such as accounting, finance, business law, and economics, preparing them for careers in banking, finance, taxation, and entrepreneurship. The Science courses are tailored to inspire curiosity and scientific temper, covering key disciplines like physics, chemistry, biology, and mathematics, and enabling students to venture into research, technology, and higher studies. Meanwhile, the Management programs focus on developing leadership, strategic thinking, and organizational skills, with specializations in areas like marketing, human resources, and business analytics.
              </p>
              <p className="mb-6">
                At Swami Vivekananda Institute, the faculty comprises experienced educators who guide and mentor students with dedication. Alongside academic rigor, the institute emphasizes overall personality development through seminars, workshops, and extracurricular activities. With a supportive learning environment and modern facilities, Swami Vivekananda Institute empowers students to achieve their academic goals and build successful careers.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-sv-gold/10 transform translate-x-4 translate-y-4 rounded-2xl -z-10"></div>
            <img 
              src="https://res.cloudinary.com/ditok7ztl/image/upload/v1775375524/4_pg1dok.jpg" 
              alt="Campus Life" 
              className="rounded-2xl shadow-xl w-full"
            />
          </motion.div>
        </div>
      </section>

      {/* Current Offerings (The Result of the Journey) */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-sv-blue mb-4">What We Have Become</h2>
            <p className="text-gray-600">
              Today, SVICSM stands as a distinguished institution offering holistic development across three major streams.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Commerce Card */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-sv-maroon"
            >
              <div className="bg-sv-maroon/10 w-14 h-14 rounded-full flex items-center justify-center mb-6">
                <Target className="text-sv-maroon" size={28} />
              </div>
              <h3 className="text-xl font-bold text-sv-blue mb-3">Commerce</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                From accounting to entrepreneurship, we prepare students for the financial world.
              </p>
            </motion.div>

            {/* Science Card */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-sv-gold"
            >
              <div className="bg-sv-gold/10 w-14 h-14 rounded-full flex items-center justify-center mb-6">
                <Lightbulb className="text-sv-gold" size={28} />
              </div>
              <h3 className="text-xl font-bold text-sv-blue mb-3">Science</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                 Fostering scientific temper and research through practical application.
              </p>
            </motion.div>

            {/* Management Card */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-sv-blue"
            >
              <div className="bg-sv-blue/10 w-14 h-14 rounded-full flex items-center justify-center mb-6">
                <Users className="text-sv-blue" size={28} />
              </div>
              <h3 className="text-xl font-bold text-sv-blue mb-3">Management</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Developing the next generation of leaders with strategic and organizational skills.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Helper component for icon used in grid (needs to be defined or imported)
const Building2 = ({ size, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
);

export default AboutSVCMS;