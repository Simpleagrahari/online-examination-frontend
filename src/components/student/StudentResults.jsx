import React, { useState, useEffect } from 'react';
import StudentLayout from '../../layouts/StudentLayout';
import { getMyResults, getResultById, getMyRank } from '../../api';
import { toast } from 'react-toastify';

const StudentResults = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedResult, setSelectedResult] = useState(null);
    const [rankData, setRankData] = useState({ rank: '--', totalStudents: 0 });

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const token = sessionStorage.getItem('token');
                const [data, rankInfo] = await Promise.all([
                    getMyResults(token),
                    getMyRank(token).catch(() => ({ rank: '--', totalStudents: 0 }))
                ]);
                setResults(data);
                setRankData(rankInfo);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, []);

    const handleReview = async (id) => {
        try {
            const token = sessionStorage.getItem('token');
            const data = await getResultById(id, token);
            setSelectedResult(data);
        } catch (err) {
            toast.error(err.message);
        }
    };

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
                        <div className="sc-val" style={{ fontSize: '30px', fontWeight: '800', color: 'var(--amber)' }}>{rankData.rank}</div>
                        <div style={{ fontSize: '11px', color: 'var(--g300)' }}>{rankData.totalStudents > 0 ? `Out of ${rankData.totalStudents} students` : 'Processing...'}</div>
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
                                                <button className="btn btn-outline-primary btn-xs rounded-pill px-3 shadow-none" style={{ fontSize: '11px', fontWeight: '600' }} onClick={() => handleReview(res._id)}>Review Answers</button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Review Answers Modal */}
            {selectedResult && (
                <div className="modal-custom-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div className="card shadow-lg border-0 d-flex flex-column" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', padding: '0', borderRadius: '15px' }}>
                        <div className="cd-hd d-flex align-items-center justify-content-between p-4" style={{ borderBottom: '1px solid #eee' }}>
                            <div>
                                <h5 className="mb-1 fw-bold">{selectedResult.examId?.name || 'Exam Review'}</h5>
                                <div style={{ fontSize: '13px', color: 'var(--g400)' }}>Total Marks: {selectedResult.totalMarksObtained} / {selectedResult.examId?.totalMarks || 100}</div>
                            </div>
                            <button className="btn-close" onClick={() => setSelectedResult(null)}></button>
                        </div>
                        <div className="p-4 flex-grow-1 overflow-auto" style={{ background: '#f8fafc' }}>
                            {selectedResult.answers && selectedResult.answers.length > 0 ? (
                                selectedResult.answers.map((ans, idx) => (
                                    <div key={ans._id || idx} className="card p-3 mb-3 border-0 shadow-sm" style={{ borderRadius: '12px', borderLeft: ans.isCorrect ? '4px solid var(--green)' : '4px solid var(--red)' }}>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--g700)' }}>Q{idx + 1}. {ans.questionId?.text || 'Question text unavailable'}</span>
                                            <span className={`badge ${ans.isCorrect ? 'b-live' : 'b-draft'}`} style={{ color: ans.isCorrect ? '#16a34a' : '#dc2626', background: ans.isCorrect ? '#f0fdf4' : '#fef2f2' }}>
                                                {ans.marksObtained} / {ans.questionId?.marks || 0} Marks
                                            </span>
                                        </div>
                                        <div className="d-flex flex-column gap-1" style={{ fontSize: '13px' }}>
                                            <div style={{ color: 'var(--g500)' }}>
                                                <strong>Your Answer:</strong> {ans.selectedOption || ans.tfAnswer || 'Not answered'}
                                            </div>
                                            {!ans.isCorrect && (
                                                <div style={{ color: 'var(--green)' }}>
                                                    <strong>Correct Answer:</strong> {ans.questionId?.correctOption || ans.questionId?.tfAnswer || 'N/A'}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center p-4">No answers available for review.</div>
                            )}
                        </div>
                        <div className="p-3 border-top text-end" style={{ background: '#fff', borderBottomLeftRadius: '15px', borderBottomRightRadius: '15px' }}>
                            <button className="btn btn-light px-4" onClick={() => setSelectedResult(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </StudentLayout>
    );
};

export default StudentResults;
