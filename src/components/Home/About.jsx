import React from 'react';
import { motion } from 'framer-motion';
import { Quote, ArrowRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <section className="py-24 bg-white overflow-hidden" id="about">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          
          {/* Image Side - Founder Profile */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="relative h-[520px] flex items-end justify-center"
          >
            {/* The Background Frame */}
            <div className="absolute bottom-0 w-[90%] h-[95%] bg-sv-blue rounded-3xl border-4 border-sv-gold shadow-2xl overflow-hidden">
               <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#B8860B_1px,transparent_1px)] [background-size:16px_16px]"></div>
               <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-sv-blue to-transparent"></div>
            </div>

            {/* The Image */}
            <img 
              src="https://res.cloudinary.com/ditok7ztl/image/upload/v1775374889/img_x68kxj.png" 
              alt="Mr. Kiran R. Arote" 
              className="relative z-10 h-full w-full object-contain object-bottom drop-shadow-2xl"
            />

            {/* Updated Name Plate */}
            <div className="absolute -bottom-6 z-20 bg-white py-4 px-8 rounded-xl shadow-xl border-t-4 border-sv-maroon text-center min-w-[260px]">
              <p className="font-bold text-sv-blue text-xl">Mr. Kiran R. Arote</p>
              <p className="text-xs font-bold text-sv-gold tracking-widest uppercase mt-1">Founder & Director</p>
            </div>
          </motion.div>

          {/* Text Side - Concise Summary */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          >
            <span className="text-sv-maroon font-bold uppercase tracking-widest text-sm flex items-center gap-2">
              <BookOpen size={16} />
              5 Years of Excellence
            </span>
            
            <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-6">
              A Modern Temple of <br/> <span className="text-sv-blue">Learning & Values</span>
            </h2>
            
            <p className="text-gray-600 text-lg leading-relaxed mb-6 italic border-l-4 border-sv-gold pl-4">
              "We believe we are artists at work, and the students we churn out are our work of art."
            </p>

            <p className="text-gray-600 mb-6">
              Established in 2021 under <strong>Eduparivartan Intellectual Services</strong>, SVICSM is dedicated to empowering the rural sector with NEP2020-ready platforms. We focus not just on skilling, but on nurturing future global leaders through a blend of academic rigor and traditional values.
            </p>

            {/* Mission Highlight Box */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-gray-50 p-6 rounded-xl border border-gray-100 mb-8"
            >
              <div className="flex gap-4 mb-2">
                <div className="w-10 h-10 bg-sv-blue/10 rounded-full flex items-center justify-center text-sv-blue shrink-0">
                  <Quote size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">Our Mission</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    To stimulate scientific enquiry, provide state-of-the-art infrastructure, and impart entrepreneurial skills for career readiness.
                  </p>
                </div>
              </div>
            </motion.div>

            <Link 
              to="/about/leadership" 
              className="inline-flex items-center gap-2 text-sv-maroon font-bold border-b-2 border-sv-maroon hover:text-red-900 hover:border-red-900 pb-1 transition-all group"
            >
              Read Director's Full Message 
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default About;