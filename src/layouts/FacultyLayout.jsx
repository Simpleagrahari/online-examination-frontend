import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../components/faculty/FacultyStyles.css';

const FacultyLayout = ({ children, pageTitle = 'Dashboard' }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            navigate('/faculty/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const getInitials = (name) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    const sidebarItems = [
        { label: 'Dashboard', path: '/faculty/dashboard', icon: (
            <svg className="niv" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect height="7" width="7" x="3" y="3"></rect>
                <rect height="7" width="7" x="14" y="3"></rect>
                <rect height="7" width="7" x="14" y="14"></rect>
                <rect height="7" width="7" x="3" y="14"></rect>
            </svg>
        )},
        { label: 'Manage Courses', path: '/faculty/dashboard?p=courses', icon: (
            <svg className="niv" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M4 19.5A2.5 2.5 0 016.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"></path>
            </svg>
        )},
        { label: 'Subjects', path: '/faculty/dashboard?p=subjects', icon: (
            <svg className="niv" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
        )},
        { label: 'Exams', path: '/faculty/dashboard?p=exams', icon: (
            <svg className="niv" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 11l3 3L22 4"></path>
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
            </svg>
        ), badge: { text: '2 live', type: 'nb-r' }},
        { label: 'Question Bank', path: '/faculty/dashboard?p=qbank', icon: (
            <svg className="niv" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"></path>
                <line x1="12" x2="12.01" y1="17" y2="17"></line>
            </svg>
        ), badge: { text: '140', type: 'nb-c' }},
        { label: 'Live Monitoring', path: '/faculty/monitor', icon: (
            <svg className="niv" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M23 7l-7 5 7 5V7z"></path>
                <rect height="14" rx="2" width="15" x="1" y="5"></rect>
            </svg>
        ), badge: { text: 'Live', type: 'nb-r' }},
        { label: 'Results & Evaluation', path: '/faculty/results', icon: (
            <svg className="niv" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect height="14" rx="2" width="20" x="2" y="3"></rect>
                <line x1="8" x2="16" y1="21" y2="21"></line>
            </svg>
        )}
    ];

    const isActive = (path) => {
        const [itemPath, itemQuery] = path.split('?');
        const currentPath = location.pathname;
        const currentQuery = location.search.slice(1);
        if (itemPath !== currentPath) return false;
        if (!itemQuery) return !currentQuery || currentQuery === 'p=courses';
        return currentQuery === itemQuery;
    };

    if (!user) return null;

    return (
        <div className="faculty-portal-root">
            <div className="shell mt-0">
                <aside className={`sidebar ${isSidebarOpen ? 'ex-sidebar-open' : ''}`}>
                    <div className="sb-head">
                        <div className="sb-logo">
                            <div className="sb-mark sm-fac">
                                <svg fill="none" height="18" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24" width="18">
                                    <path d="M4 19.5A2.5 2.5 0 016.5 17H20"></path>
                                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"></path>
                                </svg>
                            </div>
                            <div>
                                <div className="sb-name">ExamControl</div>
                                <div className="sb-sub">Faculty Portal</div>
                            </div>
                        </div>
                        <div className="sb-pill sp-fac">🎓 Faculty Zone</div>
                        <div className="sb-user d-flex align-items-center gap-2">
                            <div className="sb-av av-fac">{getInitials(user.name)}</div>
                            <div>
                                <div className="sb-uname">{user.name}</div>
                                <div className="sb-urole">{user.dept || 'Department'}</div>
                            </div>
                        </div>
                    </div>

                    <div className="sb-sec" style={{ marginTop: '4px' }}>Main</div>
                    {sidebarItems.map((item, idx) => (
                        <Link key={idx} className={`ni ${isActive(item.path) ? 'active' : ''}`} to={item.path}>
                            {item.icon}
                            {item.label}
                            {item.badge && <span className={`nbg ${item.badge.type}`}>{item.badge.text}</span>}
                        </Link>
                    ))}

                    <div className="sb-foot">
                        <button className="sb-out w-100" onClick={handleLogout} style={{ background: 'none', border: 'none', textAlign: 'left', color: 'var(--g400)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <svg fill="none" height="15" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="15">
                                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"></path>
                                <polyline points="16 17 21 12 16 7"></polyline>
                            </svg>
                            Sign Out
                        </button>
                    </div>
                </aside>

                <div className="main d-flex flex-column" style={{ minWidth: 0, flex: 1 }}>
                    <div className="pg-body pt-4 px-4 overflow-auto h-100">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FacultyLayout;
