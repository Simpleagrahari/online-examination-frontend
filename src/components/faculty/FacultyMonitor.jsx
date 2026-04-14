import React, { useState, useEffect } from 'react';
import FacultyLayout from '../../layouts/FacultyLayout';
import { getExams, getAllSubmissions } from '../../api';

const FacultyMonitor = () => {
    const [submissions, setSubmissions] = useState([]);
    const [liveExam, setLiveExam] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const [examsData, subsData] = await Promise.all([
                    getExams(token),
                    getAllSubmissions(token)
                ]);
                const live = examsData.find(e => e.status === 'live');
                setLiveExam(live || null);
                setSubmissions(subsData);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Build alerts from submissions
    const allAlerts = [];
    submissions.forEach(sub => {
        (sub.proctoringFlags || []).forEach(flag => {
            allAlerts.push({
                name: sub.studentId?.name || 'Unknown',
                exam: sub.examId?.name || 'Exam',
                type: flag.type || 'Unknown',
                score: flag.score || 0,
                time: flag.timestamp ? new Date(flag.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' AM' : ''
            });
        });
    });
    allAlerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Stats
    const attemptingCount = submissions.filter(s => s.status === 'submitted').length;
    const alertsCount = allAlerts.length;
    const submittedCount = submissions.length;
    const flaggedCount = submissions.filter(s => (s.proctoringFlags?.length || 0) > 0 && s.proctoringFlags.some(f => (f.score || 0) >= 0.8)).length;

    // Build student grid
    const gridStudents = submissions.slice(0, 6).map(sub => {
        const flags = sub.proctoringFlags || [];
        const hasCritical = flags.some(f => (f.score || 0) >= 0.8);
        const hasWarning = flags.some(f => (f.score || 0) >= 0.5 && (f.score || 0) < 0.8);

        if (hasCritical) {
            return { name: (sub.studentId?.name || 'Student').split(' ').map(n => n.slice(0,5)).join(' ') + '.', status: 'FLAGGED', color: 'var(--red)', icon: '👤👤', bg: 'rgba(220,38,38,.1)' };
        } else if (hasWarning) {
            return { name: (sub.studentId?.name || 'Student').split(' ').map(n => n.slice(0,5)).join(' ') + '.', status: 'WARN', color: 'var(--amber)', icon: '⬜', bg: 'rgba(217,119,6,.1)' };
        } else {
            return { name: (sub.studentId?.name || 'Student').split(' ').map(n => n.slice(0,5)).join(' ') + '.', status: 'OK', color: '#6EE7B7', icon: '😊', bg: 'rgba(5,150,105,.05)' };
        }
    });

    const examTitle = liveExam?.name || (submissions[0]?.examId?.name || 'CS301 Final');

    if (loading) return <FacultyLayout pageTitle="Live Monitoring"><div style={{ textAlign: 'center', padding: '50px' }}>Loading Live Data...</div></FacultyLayout>;

    return (
        <FacultyLayout pageTitle="Live Monitoring">
            <div className="pg-intro">
                <h2>Live Exam Monitoring</h2>
                <p>{examTitle} — Real-time AI proctoring view</p>
            </div>

            <div className="row g-3" style={{ marginBottom: '14px' }}>
                <div className="col-lg-4">
                    <div className="d-flex flex-column gap-3">
                        <div className="card">
                            <div className="cd-hd d-flex align-items-center justify-content-between">
                                <span className="cd-t">Live Stats</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                <div style={{ background: 'var(--gbg)', borderRadius: 'var(--r)', padding: '12px', textAlign: 'center' }}>
                                    <div style={{ fontFamily: 'var(--fd)', fontSize: '22px', fontWeight: 800, color: 'var(--green)' }}>{attemptingCount}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--g400)' }}>Attempting</div>
                                </div>
                                <div style={{ background: 'var(--abg)', borderRadius: 'var(--r)', padding: '12px', textAlign: 'center' }}>
                                    <div style={{ fontFamily: 'var(--fd)', fontSize: '22px', fontWeight: 800, color: 'var(--amber)' }}>{alertsCount}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--g400)' }}>Alerts</div>
                                </div>
                                <div style={{ background: 'var(--in1)', borderRadius: 'var(--r)', padding: '12px', textAlign: 'center' }}>
                                    <div style={{ fontFamily: 'var(--fd)', fontSize: '22px', fontWeight: 800, color: 'var(--in5)' }}>{submittedCount}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--g400)' }}>Submitted</div>
                                </div>
                                <div style={{ background: 'var(--rbg)', borderRadius: 'var(--r)', padding: '12px', textAlign: 'center' }}>
                                    <div style={{ fontFamily: 'var(--fd)', fontSize: '22px', fontWeight: 800, color: 'var(--red)' }}>{flaggedCount}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--g400)' }}>Flagged</div>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <div className="cd-hd d-flex align-items-center justify-content-between">
                                <span className="cd-t">Recent Alerts</span>
                            </div>
                            <div className="d-flex flex-column gap-2">
                                {allAlerts.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '16px', fontSize: '12px', color: 'var(--g400)' }}>No proctoring alerts ✓</div>
                                ) : (
                                    allAlerts.slice(0, 3).map((alert, idx) => {
                                        const isCritical = alert.score >= 0.8;
                                        const cls = isCritical ? 'danger' : 'warn';
                                        const icon = isCritical ? '⚠' : (alert.type.toLowerCase().includes('tab') ? '🔄' : '👁');
                                        const desc = isCritical 
                                            ? `${alert.type} detected in frame. Exam flagged for review.`
                                            : `${alert.type} detected. Warning sent.`;
                                        return (
                                            <div key={idx} className={`proct-alert ${cls} d-flex align-items-start gap-2`}>
                                                <div className={`pa-icon ${cls} d-inline-flex align-items-center justify-content-center`}>{icon}</div>
                                                <div>
                                                    <div className={`pa-title ${cls}`}>{alert.type} — {alert.name}</div>
                                                    <div className="pa-desc">{desc}</div>
                                                    <div className="pa-time">{alert.time} · {alert.exam}</div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-8">
                    <div className="card">
                        <div className="cd-hd d-flex align-items-center justify-content-between mb-3">
                            <span className="cd-t">Live Monitoring Grid</span>
                            <div className="d-flex gap-2">
                                <select className="f-input" style={{ width: '120px', height: '32px', fontSize: '11px' }}>
                                    <option>Grid (3x2)</option>
                                    <option>Grid (4x3)</option>
                                </select>
                            </div>
                        </div>
                        <div className="row g-2">
                            {gridStudents.length === 0 ? (
                                <div className="col-12" style={{ textAlign: 'center', padding: '40px', color: 'var(--g400)' }}>No active students found.</div>
                            ) : (
                                gridStudents.map((s, idx) => (
                                    <div key={idx} className="col-md-4">
                                        <div style={{ background: 'var(--s900)', border: `1.5px solid ${s.status !== 'OK' ? s.color : 'rgba(255,255,255,.1)'}`, borderRadius: 'var(--r)', overflow: 'hidden' }}>
                                            <div style={{ padding: '6px 10px', fontSize: '10px', fontWeight: 700, color: s.color, background: s.bg, display: 'flex', justifyContent: 'space-between' }}>
                                                <span>{s.name} — {s.status}</span>
                                                {s.status !== 'OK' && <span>⚠</span>}
                                            </div>
                                            <div className="d-flex align-items-center justify-content-center" style={{ height: '100px', background: '#0a0e1a', fontSize: '28px' }}>
                                                {s.icon}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="mt-3 pt-3 border-top d-flex justify-content-center">
                            <ul className="pagination pagination-sm m-0 gap-1 border-0">
                                <li className="page-item active"><button className="page-link rounded">1</button></li>
                                <li className="page-item"><button className="page-link rounded">2</button></li>
                                <li className="page-item"><button className="page-link rounded">3</button></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </FacultyLayout>
    );
};

export default FacultyMonitor;
