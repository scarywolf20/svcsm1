import React from 'react';
import { motion } from 'framer-motion';
import { Linkedin, Mail, Quote, GraduationCap, Clock, Briefcase } from 'lucide-react';
import SEO from '../../components/SEO';

const leaders = [
  {
    name: "Mr. Kiran R. Arote",
    role: "Founder & Director",
    // Placeholder image used. Replace with: https://res.cloudinary.com/ditok7ztl/image/upload/v1770228406/20260126_084922_yi9vxl.jpg if that is his photo.
    image: "https://res.cloudinary.com/ditok7ztl/image/upload/v1775375285/20260126_084922_gy9wab.jpg", 
    qualifications: "Founder & CEO, Eduparivartan Intellectual Services LLP",
    experience: "Edupreneur since 2009 (17 Years)",
    bio: [
      "Education is undoubtedly one of the most important factors that impact the Growth and Development of a country as well as the future course of the country’s people as a whole. It is indeed a powerful tool to combat the cut-throat competition that man is faced with at every juncture in life.",
      "But education doesn’t mean to produce some personnel for corporate houses. ‘Skilling people’ is a big challenge for the whole world and nowhere more so than India. Instead of focusing on the high achievements of a few, we at Swami Vivekananda Institute concentrate on improving the educational ability of the whole, especially in the rural sector.",
      "Our focus is to bring about qualitative and value-based education to nurture our students to evolve as future global leaders. I am proud of being the Director of such a wonderful Institution dedicated to the causes for better India. Come on, let’s give our best and make this institution a modern temple of learning."
    ],
    quote: "We believe we are artists at work and the students we churn out are our work of art."
  },
  {
    name: "Mr. Chetan N. Bargal",
    role: "Principal",
    image: "https://res.cloudinary.com/ditok7ztl/image/upload/v1775375107/chetan_jjagd3.png",
    qualifications: "B.E. (Mechanical), MBA",
    experience: "10 Years of Experience",
    bio: [
      "Mr. Bargal brings a unique blend of technical precision and management expertise to the institute. With a strong background in Mechanical Engineering coupled with an MBA, he ensures academic rigor while fostering an environment of discipline and innovation.",
      "His leadership focuses on streamlining academic processes and ensuring that every student receives the mentorship required to excel in today's competitive landscape."
    ],
    quote: "Education is not just about the syllabus; it is about building the character to face life's challenges."
  }
];

const Leadership = () => {
  return (
    <div className="bg-white min-h-screen pt-5">
      <SEO 
        title="Leadership" 
        description="Meet the visionaries guiding SVICSM - Mr. Kiran R. Arote and Mr. Chetan N. Bargal."
        keywords="leadership, director, principal, SVICSM team, educational leaders"
        url="/about/leadership"
      />
      <section className="bg-sv-blue py-20 text-center relative overflow-hidden">
         {/* Decorative Background Blob */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-sv-gold/10 rounded-full blur-3xl -ml-16 -mb-16"></div>
         
         <div className="container mx-auto px-4 relative z-10">
            <h1 className="text-5xl font-bold text-white mb-4">Leadership</h1>
            <p className="text-xl text-gray-300">The visionaries guiding our path to excellence.</p>
         </div>
      </section>

      <section className="container mx-auto px-4 pt-14 pb-20 space-y-32">
        {leaders.map((leader, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={`flex flex-col md:flex-row gap-16 items-start ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}
          >
            {/* Image Card Section */}
            <div className="w-full md:w-1/3 flex-shrink-0">
              <div className="relative group">
                <div className={`absolute inset-0 bg-sv-maroon rounded-2xl transform translate-x-3 translate-y-3 transition-transform group-hover:translate-x-2 group-hover:translate-y-2`}></div>
                <img 
                  src={leader.image} 
                  alt={leader.name} 
                  className="relative w-full aspect-[3/4] object-cover rounded-2xl shadow-lg grayscale group-hover:grayscale-0 transition-all duration-500"
                />
                
                {/* Quick Stats Overlay */}
                <div className="absolute -bottom-6 left-6 right-6 bg-white p-4 rounded-xl shadow-xl border-l-4 border-sv-gold">
                  <div className="flex items-center gap-3 mb-2">
                    <GraduationCap className="text-sv-blue" size={18} />
                    <span className="text-xs font-bold text-gray-700">{leader.qualifications}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="text-sv-maroon" size={18} />
                    <span className="text-xs font-bold text-gray-700">{leader.experience}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="w-full md:w-2/3 pt-4">
              <div className="flex flex-col mb-6">
                <span className="text-sv-gold font-bold uppercase tracking-widest text-sm mb-2">{leader.role}</span>
                <h2 className="text-4xl font-bold text-sv-blue">{leader.name}</h2>
              </div>
              
              <div className="mb-8 relative pl-8 border-l-4 border-gray-200">
                <Quote className="absolute top-0 left-2 text-gray-100 -z-10" size={60} />
                <p className="text-2xl italic text-gray-600 font-serif leading-relaxed">
                  "{leader.quote}"
                </p>
              </div>

              <div className="space-y-4 text-gray-600 leading-relaxed text-lg mb-8">
                {leader.bio.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>

              {/* <div className="flex gap-4">
                <button className="flex items-center gap-2 px-6 py-2 border border-gray-300 rounded-full hover:bg-sv-blue hover:text-white hover:border-sv-blue transition-all group">
                  <Linkedin size={18} /> <span className="text-sm font-bold">Connect</span>
                </button>
                <button className="flex items-center gap-2 px-6 py-2 border border-gray-300 rounded-full hover:bg-sv-maroon hover:text-white hover:border-sv-maroon transition-all group">
                  <Mail size={18} /> <span className="text-sm font-bold">Email</span>
                </button>
              </div> */}
            </div>
          </motion.div>
        ))}
      </section>
    </div>
  );
};

export default Leadership;