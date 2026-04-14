import React, { useState, useEffect } from 'react';
import StudentLayout from '../../layouts/StudentLayout';
import { getMyResults } from '../../api';

const StudentResults = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const token = localStorage.getItem('token');
                const data = await getMyResults(token);
                setResults(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, []);

    const totalExams = results.length;
    const avgScore = results.length > 0 ? (results.reduce((acc, curr) => acc + (curr.score || 0), 0) / results.reduce((acc, curr) => acc + (curr.examId?.totalMarks || 100), 0) * 100).toFixed(1) : 0;
    const passCount = results.filter(r => (r.score / (r.examId?.totalMarks || 100) * 100) >= 35).length;

    return (
        <StudentLayout>
            <div className="pg-intro d-flex align-items-center justify-content-between flex-wrap gap-2">
                <div>
                    <h2>Academic Results</h2>
                    <p>Track your scores, grades, and detailed performance reviews</p>
                </div>
            </div>

            <div className="row g-3 mb-4">
                <div className="col-12 col-md-4">
                    <div className="sc cn p-3 shadow-sm border-0 d-flex flex-column align-items-center justify-content-center" style={{ background: '#fff', borderRadius: '16px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--g400)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>Total Marks</div>
                        <div className="sc-val" style={{ fontSize: '30px', fontWeight: '800', color: 'var(--std)' }}>{avgScore}%</div>
                        <div style={{ fontSize: '11px', color: 'var(--g300)' }}>Overall Average</div>
                    </div>
                </div>
                <div className="col-12 col-md-4">
                    <div className="sc cg p-3 shadow-sm border-0 d-flex flex-column align-items-center justify-content-center" style={{ background: '#fff', borderRadius: '16px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--g400)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>Pass Rate</div>
                        <div className="sc-val" style={{ fontSize: '30px', fontWeight: '800', color: 'var(--green)' }}>{totalExams > 0 ? Math.round((passCount/totalExams)*100) : 0}%</div>
                        <div style={{ fontSize: '11px', color: 'var(--g300)' }}>{passCount} out of {totalExams} passed</div>
                    </div>
                </div>
                <div className="col-12 col-md-4">
                    <div className="sc ca p-3 shadow-sm border-0 d-flex flex-column align-items-center justify-content-center" style={{ background: '#fff', borderRadius: '16px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--g400)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>Rank Position</div>
                        <div className="sc-val" style={{ fontSize: '30px', fontWeight: '800', color: 'var(--amber)' }}>--</div>
                        <div style={{ fontSize: '11px', color: 'var(--g300)' }}>Calculating...</div>
                    </div>
                </div>
            </div>

            <div className="card shadow-sm border-0 overflow-hidden" style={{ borderRadius: '16px' }}>
                <div className="cd-hd border-0 py-3 px-4 d-flex align-items-center justify-content-between" style={{ background: 'var(--g50)' }}>
                    <span className="cd-t" style={{ fontSize: '16px', fontWeight: '700' }}>Recent Assessment Submissions</span>
                </div>
                <div className="tbl-wrap">
                    <table className="tbl table-hover align-middle mb-0">
                        <thead>
                            <tr>
                                <th>Exam Name</th>
                                <th>Subject</th>
                                <th>Date</th>
                                <th>Marks Scored</th>
                                <th>Percentage</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>Analyzing results data...</td></tr>
                            ) : results.length === 0 ? (
                                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>No submissions found yet.</td></tr>
                            ) : (
                                results.map(res => {
                                    const percentage = ((res.score / (res.examId?.totalMarks || 100)) * 100).toFixed(1);
                                    const isPass = percentage >= 35;
                                    return (
                                        <tr key={res._id}>
                                            <td>
                                                <div style={{ fontWeight: '700', fontSize: '13.5px' }}>{res.examId?.name || 'Unknown Exam'}</div>
                                                <div style={{ fontSize: '10.5px', color: 'var(--g400)' }}>Type: {res.examId?.type || 'Assessment'}</div>
                                            </td>
                                            <td>{res.examId?.subjectId?.name || 'N/A'}</td>
                                            <td><span style={{ fontSize: '12px' }}>{new Date(res.createdAt).toLocaleDateString()}</span></td>
                                            <td><strong>{res.score}</strong> / {res.examId?.totalMarks || 100}</td>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    <div className="progress" style={{ width: '60px', height: '6px', backgroundColor: 'var(--g100)', borderRadius: '10px' }}>
                                                        <div className="progress-bar" style={{ width: `${percentage}%`, backgroundColor: isPass ? 'var(--green)' : 'var(--std)' }}></div>
                                                    </div>
                                                    <span style={{ fontSize: '12px', fontWeight: '700' }}>{percentage}%</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge ${isPass ? 'b-live' : 'b-draft'}`} style={{ color: isPass ? '#16a34a' : '#dc2626', background: isPass ? '#f0fdf4' : '#fef2f2' }}>
                                                    {isPass ? 'Pass' : 'Fail'}
                                                </span>
                                            </td>
                                            <td>
                                                <button className="btn btn-outline-primary btn-xs rounded-pill px-3 shadow-none" style={{ fontSize: '11px', fontWeight: '600' }}>Review Answers</button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </StudentLayout>
    );
};

export default StudentResults;
