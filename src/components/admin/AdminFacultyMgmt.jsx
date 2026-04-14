import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { getUsers, register, deleteUser } from '../../api';

const AdminFaculty = () => {
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', dept: '', password: '', role: 'faculty' });
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const getInitials = (name) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const data = await getUsers(token);
            setUsers(data.filter(u => u.role === 'faculty' || u.role === 'admin'));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDeleteFaculty = async (id) => {
        if (!window.confirm('Delete this faculty account?')) return;
        try {
            const token = localStorage.getItem('token');
            await deleteUser(id, token);
            fetchUsers();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await register(form);
            alert('Faculty Added Successfully ✅');
            setShowModal(false);
            setForm({ name: '', email: '', dept: '', password: '', role: 'faculty' });
            fetchUsers();
        } catch (err) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <AdminLayout> <div style={{ textAlign: 'center', padding: '50px' }}>Loading Faculty...</div> </AdminLayout>;
    if (error) return <AdminLayout> <div style={{ color: 'red', textAlign: 'center', padding: '50px' }}>Error: {error}</div> </AdminLayout>;

    return (
        <AdminLayout>
            <div className="pg-intro">
                <h2>Faculty Management</h2>
                <p>Manage all faculty and staff accounts</p>
            </div>

            <div className="card" style={{ marginBottom: '14px' }}>
                <div className="d-flex gap-2 flex-wrap align-items-center">
                    <div className="hs" style={{ flex: 1, minWidth: '180px' }}>
                        <svg fill="none" height="14" stroke="var(--g300)" strokeWidth="2" viewBox="0 0 24 24" width="14">
                            <circle cx="11" cy="11" r="8"></circle><line x1="21" x2="16.65" y1="21" y2="16.65"></line>
                        </svg>
                        <input placeholder="Search faculty…" />
                    </div>
                    <select className="fi" style={{ width: '130px' }}>
                        <option>All Depts</option>
                        <option>Computer Sci</option>
                        <option>Mathematics</option>
                        <option>Physics</option>
                    </select>
                    <button className="btn btn-n btn-sm" onClick={() => setShowModal(true)}>+ Add faculty</button>
                </div>
            </div>

            <div className="card">
                <div className="cd-hd d-flex align-items-center justify-content-between">
                    <span className="cd-t">Faculty Directory ({users.length})</span>
                </div>
                <div className="tw">
                    <table className="tbl">
                        <thead>
                            <tr>
                                <th>Name</th><th>Email</th><th>Role</th><th>Department</th>
                                <th>Status</th><th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center' }}>No faculty found.</td></tr>
                            ) : (
                                users.map(u => (
                                    <tr key={u._id}>
                                        <td>
                                            <div className="td-user d-flex align-items-center gap-2">
                                                <div className="td-av d-inline-flex align-items-center justify-content-center" style={{ background: 'var(--amber)', color: '#fff', fontSize: '10px', fontWeight: '800', width: '28px', height: '28px', borderRadius: '7px' }}>
                                                    {getInitials(u.name)}
                                                </div>
                                                {u.name}
                                            </div>
                                        </td>
                                        <td>{u.email}</td>
                                        <td><span className="badge b-warn">{u.role.toUpperCase()}</span></td>
                                        <td>{u.dept || 'General'}</td>
                                        <td><span className="badge b-pass">Active</span></td>
                                        <td>
                                            <div className="d-flex gap-1" style={{ alignItems: 'center' }}>
                                                <button className="btn btn-g btn-xs" title="Edit faculty">
                                                    <svg fill="none" height="12" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="12">
                                                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path>
                                                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                    </svg>
                                                </button>
                                                <button 
                                                    className="btn btn-danger btn-xs" 
                                                    style={{ background: 'rgba(220,38,38,.1)', color: 'var(--red)', border: 'none' }}
                                                    title="Remove faculty"
                                                    onClick={() => handleDeleteFaculty(u._id)}
                                                >
                                                    <svg fill="none" height="12" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="12">
                                                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Faculty Modal */}
            {showModal && (
                <div className="modal-custom-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '0' }}>
                        <div className="cd-hd d-flex align-items-center justify-content-between" style={{ borderBottom: '1px solid var(--g200)', padding: '15px 20px' }}>
                            <span className="cd-t">Add Faculty Account</span>
                            <button className="btn-close" onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px' }}>×</button>
                        </div>
                        <form onSubmit={handleSave} style={{ padding: '20px' }}>
                            <div className="mb-3">
                                <label className="form-label" style={{ fontSize: '12px', fontWeight: '600', marginBottom: '5px', display: 'block' }}>Full Name</label>
                                <input type="text" className="f-input w-100" style={{ height: '38px' }} required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label" style={{ fontSize: '12px', fontWeight: '600', marginBottom: '5px', display: 'block' }}>Email</label>
                                <input type="email" className="f-input w-100" style={{ height: '38px' }} required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label" style={{ fontSize: '12px', fontWeight: '600', marginBottom: '5px', display: 'block' }}>Department</label>
                                <select className="f-input w-100" style={{ height: '38px' }} required value={form.dept} onChange={e => setForm({ ...form, dept: e.target.value })}>
                                    <option value="">Select Department</option>
                                    <option>Computer Science & Engineering</option>
                                    <option>Mathematics</option>
                                    <option>Physics</option>
                                    <option>Electronics</option>
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="form-label" style={{ fontSize: '12px', fontWeight: '600', marginBottom: '5px', display: 'block' }}>Password</label>
                                <input type="password" className="f-input w-100" style={{ height: '38px' }} required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                            </div>
                            <div className="d-flex gap-2 justify-content-end mt-4">
                                <button type="button" className="btn btn-g btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-n btn-sm" disabled={submitting}>
                                    {submitting ? 'Creating...' : 'Create Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminFaculty;
