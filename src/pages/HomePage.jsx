// src/pages/Home.jsx
import React from 'react';
import Hero from "../components/Home/Hero";
import About from "../components/Home/About";
import Courses from "../components/Home/Courses";
import Stats from "../components/Home/Stats";
import AdmissionProcess from "../components/Home/AdmissionProcess";
import CampusLife from "../components/Home/CampusLife";
import Testimonials from "../components/Home/Testimonials";
import SEO from "../components/SEO";

const HomePage = () => {
  return (
    <>
      <SEO 
        title="Home" 
        description="Swami Vivekananda Composite School & Junior College - Providing quality education in Arts, Commerce, and Science with state-of-the-art facilities."
        keywords="school, junior college, education, nashik, arts, commerce, science, best college,svicsm, svicsm nashik, svicsm college, svicsm school, svicsm junior college"
      />
      <Hero />
      <About />
      <Courses />
      <Stats />
      <AdmissionProcess />
      <CampusLife />
      <Testimonials />
    </>
  );
};

export default HomePage;