import React, { useState, useEffect } from 'react';
import FacultyLayout from '../../layouts/FacultyLayout';
import { getAllSubmissions } from '../../api';
import { toast } from 'react-toastify';

const FacultyResults = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const getInitials = (name) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const token = sessionStorage.getItem('token');
                const data = await getAllSubmissions(token);
                setSubmissions(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchSubmissions();
    }, []);

    // -- Export CSV --
    const handleExportCSV = () => {
        if (submissions.length === 0) return toast.info('No data to export.');
        const header = 'Student,Roll No,Exam,Score,Total,Percentage,Result,Date\n';
        const rows = submissions.map(sub => {
            const obtained = sub.totalMarksObtained || 0;
            const total = sub.examId?.totalMarks || 100;
            const pct = ((obtained / total) * 100).toFixed(1);
            const passMarks = sub.examId?.passMarks || total * 0.4;
            const passed = obtained >= passMarks;
            return `${sub.studentId?.name || 'N/A'},${sub.studentId?.rollNo || 'N/A'},${(sub.examId?.name || 'N/A').replace(/,/g, ' ')},${obtained},${total},${pct}%,${passed ? 'Pass' : 'Fail'},${sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : 'N/A'}`;
        }).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `faculty_results_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (loading) return <FacultyLayout> <div style={{ textAlign: 'center', padding: '50px' }}>Loading Evaluation Data...</div> </FacultyLayout>;
    if (error) return <FacultyLayout> <div style={{ color: 'red', textAlign: 'center', padding: '50px' }}>Error: {error}</div> </FacultyLayout>;

    return (
        <FacultyLayout pageTitle="Results & Evaluation">
            <div className="pg-intro">
                <h2>Results & Evaluation</h2>
                <p>Review and publish student performances</p>
            </div>

            <div className="card" style={{ marginBottom: '14px' }}>
                <div className="cd-hd d-flex align-items-center justify-content-between">
                    <span className="cd-t">Overall Exam Evaluations ({submissions.length})</span>
                </div>
                <div className="tw">
                    <table className="tbl">
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Exam</th>
                                <th>Score</th>
                                <th>Percentage</th>
                                <th>Result</th>
                                <th>Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {submissions.length === 0 ? (
                                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>No submissions found.</td></tr>
                            ) : (
                                submissions.map(sub => {
                                    const obtained = sub.totalMarksObtained || 0;
                                    const total = sub.examId?.totalMarks || 100;
                                    const pct = ((obtained / total) * 100).toFixed(1);
                                    const passMarks = sub.examId?.passMarks || total * 0.4;
                                    const passed = obtained >= passMarks;
                                    return (
                                        <tr key={sub._id}>
                                            <td>
                                                <div className="td-user d-flex align-items-center gap-2">
                                                    <div className="sb-av d-inline-flex align-items-center justify-content-center" style={{ background: 'var(--in5)', color: '#fff', width: '28px', height: '28px', fontSize: '10px', borderRadius: '6px', fontWeight: '700' }}>
                                                        {getInitials(sub.studentId?.name)}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 700 }}>{sub.studentId?.name || 'Unknown Student'}</div>
                                                        <div style={{ fontSize: '10px', color: 'var(--g400)' }}>{sub.studentId?.rollNo || ''}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div>{sub.examId?.name || 'Exam'}</div>
                                                <div style={{ fontSize: '10px', color: 'var(--g400)' }}>{sub.examId?.type || ''}</div>
                                            </td>
                                            <td>
                                                <span style={{ fontWeight: 700 }}>{obtained}</span>
                                                <span style={{ color: 'var(--g400)', fontSize: '11px' }}> / {total}</span>
                                            </td>
                                            <td style={{ fontWeight: 700, color: pct >= 75 ? 'var(--green)' : pct >= 40 ? 'var(--amber)' : 'var(--red)' }}>{pct}%</td>
                                            <td>
                                                <span className={`badge ${passed ? 'b-pass' : 'b-draft'}`} style={!passed ? { background: '#fecaca', color: '#b91c1c' } : {}}>
                                                    {passed ? 'Pass' : 'Fail'}
                                                </span>
                                            </td>
                                            <td style={{ fontSize: '11px' }}>{sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : '—'}</td>
                                            <td><button className="btn btn-g btn-xs">Details</button></td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                {submissions.length > 0 && (
                    <div className="d-flex gap-2" style={{ marginTop: '12px' }}>
                        <button className="btn btn-n">Publish All Results</button>
                        <button className="btn btn-g" onClick={handleExportCSV}>Export CSV</button>
                    </div>
                )}
            </div>
        </FacultyLayout>
    );
};

export default FacultyResults;
