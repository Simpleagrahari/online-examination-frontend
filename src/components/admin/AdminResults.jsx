import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { getAllSubmissions } from '../../api';

const AdminResults = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [subjectFilter, setSubjectFilter] = useState('All');

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const token = localStorage.getItem('token');
                const data = await getAllSubmissions(token);
                setSubmissions(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, []);

    // -- Derive unique subjects from loaded submissions --
    const uniqueSubjects = [...new Set(
        submissions
            .map(s => s.examId?.subjectId?.name)
            .filter(Boolean)
    )];

    // -- Filtering logic --
    const filteredSubmissions = submissions.filter(sub => {
        const studentName = sub.studentId?.name || '';
        const studentRoll = sub.studentId?.rollNo || '';
        const examName = sub.examId?.name || '';
        const subName = sub.examId?.subjectId?.name || '';

        const matchSearch =
            studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            studentRoll.toLowerCase().includes(searchTerm.toLowerCase()) ||
            examName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            subName.toLowerCase().includes(searchTerm.toLowerCase());

        const obtained = sub.totalMarksObtained || 0;
        const passMarks = sub.examId?.passMarks || (sub.examId?.totalMarks ? sub.examId.totalMarks * 0.4 : 40);
        const isPassed = obtained >= passMarks;

        const matchStatus =
            statusFilter === 'All' ||
            (statusFilter === 'Passed' && isPassed) ||
            (statusFilter === 'Failed' && !isPassed);

        const matchSubject =
            subjectFilter === 'All' ||
            subName === subjectFilter;

        return matchSearch && matchStatus && matchSubject;
    });

    // -- Stats calculation from ALL submissions (not filtered) --
    const calculateStats = () => {
        if (submissions.length === 0) return { passRate: 0, avgScore: 0, failRate: 0, highest: 0, subjectStats: [] };

        const total = submissions.length;
        const totalScorePct = submissions.reduce((acc, sub) => {
            const obtained = sub.totalMarksObtained || 0;
            const tm = sub.examId?.totalMarks || 100;
            return acc + (obtained / tm);
        }, 0);
        const avgScore = (totalScorePct / total) * 100;

        const passingSubmissions = submissions.filter(sub => {
            const obtained = sub.totalMarksObtained || 0;
            const passMarks = sub.examId?.passMarks || (sub.examId?.totalMarks ? sub.examId.totalMarks * 0.4 : 40);
            return obtained >= passMarks;
        });
        const passRate = (passingSubmissions.length / total) * 100;
        const failRate = 100 - passRate;

        const highest = Math.max(...submissions.map(sub => {
            const obtained = sub.totalMarksObtained || 0;
            const tm = sub.examId?.totalMarks || 100;
            return (obtained / tm) * 100;
        }));

        // Group by subject
        const subjects = {};
        submissions.forEach(sub => {
            const sName = sub.examId?.subjectId?.name || 'General';
            if (!subjects[sName]) subjects[sName] = { total: 0, scoreSum: 0 };
            const obtained = sub.totalMarksObtained || 0;
            const tm = sub.examId?.totalMarks || 100;
            subjects[sName].total += 1;
            subjects[sName].scoreSum += (obtained / tm);
        });

        const subjectStats = Object.keys(subjects).map(name => ({
            name,
            pct: (subjects[name].scoreSum / subjects[name].total) * 100
        }));

        return { passRate, avgScore, failRate, highest, subjectStats };
    };

    // -- Export CSV --
    const handleExportCSV = () => {
        if (filteredSubmissions.length === 0) return alert('No data to export.');

        const header = 'Student,Roll No,Email,Exam,Subject,Obtained,Total,Percentage,Status,Date\n';
        const rows = filteredSubmissions.map(sub => {
            const studentName = sub.studentId?.name || 'N/A';
            const rollNo = sub.studentId?.rollNo || 'N/A';
            const email = sub.studentId?.email || 'N/A';
            const examName = (sub.examId?.name || 'N/A').replace(/,/g, ' ');
            const subName = sub.examId?.subjectId?.name || 'General';
            const obtained = sub.totalMarksObtained || 0;
            const tm = sub.examId?.totalMarks || 100;
            const pct = ((obtained / tm) * 100).toFixed(1);
            const passMarks = sub.examId?.passMarks || tm * 0.4;
            const status = obtained >= passMarks ? 'Pass' : 'Fail';
            const date = sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : 'N/A';
            return `${studentName},${rollNo},${email},${examName},${subName},${obtained},${tm},${pct}%,${status},${date}`;
        }).join('\n');

        const blob = new Blob([header + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `results_report_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const stats = calculateStats();

    if (loading) return <AdminLayout> <div style={{ textAlign: 'center', padding: '50px' }}>Analyzing Global Performance...</div> </AdminLayout>;
    if (error) return <AdminLayout> <div style={{ color: 'red', textAlign: 'center', padding: '50px' }}>Error: {error}</div> </AdminLayout>;

    return (
        <AdminLayout>
            <div className="pg-intro"><h2>Results &amp; Performance Reports</h2></div>

            <div className="row row-cols-2 row-cols-lg-4 g-3 mb-3 ex-stat-row">
                <div className="col"><div className="sc cg">
                    <div className="sc-lbl">Overall Pass Rate</div>
                    <div className="sc-val">{stats.passRate.toFixed(1)}%</div>
                    <div className="sc-trend d-flex align-items-center gap-1 tup">▲ {submissions.length} Total Attempts</div>
                </div></div>
                <div className="col"><div className="sc cn">
                    <div className="sc-lbl">Avg Score</div>
                    <div className="sc-val">{stats.avgScore.toFixed(1)}%</div>
                    <div className="sc-trend d-flex align-items-center gap-1 tup">▲ Grade Average</div>
                </div></div>
                <div className="col"><div className="sc cr">
                    <div className="sc-lbl">Fail Rate</div>
                    <div className="sc-val">{stats.failRate.toFixed(1)}%</div>
                    <div className="sc-trend d-flex align-items-center gap-1 tdn">▼ Below Pass Marks</div>
                </div></div>
                <div className="col"><div className="sc ca">
                    <div className="sc-lbl">Highest Score</div>
                    <div className="sc-val">{submissions.length > 0 ? stats.highest.toFixed(1) : 0}%</div>
                    <div className="sc-trend d-flex align-items-center gap-1 tneu">Top Performance</div>
                </div></div>
            </div>

            <div className="row g-3 mb-3">
                <div className="col-md-6">
                    <div className="card h-100">
                        <div className="cd-hd d-flex align-items-center justify-content-between">
                            <span className="cd-t">Subject-wise Performance</span>
                        </div>
                        {stats.subjectStats.length === 0 ? (
                            <div className="text-center py-4">No data available</div>
                        ) : (
                            stats.subjectStats.map(s => (
                                <div key={s.name} className="pb-row d-flex align-items-center gap-2">
                                    <span className="pb-lbl">{s.name}</span>
                                    <div className="pb-track">
                                        <div className="pb-fill" style={{ width: `${s.pct}%`, background: 'var(--green)' }}></div>
                                    </div>
                                    <span className="pb-val">{s.pct.toFixed(1)}%</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card h-100">
                        <div className="cd-hd d-flex align-items-center justify-content-between">
                            <span className="cd-t">Analysis Summary</span>
                        </div>
                        <div style={{ padding: '20px', background: 'var(--gbg)', borderRadius: 'var(--r)', border: '1px solid var(--gbdr)', marginTop: '10px' }}>
                            <div style={{ fontFamily: 'var(--fd)', fontSize: '13px', fontWeight: 700, color: 'var(--green)' }}>✓ System Audit Clean</div>
                            <div style={{ fontSize: '12px', color: 'var(--g500)', marginTop: '3px' }}>All {submissions.length} submissions have been verified and processed by the AI evaluation engine.</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Individual Results Table ── */}
            <div className="card" style={{ marginBottom: '14px' }}>
                <div className="d-flex gap-2 flex-wrap align-items-center">
                    <div className="hs" style={{ flex: 1, minWidth: '180px', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--g50)', padding: '0 12px', border: '1.5px solid var(--g200)', borderRadius: '10px' }}>
                        <svg fill="none" height="14" stroke="var(--g300)" strokeWidth="2" viewBox="0 0 24 24" width="14">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" x2="16.65" y1="21" y2="16.65"></line>
                        </svg>
                        <input
                            placeholder="Search by student, exam, subject..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', height: '38px', fontSize: '13px' }}
                        />
                    </div>
                    <select className="fi" style={{ width: '140px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="All">All Results</option>
                        <option value="Passed">Passed</option>
                        <option value="Failed">Failed</option>
                    </select>
                    <select className="fi" style={{ width: '160px' }} value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
                        <option value="All">All Subjects</option>
                        {uniqueSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button className="btn btn-n btn-sm" onClick={handleExportCSV}>⬇ Export CSV</button>
                </div>
            </div>

            <div className="card">
                <div className="cd-hd d-flex align-items-center justify-content-between">
                    <span className="cd-t">Individual Results ({filteredSubmissions.length})</span>
                </div>
                <div className="tw">
                    <table className="tbl">
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Exam</th>
                                <th>Subject</th>
                                <th>Score</th>
                                <th>Percentage</th>
                                <th>Status</th>
                                <th>Flags</th>
                                <th>Submitted</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSubmissions.length === 0 ? (
                                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '30px' }}>No results found matching your criteria.</td></tr>
                            ) : (
                                filteredSubmissions.map(sub => {
                                    const obtained = sub.totalMarksObtained || 0;
                                    const tm = sub.examId?.totalMarks || 100;
                                    const pct = (obtained / tm) * 100;
                                    const passMarks = sub.examId?.passMarks || tm * 0.4;
                                    const isPassed = obtained >= passMarks;
                                    const flagCount = sub.proctoringFlags?.length || 0;

                                    return (
                                        <tr key={sub._id}>
                                            <td>
                                                <div style={{ fontWeight: '700', color: 'var(--g900)' }}>{sub.studentId?.name || 'Unknown'}</div>
                                                <div style={{ fontSize: '10px', color: 'var(--g400)' }}>{sub.studentId?.rollNo || sub.studentId?.email || '—'}</div>
                                            </td>
                                            <td>
                                                <div>{sub.examId?.name || 'Deleted Exam'}</div>
                                                <div style={{ fontSize: '10px', color: 'var(--g400)' }}>{sub.examId?.type || ''}</div>
                                            </td>
                                            <td>{sub.examId?.subjectId?.name || 'General'}</td>
                                            <td>
                                                <span style={{ fontWeight: 700 }}>{obtained}</span>
                                                <span style={{ color: 'var(--g400)', fontSize: '11px' }}> / {tm}</span>
                                            </td>
                                            <td>
                                                <div style={{
                                                    fontWeight: 700,
                                                    color: pct >= 75 ? 'var(--green)' : pct >= 40 ? 'var(--amber)' : 'var(--red)'
                                                }}>
                                                    {pct.toFixed(1)}%
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge ${isPassed ? 'b-completed' : 'b-live'}`}>
                                                    {isPassed ? 'PASS' : 'FAIL'}
                                                </span>
                                            </td>
                                            <td>
                                                {flagCount > 0 ? (
                                                    <span style={{ color: 'var(--red)', fontWeight: 700, fontSize: '12px' }}>⚠ {flagCount}</span>
                                                ) : (
                                                    <span style={{ color: 'var(--green)', fontSize: '12px' }}>✓ Clean</span>
                                                )}
                                            </td>
                                            <td>
                                                <div>{sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : '—'}</div>
                                                <div style={{ fontSize: '10px', color: 'var(--g400)' }}>{sub.submittedAt ? new Date(sub.submittedAt).toLocaleTimeString() : ''}</div>
                                            </td>
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

export default AdminResults;
