import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const AdminLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [user, setUser] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const toggleNotif = () => setIsNotifOpen(!isNotifOpen);

    useEffect(() => {
        const storedUser = sessionStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            navigate('/admin/login');
        }

        const handleClickOutside = (e) => {
            if (!e.target.closest('.hdr-btn') && !e.target.closest('.ndrop')) {
                setIsNotifOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [navigate]);

    const handleLogout = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        navigate('/');
    };

    const getInitials = (name) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    const sidebarItems = [
        { label: 'Dashboard', path: '/admin/dashboard', icon: (
            <svg className="niv" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect height="7" width="7" x="3" y="3"></rect>
                <rect height="7" width="7" x="14" y="3"></rect>
                <rect height="7" width="7" x="14" y="14"></rect>
                <rect height="7" width="7" x="3" y="14"></rect>
            </svg>
        )},
        { label: 'User Management', path: '/admin/users', icon: (
            <svg className="niv" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
            </svg>
        ), badge: { text: '48', type: 'nb-c' }},
        { label: 'Faculty Management', path: '/admin/faculty', icon: (
            <svg className="niv" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
            </svg>
        ), badge: { text: '14', type: 'nb-c' }},
        { label: 'Exam Scheduling', path: '/admin/exams', icon: (
            <svg className="niv" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 11l3 3L22 4"></path>
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
            </svg>
        ), badge: { text: '2 live', type: 'nb-a' }},
        { label: 'Results & Reports', path: '/admin/results', icon: (
            <svg className="niv" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect height="14" rx="2" width="20" x="2" y="3"></rect>
                <line x1="8" x2="16" y1="21" y2="21"></line>
                <line x1="12" x2="12" y1="17" y2="21"></line>
            </svg>
        )},
        { label: 'AI Proctor Logs', path: '/admin/proctor', icon: (
            <svg className="niv" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M23 7l-7 5 7 5V7z"></path>
                <rect height="14" rx="2" width="15" x="1" y="5"></rect>
            </svg>
        ), badge: { text: '3', type: 'nb-r' }}
    ];

    if (!user) return null;

    return (
        <div style={{ background: 'var(--off)', minHeight: '100vh' }}>
            <div className="shell mt-0">
                <div className="row g-0 h-100">
                    <div className="col-auto">
                        <aside className={`sidebar d-flex flex-column ${isSidebarOpen ? 'ex-sidebar-open' : ''}`}>
                            <div className="sb-head">
                                <div className="sb-logo d-flex align-items-center gap-2 mb-3">
                                    <div className="sb-mark sm-adm d-flex align-items-center justify-content-center">
                                        <svg fill="none" height="18" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24" width="18">
                                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="sb-name">ExamControl</div>
                                        <div className="sb-sub">AI Proctoring System</div>
                                    </div>
                                </div>
                                <div className="sb-pill sp-adm">⚙ Admin Zone</div>
                                <div className="sb-user d-flex align-items-center gap-2">
                                    <div className="sb-av av-adm d-flex align-items-center justify-content-center">{getInitials(user.name)}</div>
                                    <div>
                                        <div className="sb-uname">{user.name}</div>
                                        <div className="sb-urole">{user.email}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="sb-sec">Overview</div>
                            {sidebarItems.slice(0, 1).map((item) => (
                                <Link key={item.path} className={`ni d-flex align-items-center gap-2 ${location.pathname === item.path ? 'active' : ''}`} to={item.path}>
                                    {item.icon}
                                    <span className="nav-lbl">{item.label}</span>
                                    {item.badge && <span className={`nbg ${item.badge.type}`}>{item.badge.text}</span>}
                                </Link>
                            ))}

                            <div className="sb-sec">Management</div>
                            {sidebarItems.slice(1, 5).map((item) => (
                                <Link key={item.path} className={`ni d-flex align-items-center gap-2 ${location.pathname === item.path ? 'active' : ''}`} to={item.path}>
                                    {item.icon}
                                    <span className="nav-lbl">{item.label}</span>
                                    {item.badge && <span className={`nbg ${item.badge.type}`}>{item.badge.text}</span>}
                                </Link>
                            ))}

                            <div className="sb-sec">Account</div>
                            {sidebarItems.slice(5).map((item) => (
                                <Link key={item.path} className={`ni d-flex align-items-center gap-2 ${location.pathname === item.path ? 'active' : ''}`} to={item.path}>
                                    {item.icon}
                                    <span className="nav-lbl">{item.label}</span>
                                    {item.badge && <span className={`nbg ${item.badge.type}`}>{item.badge.text}</span>}
                                </Link>
                            ))}

                            <div className="sb-foot mt-auto">
                                <button className="sb-out d-flex align-items-center gap-2 w-100" style={{ background: 'none', border: 'none', textAlign: 'left', color: 'var(--g400)' }} onClick={handleLogout}>
                                    <svg fill="none" height="15" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="15">
                                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"></path>
                                        <polyline points="16 17 21 12 16 7"></polyline>
                                    </svg>
                                    Sign Out
                                </button>
                            </div>
                        </aside>
                    </div>

                    <div className="col main d-flex flex-column h-100 overflow-hidden">
                        <div className="pg-body flex-grow-1 overflow-auto pt-4 px-4">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
