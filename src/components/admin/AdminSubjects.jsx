import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { getSubjects } from '../../api';

const AdminSubjects = () => {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const token = sessionStorage.getItem('token');
                const data = await getSubjects(token);
                setSubjects(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchSubjects();
    }, []);

    if (loading) return <AdminLayout> <div style={{ textAlign: 'center', padding: '50px' }}>Loading Subjects...</div> </AdminLayout>;
    if (error) return <AdminLayout> <div style={{ color: 'red', textAlign: 'center', padding: '50px' }}>Error: {error}</div> </AdminLayout>;

    return (
        <AdminLayout>
            <div className="pg-intro"><h2>Subjects &amp; Courses</h2></div>

            <div className="card">
                <div className="cd-hd d-flex align-items-center justify-content-between">
                    <span className="cd-t">Active Subjects ({subjects.length})</span>
                    <button className="btn btn-n btn-sm">+ Add Subject</button>
                </div>
                <div className="tw">
                    <table className="tbl">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Subject Name</th>
                                <th>Credit Hours</th>
                                <th>Semester</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subjects.length === 0 ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>No subjects found.</td></tr>
                            ) : (
                                subjects.map(s => (
                                    <tr key={s._id}>
                                        <td><span className="tid">{s.code}</span></td>
                                        <td><strong>{s.name}</strong></td>
                                        <td>{s.credits || 3} Hrs</td>
                                        <td>Sem {s.semester || 1}</td>
                                        <td>
                                            <span className="badge b-completed">Active</span>
                                        </td>
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

export default AdminSubjects;
