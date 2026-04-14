import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StudentLayout from '../../layouts/StudentLayout';
import { getExams, getMyResults, fetchProfile } from '../../api';

const StudentDashboard = () => {
    const [exams, setExams] = useState([]);
    const [results, setResults] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('No authentication token found');
                
                const [examsData, resultsData, profileData] = await Promise.all([
                    getExams(token),
                    getMyResults(token),
                    fetchProfile(token)
                ]);
                
                setExams(examsData);
                setResults(resultsData);
                setProfile(profileData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, []);

    // Logic for Stats
    const upcomingExams = exams.filter(e => {
        const examDate = new Date(e.date);
        const now = new Date();
        return examDate >= now.setHours(0,0,0,0) && e.status !== 'completed';
    });

    const completedCount = results.length;
    
    // Calculate Average Score
    const totalScore = results.reduce((acc, curr) => acc + (curr.score || 0), 0);
    const totalMax = results.reduce((acc, curr) => acc + (curr.examId?.totalMarks || 100), 0);
    const avgScore = results.length > 0 ? Math.round((totalScore / totalMax) * 100) : 0;

    if (loading) return <StudentLayout><div style={{ textAlign: 'center', padding: '50px' }}>Loading your dashboard...</div></StudentLayout>;

    return (
        <StudentLayout>
            <div className="pg-intro d-flex align-items-center justify-content-between flex-wrap gap-2">
                <div>
                    <h2>Welcome back, {profile?.name || 'Student'}!</h2>
                    <p>Track your exams, results, and overall academic performance</p>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '700', fontSize: '14px' }}>{profile?.dept || 'General Dept.'}</div>
                        <div style={{ fontSize: '11px', color: 'var(--g400)' }}>Roll: {profile?.rollNo || 'N/A'}</div>
                    </div>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--std1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--std)', fontWeight: 'bold' }}>
                        {profile?.name?.charAt(0) || 'S'}
                    </div>
                </div>
            </div>

            <div className="row row-cols-1 row-cols-md-3 g-3 mb-4 ex-stat-row">
                <div className="col">
                    <div className="sc cn">
                        <div className="sc-icon d-inline-flex align-items-center justify-content-center" style={{ background: 'var(--std1)' }}>
                            <svg fill="none" height="19" stroke="var(--std)" strokeWidth="2" viewBox="0 0 24 24" width="19">
                                <path d="M9 11l3 3L22 4"></path>
                                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
                            </svg>
                        </div>
                        <div className="sc-lbl">Upcoming Exams</div>
                        <div className="sc-val">{upcomingExams.length}</div>
                        <div className="sc-trend d-flex align-items-center gap-1 tdn">
                            {upcomingExams.length > 0 ? `⚠ ${upcomingExams.length} scheduled` : 'No upcoming exams'}
                        </div>
                    </div>
                </div>
                <div className="col">
                    <div className="sc cg">
                        <div className="sc-icon d-inline-flex align-items-center justify-content-center" style={{ background: 'var(--gbg)' }}>
                            <svg fill="none" height="19" stroke="var(--green)" strokeWidth="2" viewBox="0 0 24 24" width="19">
                                <rect height="14" rx="2" width="20" x="2" y="3"></rect>
                            </svg>
                        </div>
                        <div className="sc-lbl">Completed Exams</div>
                        <div className="sc-val">{completedCount}</div>
                        <div className="sc-trend d-flex align-items-center gap-1 tup">▲ {completedCount} submissions</div>
                    </div>
                </div>
                <div className="col">
                    <div className="sc ca">
                        <div className="sc-icon d-inline-flex align-items-center justify-content-center" style={{ background: 'var(--abg)' }}>
                            <svg fill="none" height="19" stroke="var(--amber)" strokeWidth="2" viewBox="0 0 24 24" width="19">
                                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                            </svg>
                        </div>
                        <div className="sc-lbl">Average Score</div>
                        <div className="sc-val">{avgScore}%</div>
                        <div className="sc-trend d-flex align-items-center gap-1 tup">▲ Based on history</div>
                    </div>
                </div>
            </div>

            {upcomingExams.length > 0 && (
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2" 
                     style={{ background: 'linear-gradient(135deg, var(--in5), #4338ca)', borderRadius: 'var(--rl)', padding: '20px 25px', marginBottom: '18px', boxShadow: '0 4px 15px rgba(67, 56, 202, 0.2)' }}>
                    <div className="d-flex align-items-center gap-3">
                        <div className="d-flex align-items-center justify-content-center" style={{ width: '54px', height: '54px', borderRadius: '14px', background: 'rgba(255,255,255,.2)', fontSize: '24px' }}>📁</div>
                        <div>
                            <div style={{ fontFamily: 'var(--fd)', fontSize: '16px', fontWeight: '800', color: '#fff' }}>{upcomingExams[0].name}</div>
                            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,.8)' }}>
                                {upcomingExams[0].subjectId?.name || 'Exam'} · {upcomingExams[0].duration} Mins · {new Date(upcomingExams[0].date).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                    <div className="d-flex gap-2 flex-wrap">
                        <Link className="btn" to="/student/faceauth" style={{ background: 'rgba(255,255,255,.15)', color: '#fff', borderColor: 'rgba(255,255,255,.2)', textDecoration: 'none', borderRadius: '20px', fontSize: '13px' }}>Verify Face First</Link>
                        <Link className="btn" to={`/student/exam?id=${upcomingExams[0]._id}`} style={{ background: '#fff', color: '#4338ca', fontWeight: '700', textDecoration: 'none', borderRadius: '20px', fontSize: '13px' }}>Start Exam →</Link>
                    </div>
                </div>
            )}

            <div className="row g-3">
                <div className="col-12 col-md-8">
                    <div className="card shadow-sm border-0" style={{ borderRadius: '16px' }}>
                        <div className="cd-hd d-flex align-items-center justify-content-between border-0 pb-1">
                            <span className="cd-t" style={{ fontSize: '16px', fontWeight: '700' }}>Scheduled Exams</span>
                        </div>
                        <div className="d-flex flex-column gap-2 mt-2">
                            {upcomingExams.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--g400)', background: 'var(--g50)', borderRadius: '12px' }}>No upcoming exams found.</div>
                            ) : (
                                upcomingExams.map(exam => (
                                    <div key={exam._id} className="d-flex align-items-center justify-content-between p-3 border rounded-3 bg-white hover-shadow" style={{ transition: 'all 0.3s ease' }}>
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="d-flex align-items-center justify-content-center" style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--std1)', fontSize: '20px' }}>📘</div>
                                            <div>
                                                <div style={{ fontFamily: 'var(--fd)', fontSize: '14px', fontWeight: '700', color: 'var(--g900)' }}>{exam.name}</div>
                                                <div style={{ fontSize: '11.5px', color: 'var(--g400)' }}>
                                                    {new Date(exam.date).toLocaleDateString()} · {exam.time} · {exam.duration} mins
                                                </div>
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="text-end d-none d-sm-block">
                                                <span className={`badge ${new Date(exam.date).toDateString() === new Date().toDateString() ? 'b-live' : 'b-scheduled'}`} style={{ fontSize: '10px' }}>
                                                    {new Date(exam.date).toDateString() === new Date().toDateString() ? '● Today' : 'Scheduled'}
                                                </span>
                                                <div style={{ fontSize: '11px', color: 'var(--g300)', marginTop: '4px' }}>{exam.totalMarks} Marks</div>
                                            </div>
                                            <Link to={`/student/exam?id=${exam._id}`} className="btn btn-sm btn-outline-primary fw-bold px-3" style={{ borderRadius: '20px', fontSize: '11px' }}>Start →</Link>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-4">
                    <div className="card h-100 shadow-sm border-0" style={{ borderRadius: '16px' }}>
                        <div className="cd-hd d-flex align-items-center justify-content-between border-0 pb-1">
                            <span className="cd-t" style={{ fontSize: '16px', fontWeight: '700' }}>Overall Performance</span>
                        </div>
                        <div className="d-flex flex-column align-items-center gap-4 py-3">
                            <div className="donut-wrap" style={{ position: 'relative' }}>
                                <svg className="donut-svg" height="120" viewBox="0 0 80 80" width="120">
                                    <circle className="dn-bg" cx="40" cy="40" r="32" fill="none" stroke="#f3f4f6" strokeWidth="6"></circle>
                                    <circle className="dn-fill" cx="40" cy="40" r="32" fill="none" 
                                            stroke="var(--std)" strokeWidth="6" 
                                            strokeDasharray={`${(avgScore / 100) * 201} 201`} 
                                            strokeLinecap="round" transform="rotate(-90 40 40)"></circle>
                                </svg>
                                <div className="donut-center d-flex flex-column align-items-center justify-content-center" 
                                     style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                                    <span className="dn-pct" style={{ fontSize: '20px', fontWeight: '800', color: 'var(--std)' }}>{avgScore}%</span>
                                    <span className="dn-lbl" style={{ fontSize: '11px', color: 'var(--g400)' }}>GPA Avg</span>
                                </div>
                            </div>
                            <div className="w-100 px-2 mt-1">
                                <div className="d-flex justify-content-between mb-2">
                                    <span style={{ fontSize: '12px', color: 'var(--g500)' }}>Completed</span>
                                    <span style={{ fontSize: '12px', fontWeight: '700' }}>{completedCount} Exams</span>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <span style={{ fontSize: '12px', color: 'var(--g500)' }}>Rank</span>
                                    <span style={{ fontSize: '12px', fontWeight: '700' }}>-- / {exams.length}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
};

export default StudentDashboard;
