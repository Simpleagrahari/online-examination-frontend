import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { Link } from 'react-router-dom';
import { getCourses, getSubjects, getExams, getUsers, getDashboardStats } from '../../api';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        students: 0,
        faculty: 0,
        exams: 0,
        subjects: 0,
        submissions: 0
    });
    const [upcomingExams, setUpcomingExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');
                const [courses, subjects, exams, backendStats] = await Promise.all([
                    getCourses(token),
                    getSubjects(token),
                    getExams(token),
                    getDashboardStats(token)
                ]);

                setStats({
                    students: backendStats.students,
                    faculty: backendStats.faculty,
                    exams: backendStats.totalExams,
                    subjects: subjects.length,
                    submissions: backendStats.totalSubmissions
                });


                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const sortedExams = exams
                    .filter(e => {
                        const examDate = new Date(e.date);
                        examDate.setHours(0, 0, 0, 0);
                        return examDate >= today;
                    })
                    .sort((a, b) => new Date(a.date) - new Date(b.date));
                setUpcomingExams(sortedExams.slice(0, 5));
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) return <AdminLayout> <div style={{ textAlign: 'center', padding: '50px' }}>Loading Stats...</div> </AdminLayout>;
    if (error) return <AdminLayout> <div style={{ color: 'red', textAlign: 'center', padding: '50px' }}>Error: {error}</div> </AdminLayout>;

    return (
        <AdminLayout>
            <div className="pg-intro">
                <h2>System Overview</h2>
                <p>Real-time platform statistics and activity</p>
            </div>
            <div className="row g-3 mb-4 ex-stat-row">
                <div className="col">
                    <div className="sc ci">
                        <div className="sc-icon d-inline-flex align-items-center justify-content-center" style={{ background: 'var(--s100)' }}>
                            <svg fill="none" height="19" stroke="var(--s500)" strokeWidth="2" viewBox="0 0 24 24" width="19">
                                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                            </svg>
                        </div>
                        <div className="sc-lbl">Total Students</div>
                        <div className="sc-val">{stats.students.toLocaleString()}</div>
                        <div className="sc-trend d-flex align-items-center gap-1 tup">▲ Platform Active</div>
                    </div>
                </div>
                <div className="col">
                    <div className="sc ca">
                        <div className="sc-icon d-inline-flex align-items-center justify-content-center" style={{ background: 'var(--abg)' }}>
                            <svg fill="none" height="19" stroke="var(--amber)" strokeWidth="2" viewBox="0 0 24 24" width="19">
                                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                        </div>
                        <div className="sc-lbl">Total Faculty</div>
                        <div className="sc-val">{stats.faculty}</div>
                        <div className="sc-trend d-flex align-items-center gap-1 tneu">— Managing System</div>
                    </div>
                </div>
                <div className="col">
                    <div className="sc cn">
                        <div className="sc-icon d-inline-flex align-items-center justify-content-center" style={{ background: 'var(--in1)' }}>
                            <svg fill="none" height="19" stroke="var(--in5)" strokeWidth="2" viewBox="0 0 24 24" width="19">
                                <path d="M9 11l3 3L22 4"></path>
                                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
                            </svg>
                        </div>
                        <div className="sc-lbl">Total Exams</div>
                        <div className="sc-val">{stats.exams}</div>
                        <div className="sc-trend d-flex align-items-center gap-1 tup">▲ All Schedules</div>
                    </div>
                </div>
                <div className="col">
                    <div className="sc cc">
                        <div className="sc-icon d-inline-flex align-items-center justify-content-center" style={{ background: 'var(--cy1)' }}>
                            <svg fill="none" height="19" stroke="var(--cy5)" strokeWidth="2" viewBox="0 0 24 24" width="19">
                                <path d="M4 19.5A2.5 2.5 0 016.5 17H20"></path>
                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"></path>
                            </svg>
                        </div>
                        <div className="sc-lbl">Subjects</div>
                        <div className="sc-val">{stats.subjects}</div>
                        <div className="sc-trend d-flex align-items-center gap-1 tup">▲ Active Courses</div>
                    </div>
                </div>
                <div className="col">
                    <div className="sc cr">
                        <div className="sc-icon d-inline-flex align-items-center justify-content-center" style={{ background: 'var(--rbg)' }}>
                            <svg fill="none" height="19" stroke="var(--red)" strokeWidth="2" viewBox="0 0 24 24" width="19">
                                <path d="M23 7l-7 5 7 5V7z"></path>
                                <rect height="14" rx="2" width="15" x="1" y="5"></rect>
                            </svg>
                        </div>
                        <div className="sc-lbl">Proctor Alerts</div>
                        <div className="sc-val">0</div>
                        <div className="sc-trend d-flex align-items-center gap-1 tdn">▼ Monitoring...</div>
                    </div>
                </div>
            </div>

            <div className="row g-3">
                <div className="col-12 col-xl-8">
                    <div className="card h-100">
                        <div className="cd-hd d-flex align-items-center justify-content-between">
                            <span className="cd-t">Upcoming Exams</span>
                            <Link className="cd-a" to="/admin/exams">View all →</Link>
                        </div>
                        <div className="tw">
                            <table className="tbl">
                                <thead>
                                    <tr>
                                        <th>Exam</th>
                                        <th>Subject</th>
                                        <th>Date</th>
                                        <th>Total Marks</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {upcomingExams.length === 0 ? (
                                        <tr><td colSpan="5" style={{ textAlign: 'center' }}>No upcoming exams found.</td></tr>
                                    ) : (
                                        upcomingExams.map(exam => (
                                            <tr key={exam._id}>
                                                <td><strong>{exam.name || exam.title}</strong></td>
                                                <td>{exam.subjectId?.name || 'Subject'}</td>
                                                <td>{new Date(exam.date).toLocaleDateString()} · {exam.time || '--:--'}</td>
                                                <td>{exam.totalMarks}</td>
                                                <td><span className={`badge ${new Date(exam.date).toDateString() === new Date().toDateString() ? 'b-live' : 'b-scheduled'}`}>
                                                    {new Date(exam.date).toDateString() === new Date().toDateString() ? '● Today' : 'Scheduled'}
                                                </span></td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-xl-4">
                    <div className="card h-100">
                        <div className="cd-hd d-flex align-items-center justify-content-between"><span className="cd-t">System Activity</span></div>
                        <div className="act-item d-flex gap-2 align-items-start">
                            <div className="act-dot" style={{ background: 'var(--green)' }}></div>
                            <div>
                                <div className="act-txt">System synced with backend · {stats.students} students connected</div>
                                <div className="act-time">Just now</div>
                            </div>
                        </div>
                        <div className="act-item d-flex gap-2 align-items-start">
                            <div className="act-dot" style={{ background: 'var(--in4)' }}></div>
                            <div>
                                <div className="act-txt">{stats.exams} total exam schedules verified</div>
                                <div className="act-time">1 hr ago</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
