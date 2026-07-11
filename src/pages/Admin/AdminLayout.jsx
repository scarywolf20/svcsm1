import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  Calendar,
  GraduationCap,
  Image,
  Settings,
  LogOut,
  Menu,
  Bell,
  Search,
} from 'lucide-react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import AdminNotifications from '../../components/Admin/AdminNotifications';
import SEO from '../../components/SEO';
import logoName from '../../assets/logo-name.png';
import logoIcon from '../../assets/logo.png';

const MotionAside = motion.aside;

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/junior-admissions', label: 'Junior Admissions', icon: Users },
    { path: '/admin/senior-admissions', label: 'Senior Admissions', icon: Users },
    { path: '/admin/admission-control', label: 'Admission Control', icon: Settings },
    { path: '/admin/hero', label: 'Hero Section', icon: Image },
    { path: '/admin/faculty', label: 'Faculty', icon: GraduationCap },
    { path: '/admin/activities', label: 'Activities & Events', icon: Calendar },
    // { path: '/admin/courses', label: 'Manage Courses', icon: BookOpen },
    { path: '/admin/notices', label: 'Notices & News', icon: FileText },
    { path: '/admin/gallery', label: 'Gallery', icon: Image },
    { path: '/admin/testimonials', label: 'Testimonials', icon: Users },
    // { path: '/admin/settings', label: 'Settings', icon: Settings 
  ];

  const activeItem = menuItems.find((item) => location.pathname.startsWith(item.path));

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/admin/login');
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
      <SEO 
        title="Admin Portal" 
        description="SVICSM Administration Dashboard."
        url="/admin"
      />
      <MotionAside
        initial={false}
        animate={{ width: isSidebarOpen ? 256 : 80 }}
        className="bg-sv-blue text-white flex flex-col shadow-2xl z-20 flex-shrink-0"
      >
        <div className="h-16 flex items-center justify-center border-b border-white/10 px-2">
          {isSidebarOpen ? (
            <img src={logoName} alt="SVICSM" className="h-full w-full object-contain" />
          ) : (
            <img src={logoIcon} alt="SVICSM" className="h-full w-full object-contain p-3" />
          )}
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all group whitespace-nowrap overflow-hidden ${
                  isActive
                    ? 'bg-sv-gold text-sv-blue font-bold shadow-md'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="min-w-[20px]">
                  <item.icon size={20} className={isActive ? 'text-sv-blue' : 'text-gray-400 group-hover:text-white'} />
                </div>

                {isSidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 bg-blue-950/30">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 text-red-400 hover:text-red-300 transition-colors w-full px-3 py-2 ${
              !isSidebarOpen && 'justify-center'
            }`}
          >
            <LogOut size={20} />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </MotionAside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 z-10 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold text-gray-800 hidden sm:block">{activeItem?.label || 'Admin'}</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-sv-blue focus:bg-white w-64 transition-all"
              />
            </div>

            <div className="z-50">
              <AdminNotifications />
            </div>

            <div className="flex items-center gap-3 pl-4 border-l border-gray-200 ml-2">
              <div className="text-right hidden md:block leading-tight">
                <p className="text-sm font-bold text-gray-800">Administrator</p>
                <p className="text-xs text-gray-500">Super Admin</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-sv-maroon text-white flex items-center justify-center font-bold shadow-sm">
                A
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
