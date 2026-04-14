import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { getProctorLogs } from '../../api';

const AdminProctor = () => {
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState({ totalFlags: 0, criticalFlags: 0, warningFlags: 0, lowFlags: 0, uniqueStudents: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [severityFilter, setSeverityFilter] = useState('All');

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const token = localStorage.getItem('token');
                const data = await getProctorLogs(token);
                setLogs(data.logs || []);
                setStats(data.stats || {});
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    // -- Severity helpers --
    const getSeverity = (score) => {
        if (score >= 0.8) return { label: 'Critical', color: 'var(--red)', icon: '🔴' };
        if (score >= 0.5) return { label: 'Medium', color: 'var(--amber)', icon: '🟡' };
        return { label: 'Low', color: 'var(--s300)', icon: '🔵' };
    };

    const getStatusBadge = (score) => {
        if (score >= 0.8) return { className: 'b-flag', text: 'Flagged' };
        if (score >= 0.5) return { className: 'b-warn', text: 'Warning' };
        return { className: 'b-clean', text: 'Clean' };
    };

    const getActionText = (score, flagType) => {
        if (score >= 0.8) return 'Warning sent · Exam flagged';
        if (score >= 0.5) return 'Warning sent';
        return 'Alert logged';
    };

    const getLiveBorder = (score) => {
        if (score >= 0.8) return '2px solid var(--red)';
        if (score >= 0.5) return '2px solid var(--amber)';
        return '1px solid rgba(255,255,255,.1)';
    };

    const getLiveHeaderBg = (score) => {
        if (score >= 0.8) return 'rgba(220,38,38,.15)';
        if (score >= 0.5) return 'rgba(217,119,6,.15)';
        return 'rgba(255,255,255,.04)';
    };

    const getLiveBadge = (score) => {
        if (score >= 0.8) return { bg: 'var(--red)', color: '#fff', text: '⚠ FLAGGED' };
        if (score >= 0.5) return { bg: 'var(--amber)', color: '#fff', text: '⚡ WARNING' };
        return { bg: 'rgba(5,150,105,.2)', color: '#6EE7B7', text: '✓ CLEAN' };
    };

    const getLiveEmoji = (flagType) => {
        const t = (flagType || '').toLowerCase();
        if (t.includes('face') || t.includes('multi')) return '👤👤';
        if (t.includes('tab')) return '⬜';
        if (t.includes('no face') || t.includes('missing')) return '❌';
        return '⚠️';
    };

    const getLiveBottomLabel = (flagType) => {
        const t = (flagType || '').toLowerCase();
        if (t.includes('multi') || t.includes('face mismatch')) return 'MULTIPLE FACES';
        if (t.includes('tab')) return 'TAB SWITCH';
        if (t.includes('no face') || t.includes('missing')) return 'NO FACE DETECTED';
        return flagType?.toUpperCase() || 'VIOLATION';
    };

    const getLiveGradient = (score) => {
        if (score >= 0.8) return 'linear-gradient(160deg,#0a0e1a,#1a0a0a)';
        if (score >= 0.5) return 'linear-gradient(160deg,#0a0e1a,#1a120a)';
        return 'linear-gradient(160deg,#0a0e1a,#0c1227)';
    };

    // -- Filtering --
    const filteredLogs = logs.filter(log => {
        const studentName = log.student?.name || '';
        const examName = log.exam?.name || '';
        const flagType = log.flagType || '';

        const matchSearch =
            studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            examName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            flagType.toLowerCase().includes(searchTerm.toLowerCase());

        const severity = getSeverity(log.score);
        const matchSeverity =
            severityFilter === 'All' ||
            severity.label === severityFilter;

        return matchSearch && matchSeverity;
    });

    // Top 3 recent logs for live cards
    const recentCards = logs.slice(0, 3);

    // -- Export CSV --
    const handleExportReport = () => {
        if (filteredLogs.length === 0) return alert('No data to export.');
        const header = 'Time,Student,Roll No,Exam,Violation,Severity,Score,Status\n';
        const rows = filteredLogs.map(log => {
            const sev = getSeverity(log.score);
            const badge = getStatusBadge(log.score);
            return `${log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'},${log.student?.name || 'N/A'},${log.student?.rollNo || 'N/A'},${(log.exam?.name || 'N/A').replace(/,/g, ' ')},${log.flagType},${sev.label},${log.score},${badge.text}`;
        }).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `proctor_report_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (loading) return <AdminLayout><div style={{ textAlign: 'center', padding: '50px' }}>Loading AI Proctor Logs...</div></AdminLayout>;
    if (error) return <AdminLayout><div style={{ color: 'red', textAlign: 'center', padding: '50px' }}>Error: {error}</div></AdminLayout>;

    return (
        <AdminLayout>
            <div className="pg-intro">
                <h2>AI Proctoring Logs</h2>
                <p>Real-time and historical proctoring violation records</p>
            </div>

            {/* ── Stats Row ── */}
            <div className="row row-cols-2 row-cols-lg-5 g-3 mb-3 ex-stat-row">
                <div className="col"><div className="sc cr">
                    <div className="sc-lbl">Total Flags</div>
                    <div className="sc-val">{stats.totalFlags}</div>
                    <div className="sc-trend d-flex align-items-center gap-1 tdn">All violations</div>
                </div></div>
                <div className="col"><div className="sc cr">
                    <div className="sc-lbl">Critical</div>
                    <div className="sc-val">{stats.criticalFlags}</div>
                    <div className="sc-trend d-flex align-items-center gap-1 tdn">🔴 Score ≥ 0.8</div>
                </div></div>
                <div className="col"><div className="sc ca">
                    <div className="sc-lbl">Warnings</div>
                    <div className="sc-val">{stats.warningFlags}</div>
                    <div className="sc-trend d-flex align-items-center gap-1 tneu">🟡 Score 0.5-0.8</div>
                </div></div>
                <div className="col"><div className="sc cn">
                    <div className="sc-lbl">Low</div>
                    <div className="sc-val">{stats.lowFlags}</div>
                    <div className="sc-trend d-flex align-items-center gap-1 tup">🔵 Score &lt; 0.5</div>
                </div></div>
                <div className="col"><div className="sc cg">
                    <div className="sc-lbl">Students</div>
                    <div className="sc-val">{stats.uniqueStudents}</div>
                    <div className="sc-trend d-flex align-items-center gap-1 tneu">Unique flagged</div>
                </div></div>
            </div>

            {/* ── Live Monitor Cards ── */}
            <div className="row g-3 mb-4">
                {recentCards.length === 0 ? (
                    <div className="col-12">
                        <div style={{ background: 'var(--s900)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 'var(--rl)', padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,.5)' }}>
                            No proctoring violations recorded yet. System is clean ✓
                        </div>
                    </div>
                ) : (
                    recentCards.map((log, idx) => {
                        const badge = getLiveBadge(log.score);
                        return (
                            <div className="col-12 col-md-4" key={log._id || idx}>
                                <div style={{ background: 'var(--s900)', border: getLiveBorder(log.score), borderRadius: 'var(--rl)', overflow: 'hidden' }}>
                                    <div className="d-flex justify-content-between align-items-center" style={{ padding: '8px 12px', background: getLiveHeaderBg(log.score) }}>
                                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#fff' }}>{log.student?.rollNo || 'N/A'} · {log.student?.name || 'Unknown'}</span>
                                        <span style={{ fontSize: '10px', fontWeight: '700', background: badge.bg, color: badge.color, padding: '2px 7px', borderRadius: '99px' }}>{badge.text}</span>
                                    </div>
                                    <div className="d-flex align-items-center justify-content-center" style={{ height: '120px', background: getLiveGradient(log.score), fontSize: '28px', position: 'relative' }}>
                                        {getLiveEmoji(log.flagType)}
                                        <div style={{ position: 'absolute', bottom: '4px', left: '8px', fontSize: '9px', fontWeight: '700', color: getSeverity(log.score).color }}>{getLiveBottomLabel(log.flagType)}</div>
                                    </div>
                                    <div style={{ padding: '8px 12px', fontSize: '11px', color: 'rgba(255,255,255,.5)' }}>
                                        {log.exam?.subjectId?.code || log.exam?.name || 'Exam'} · {log.flagType} · {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : ''}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* ── Violation Log Table ── */}
            <div className="card">
                <div className="cd-hd d-flex align-items-center justify-content-between">
                    <span className="cd-t">Proctoring Violation Log</span>
                    <div className="d-flex gap-2">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--g50)', padding: '0 10px', border: '1.5px solid var(--g200)', borderRadius: '8px' }}>
                            <svg fill="none" height="12" stroke="var(--g300)" strokeWidth="2" viewBox="0 0 24 24" width="12"><circle cx="11" cy="11" r="8"></circle><line x1="21" x2="16.65" y1="21" y2="16.65"></line></svg>
                            <input
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ border: 'none', outline: 'none', background: 'transparent', width: '120px', height: '32px', fontSize: '12px' }}
                            />
                        </div>
                        <select className="fi" style={{ width: '120px', height: '32px', fontSize: '12px' }} value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
                            <option value="All">All</option>
                            <option value="Critical">Critical</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>
                        <button className="btn btn-g btn-sm" onClick={handleExportReport}>Export Report</button>
                    </div>
                </div>
                <div className="tw">
                    <table className="tbl">
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Student</th>
                                <th>Exam</th>
                                <th>Violation Type</th>
                                <th>Severity</th>
                                <th>Action Taken</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.length === 0 ? (
                                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>No proctoring violations found.</td></tr>
                            ) : (
                                filteredLogs.map((log, idx) => {
                                    const sev = getSeverity(log.score);
                                    const badge = getStatusBadge(log.score);
                                    return (
                                        <tr key={log._id || idx}>
                                            <td>{log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                                            <td>
                                                <div style={{ fontWeight: 700 }}>{log.student?.name || 'Unknown'}</div>
                                                <div style={{ fontSize: '10px', color: 'var(--g400)' }}>{log.student?.rollNo || ''}</div>
                                            </td>
                                            <td>{log.exam?.name || 'N/A'}</td>
                                            <td>{log.flagType}</td>
                                            <td><span style={{ color: sev.color, fontWeight: '700' }}>{sev.icon} {sev.label}</span></td>
                                            <td>{getActionText(log.score, log.flagType)}</td>
                                            <td><span className={`badge ${badge.className}`}>{badge.text}</span></td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminProctor;
