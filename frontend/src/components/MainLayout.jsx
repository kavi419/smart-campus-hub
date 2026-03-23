import React from 'react';
import { motion } from 'framer-motion';
import { 
  Home, 
  Calendar, 
  AlertTriangle, 
  Settings, 
  LogOut, 
  User, 
  Menu,
  Bell,
  School
} from 'lucide-react';
import './MainLayout.css';

const MainLayout = ({ children, authUser, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const isAdmin = authUser?.role === 'ADMIN';

  const NavItem = ({ icon: Icon, label, active = false, onClick }) => (
    <motion.div
      whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
      whileTap={{ scale: 0.98 }}
      className={`nav-item ${active ? 'active' : ''}`}
      onClick={onClick}
    >
      <Icon size={20} />
      {isSidebarOpen && <span className="nav-label">{label}</span>}
    </motion.div>
  );

  return (
    <div className="layout-container">
      {/* Sidebar */}
      <motion.aside 
        initial={{ width: 250 }}
        animate={{ width: isSidebarOpen ? 250 : 80 }}
        className="sidebar glass-panel"
      >
        <div className="sidebar-header">
           <div className="logo-container">
             <School size={28} className="logo-icon" color="#38bdf8" />
             {isSidebarOpen && (
                <motion.h1 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="logo-text"
                >
                  Smart Campus
                </motion.h1>
             )}
           </div>
          
          <button 
            className="toggle-btn"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu size={20} color="#fff" />
          </button>
        </div>

        <nav className="sidebar-nav">
          <NavItem icon={Home} label="Dashboard" active />
          <NavItem icon={Calendar} label="Bookings" />
          <NavItem icon={AlertTriangle} label="Incidents" />
          {isAdmin && (
            <NavItem icon={Settings} label="Admin Panel" />
          )}
        </nav>

        <div className="sidebar-footer">
          <NavItem icon={LogOut} label="Logout" onClick={onLogout} />
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="main-wrapper">
        {/* Header */}
        <header className="header glass-panel">
          <div className="header-breadcrumbs">
            <span>Home</span> / <span>Dashboard</span>
          </div>
          <div className="header-actions">
             <div className="notification-wrapper">
                <Bell size={20} />
                <span className="badge-dot"></span>
             </div>
             <div className="user-profile">
                <div className="avatar">
                    <User size={18} />
                </div>
                <span className="username">{authUser?.name || authUser?.email || 'User'}</span>
             </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="content-area">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="footer">
          <p>© 2026 Smart Campus Hub. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;
