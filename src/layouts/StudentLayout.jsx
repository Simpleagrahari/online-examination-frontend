import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const StudentLayout = ({ children, pageTitle = 'Student Portal' }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = sessionStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        toast.info('Logged out successfully');
        navigate('/login');
    };

    const getInitials = (name) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    const sidebarItems = [
        { label: 'My Dashboard', path: '/student/dashboard', icon: (
            <svg className="niv" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect height="7" width="7" x="3" y="3"></rect>
                <rect height="7" width="7" x="14" y="3"></rect>
                <rect height="7" width="7" x="14" y="14"></rect>
                <rect height="7" width="7" x="3" y="14"></rect>
            </svg>
        )},
        { label: 'Face Authentication', path: '/student/faceauth', icon: (
            <svg className="niv" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M23 7l-7 5 7 5V7z"></path>
                <rect height="14" rx="2" width="15" x="1" y="5"></rect>
            </svg>
        )},
        { label: 'Exam History', path: '/student/results', icon: (
            <svg className="niv" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 20V10"></path>
                <path d="M18 20V4"></path>
                <path d="M6 20v-4"></path>
            </svg>
        )},
        { label: 'Notifications', path: '/student/notifications', icon: (
            <svg className="niv" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 01-3.46 0"></path>
            </svg>
        ), badge: { text: '3', type: 'nb-r' }}
    ];

    if (!user) return null;

    return (
        <div className="student-portal-root">
            <div className="shell mt-0">
                <div className="row g-0 h-100">
                    <div className="col-auto h-100">
                        {/* Sidebar exactly as original HTML */}
                        <aside className={`sidebar d-flex flex-column h-100 ${isSidebarOpen ? 'ex-sidebar-open' : ''}`}>
                            <div className="sb-head">
                                <div className="sb-logo d-flex align-items-center gap-2 mb-3">
                                    <div className="sb-mark sm-std d-flex align-items-center justify-content-center">
                                        <svg fill="none" height="20" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24" width="20">
                                            <path d="M12 14l9-5-9-5-9 5 9 5z"></path>
                                            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path>
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="sb-name">ExamControl</div>
                                        <div className="sb-sub">Student Portal</div>
                                    </div>
                                </div>
                                <div className="sb-pill sp-std">🎓 STUDENT ZONE</div>
                                <div className="sb-user d-flex align-items-center gap-2">
                                    <div className="sb-av av-std d-flex align-items-center justify-content-center position-relative">
                                        {getInitials(user.name)}
                                        {user.faceImage && <span className="position-absolute bottom-0 end-0 bg-success border border-dark rounded-circle" style={{ width:'10px', height:'10px' }}></span>}
                                    </div>
                                    <div>
                                        <div className="sb-uname d-flex align-items-center gap-1">
                                            {user.name}
                                            {user.faceImage && <svg fill="#22c55e" height="12" viewBox="0 0 24 24" width="12"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path></svg>}
                                        </div>
                                        <div className="sb-urole text-truncate" style={{ maxWidth:'120px' }}>{user.rollNo || 'N/A'} · {user.dept || 'N/A'}</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="sb-sec">Main Menu</div>
                            <div className="flex-grow-1 overflow-auto">
                                {sidebarItems.map((item) => (
                                    <Link key={item.path} className={`ni d-flex align-items-center gap-2 ${location.pathname === item.path ? 'active' : ''}`} to={item.path}>
                                        {item.icon}
                                        <span className="nav-lbl">{item.label}</span>
                                        {item.badge && <span className={`nbg ${item.badge.type}`}>{item.badge.text}</span>}
                                    </Link>
                                ))}
                            </div>

                            <div className="sb-foot mt-auto">
                                <button className="sb-out d-flex align-items-center gap-2 w-100 bg-transparent border-0" onClick={handleLogout}>
                                    <svg fill="none" height="15" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="15">
                                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"></path>
                                        <polyline points="16 17 21 12 16 7"></polyline>
                                    </svg>
                                    Sign Out
                                </button>
                            </div>
                        </aside>
                    </div>

                    <div className="col h-100 overflow-hidden">
                        <main className="main d-flex flex-column h-100">
                            <div className="pg-body flex-grow-1 overflow-auto pt-4 px-4">
                                {children}
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentLayout;
