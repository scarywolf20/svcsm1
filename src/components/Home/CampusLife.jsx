import React from 'react';
import { motion } from 'framer-motion'; // Added Import
import { Link } from 'react-router-dom';

const CampusLife = () => {
  // Variant for Staggered Animation
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2 // Delay between each child animation
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <section className="py-24 bg-white" id="campus">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4"
        >
          <div>
            <span className="text-sv-maroon font-bold uppercase tracking-widest text-sm">Gallery</span>
            <h2 className="text-4xl font-bold text-sv-blue mt-2">Life on Campus</h2>
          </div>
          <Link to="/campus-life/gallery" className="text-sv-maroon font-semibold border-b-2 border-sv-maroon hover:text-sv-blue hover:border-sv-blue transition-all">
            View All Photos
          </Link>
        </motion.div>

        {/* Grid Container with Stagger */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 h-[600px]"
        >
          {/* Main Large Image */}
          <motion.div variants={itemVariants} className="md:col-span-2 md:row-span-2 relative group overflow-hidden rounded-2xl">
            <img 
              src="https://res.cloudinary.com/ditok7ztl/image/upload/v1775375880/IMG_20220708_113408_xpnr1u.jpg" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              alt="Library" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-8">
              <h3 className="text-white text-xl font-bold translate-y-4 group-hover:translate-y-0 transition-transform">Field Visits</h3>
            </div>
          </motion.div>
          
          {/* Top Right */}
          <motion.div variants={itemVariants} className="md:col-span-2 relative group overflow-hidden rounded-2xl">
            <img 
              src="https://res.cloudinary.com/ditok7ztl/image/upload/v1775375424/20250807_112400_z9jz8q.jpg" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              alt="Lab" 
            />
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-4 py-1 rounded text-sm font-bold text-sv-blue">Campus</div>
          </motion.div>

          {/* Bottom Right 1 */}
          <motion.div variants={itemVariants} className="relative group overflow-hidden rounded-2xl">
            <img 
              src="https://res.cloudinary.com/ditok7ztl/image/upload/v1775376042/IMG-20250112-WA0059_s0z1y3.jpg" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              alt="Sports" 
            />
             <div className="absolute bottom-4 left-4 bg-sv-maroon px-4 py-1 rounded text-sm font-bold text-white">Competitions</div>
          </motion.div>

          {/* Bottom Right 2 */}
          <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl bg-sv-blue flex items-center justify-center p-6 text-center group cursor-pointer hover:bg-sv-maroon transition-colors">
            <div>
              <h3 className="text-4xl font-bold text-white mb-1">10+</h3>
              <p className="text-white/70 group-hover:text-white">Activites</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CampusLife;