import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { getQuestions } from '../../api';

const AdminQBank = () => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const token = localStorage.getItem('token');
                const data = await getQuestions(token);
                setQuestions(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchQuestions();
    }, []);

    const getTypeBadge = (type) => {
        switch(type?.toLowerCase()) {
            case 'mcq': return 'b-scheduled';
            case 't/f': return 'b-warn';
            default: return 'b-pass';
        }
    };

    const getDiffBadge = (diff) => {
        switch(diff?.toLowerCase()) {
            case 'easy': return 'b-pass';
            case 'hard': return 'b-fail';
            default: return 'b-warn';
        }
    };

    if (loading) return <AdminLayout> <div style={{ textAlign: 'center', padding: '50px' }}>Loading Global Question Bank...</div> </AdminLayout>;
    if (error) return <AdminLayout> <div style={{ color: 'red', textAlign: 'center', padding: '50px' }}>Error: {error}</div> </AdminLayout>;

    return (
        <AdminLayout>
            <div className="pg-intro">
                <h2>Question Bank Management</h2>
                <p>Central repository of all exam questions</p>
            </div>

            <div className="card">
                <div className="cd-hd d-flex align-items-center justify-content-between">
                    <span className="cd-t">Available Questions ({questions.length})</span>
                    <button className="btn btn-n btn-sm">+ Add Question</button>
                </div>
                <div className="tw">
                    <table className="tbl">
                        <thead>
                            <tr>
                                <th>Difficulty</th>
                                <th>Question Text</th>
                                <th>Type</th>
                                <th>Subject</th>
                                <th>Marks</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {questions.length === 0 ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>No questions found in the repository.</td></tr>
                            ) : (
                                questions.map(q => (
                                    <tr key={q._id}>
                                        <td>
                                            <span className={`badge ${getDiffBadge(q.diff)}`}>
                                                {q.diff || 'Medium'}
                                            </span>
                                        </td>
                                        <td style={{ maxWidth: '400px' }}>
                                            <div className="text-truncate">{q.text}</div>
                                            <div style={{ fontSize: '10px', color: 'var(--g400)' }}>ID: {q._id.substring(0, 8).toUpperCase()}</div>
                                        </td>
                                        <td><span className={`badge ${getTypeBadge(q.type)}`}>{q.type || 'MCQ'}</span></td>
                                        <td>{q.subjectId?.name || 'General'}</td>
                                        <td style={{ fontWeight: 700 }}>{q.marks || 1}</td>
                                        <td>
                                            <div className="d-flex gap-1">
                                                <button className="btn btn-g btn-xs">Edit</button>
                                                <button className="btn btn-danger btn-xs" style={{ background: 'rgba(220,38,38,.1)', color: 'var(--red)', border: 'none' }}>×</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminQBank;
