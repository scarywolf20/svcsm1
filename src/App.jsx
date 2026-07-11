import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { ToastProvider } from "./context/ToastContext";

// Layout Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Main Landing Page
import HomePage from "./pages/HomePage"; 

//About Us Pages
import AboutSVCMS from "./pages/AboutUs/AboutSVCSMS"; 
import VisionMission from "./pages/AboutUs/VisionMission"; 
import Leadership from "./pages/AboutUs/LeaderShip"; 

//Academics Pages
import CoursesCurriculum from "./pages/Academics/CourseCurriculum"; // Ensure this matches your actual filename (CourseCurriculum.jsx)
import Faculty from "./pages/Academics/Faculty";
import Results from "./pages/Academics/Results";

//Admissions Pages
import AdmissionProcessPage from "./pages/Admission/AdmissionProcessPage";
import FeeStructure from "./pages/Admission/FeeStructure";
import Scholarships from "./pages/Admission/Scholarships";
import JuniorAdmissionForm from "./pages/Admission/JuniorAdmissionForm";
import SeniorAdmissionForm from "./pages/Admission/SeniorAdmissionForm";
import AdmissionForm from "./pages/Admission/SeniorAdmissionForm";

//Campus Life Pages
import ActivitiesEvents from "./pages/CampusLife/ActivitiesEvents";
import GalleryPage from "./pages/CampusLife/GalleryPage";
import TestimonialsPage from "./pages/CampusLife/TestimonialsPage";

//Admin Pages
import AdminLogin from "./pages/Admin/AdminLogin";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminLayout from "./pages/Admin/AdminLayout";
import AdminJuniorAdmissions from "./pages/Admin/AdminJuniorAdmissions";
import AdminSeniorAdmissions from "./pages/Admin/AdminSeniorAdmissions";
import AdminHeroSettings from "./pages/Admin/AdminHeroSettings";
import AdminNoticesNews from "./pages/Admin/AdminNoticesNews";
import AdminFaculty from "./pages/Admin/AdminFaculty";
import AdminActivitiesEvents from "./pages/Admin/AdminActivitiesEvents";
import AdminTestimonials from "./pages/Admin/AdminTestimonials";
import AdminGallery from "./pages/Admin/AdminGallery";
import AdminAdmissionControl from "./pages/Admin/AdminAdmissionControl";

import TestAdmissionForm from "./pages/Admission/TestAddForm";
import JuniorAdmissionPDF from "./components/PDF/JuniorAdmissionPDF";

// Helper to scroll to top on route change
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // If there is a hash, scroll to the element
    if (hash) {
      // Small timeout to allow content to render
      setTimeout(() => {
        const element = document.getElementById(hash.substring(1));
        if (element) {
          const headerOffset = 100;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
          });
        }
      }, 100);
    } else {
      // Otherwise scroll to top
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
};

const RequireAdminAuth = ({ children }) => {
  const [status, setStatus] = useState({ loading: true, user: null });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setStatus({ loading: false, user });
    });
    return unsubscribe;
  }, []);

  if (status.loading) return null;
  if (!status.user) return <Navigate to="/admin/login" replace />;
  return children;
};

// Main Layout Component to handle Conditional Rendering
const Layout = () => {
  const location = useLocation();
  
  // Check if the current route is an Admin route
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="relative font-sans antialiased text-gray-900 bg-white">
      <ScrollToTop />

      {/* HIDE Navbar on Admin Pages.
        Only show Navbar if isAdminRoute is false.
      */}
      {!isAdminRoute && <Navbar />}
      
      <Routes>
        {/* Main Landing Page */}
        <Route path="/" element={<HomePage />} />
        
        {/* About Us */}
        <Route path="/about/svicsm" element={<AboutSVCMS />} />
        <Route path="/about/vision" element={<VisionMission />} />
        <Route path="/about/leadership" element={<Leadership />} />

        {/* Academics */}
        <Route path="/curriculum" element={<CoursesCurriculum />} />
        <Route path="/academics/faculty" element={<Faculty />} />
        <Route path="/academics/results" element={<Results />} />

        {/* Admissions */}
        <Route path="/admissions/process" element={<AdmissionProcessPage />} />
        <Route path="/admissions/fees" element={<FeeStructure />} />
        <Route path="/admissions/scholarships" element={<Scholarships />} />  
        <Route path="/admissions/junior-form" element={<JuniorAdmissionForm />} />
        <Route path="/admissions/senior-form" element={<SeniorAdmissionForm />} />
        {/* <Route path="/admissions/senior-form" element={<AdmissionForm />} /> */}
        <Route path="/admissions/test" element={<TestAdmissionForm />} />
        <Route path="/admissions/junior-admission-pdf" element={<JuniorAdmissionPDF />} />
        
        {/* Campus Life */}
        <Route path="/campus-life/activities-events" element={<ActivitiesEvents />} />
        <Route path="/campus-life/gallery" element={<GalleryPage />} />
        <Route path="/campus-life/testimonials" element={<TestimonialsPage />} />

        {/* --- ADMIN ROUTES --- */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <RequireAdminAuth>
              <AdminLayout />
            </RequireAdminAuth>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="junior-admissions" element={<AdminJuniorAdmissions />} />
          <Route path="senior-admissions" element={<AdminSeniorAdmissions />} />
          <Route path="admission-control" element={<AdminAdmissionControl />} />
          <Route path="hero" element={<AdminHeroSettings />} />
          <Route path="faculty" element={<AdminFaculty />} />
          <Route path="activities" element={<AdminActivitiesEvents />} />
          <Route path="testimonials" element={<AdminTestimonials />} />
          <Route path="gallery" element={<AdminGallery />} />
          <Route path="courses" element={<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center text-sm text-gray-500">This section will be implemented next.</div>} />
          <Route path="notices" element={<AdminNoticesNews />} />
          <Route path="settings" element={<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center text-sm text-gray-500">This section will be implemented next.</div>} />
        </Route>
      </Routes>

      {/* HIDE Footer on Admin Pages */}
      {!isAdminRoute && <Footer />}
    </div>
  );
};

import { HelmetProvider } from 'react-helmet-async';

export default function App() {
  return (
    <HelmetProvider>
      <Router>
        <ToastProvider>
          <Layout />
        </ToastProvider>
      </Router>
    </HelmetProvider>
  );
}