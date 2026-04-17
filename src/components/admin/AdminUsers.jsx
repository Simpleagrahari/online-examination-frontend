import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { getUsers, deleteUser, register as registerUser } from '../../api';
import { toast } from 'react-toastify';

// Validation Schema
const addUserSchema = yup.object().shape({
    role: yup.string().required('Role is required'),
    name: yup.string().required('Full name is required').min(3, 'Name too short'),
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup.string().required('Password is required').min(6, 'Min 6 characters'),
    dept: yup.string().when('role', {
        is: (val) => val === 'faculty' || val === 'student',
        then: () => yup.string().required('Department is required'),
        otherwise: () => yup.string().notRequired()
    }),
    rollNo: yup.string().when('role', {
        is: 'student',
        then: () => yup.string().required('Roll number is required'),
        otherwise: () => yup.string().notRequired()
    })
});

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All Users');
    
    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [formLoading, setFormLoading] = useState(false);

    const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
        resolver: yupResolver(addUserSchema),
        defaultValues: { role: 'student' }
    });

    const selectedRole = watch('role');

    const getInitials = (name) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    const fetchUsers = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const data = await getUsers(token);
            setUsers(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const onAddUserSubmit = async (data) => {
        setFormLoading(true);
        try {
            await registerUser(data);
            toast.success('User Account Created Successfully!');
            setShowModal(false);
            reset();
            fetchUsers();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setFormLoading(false);
        }
    };

    const handleDeleteUser = async (id) => {
        // Find the user object first to check role
        const targetUser = users.find(u => u._id === id);
        
        if (targetUser && targetUser.role === 'admin') {
            toast.error('⛔ Security Alert: Administrator accounts cannot be deleted!');
            return;
        }

        if (!window.confirm(`Are you sure you want to delete ${targetUser?.name || 'this user'}?`)) return;
        
        try {
            const token = sessionStorage.getItem('token');
            await deleteUser(id, token);
            toast.success('User deleted successfully!');
            fetchUsers();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                             (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (u.rollNo && (u.rollNo || '').toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesRole = roleFilter === 'All Users' || 
                           (roleFilter === 'Students' && u.role === 'student') ||
                           (roleFilter === 'Faculty' && (u.role === 'faculty' || u.role === 'admin'));
        
        return matchesSearch && matchesRole;
    });

    if (loading) return <AdminLayout> <div style={{ textAlign: 'center', padding: '50px' }}>Loading Users...</div> </AdminLayout>;
    if (error) return <AdminLayout> <div style={{ color: 'red', textAlign: 'center', padding: '50px' }}>Error: {error}</div> </AdminLayout>;

    return (
        <AdminLayout>
            <div className="pg-intro">
                <h2>User Management</h2>
                <p>Manage all student and faculty accounts</p>
            </div>
            
            <div className="card" style={{ marginBottom: '14px' }}>
                <div className="d-flex gap-2 flex-wrap align-items-center">
                    <div className="hs" style={{ flex: 1, minWidth: '180px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg fill="none" height="14" stroke="var(--g300)" strokeWidth="2" viewBox="0 0 24 24" width="14">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" x2="16.65" y1="21" y2="16.65"></line>
                        </svg>
                        <input 
                            placeholder="Search by name, ID, email…" 
                            className="w-100"
                            style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '13px' }} 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select className="fi" style={{ width: '130px' }} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                        <option>All Users</option>
                        <option>Students</option>
                        <option>Faculty</option>
                    </select>
                    <button className="btn btn-n btn-sm" onClick={() => setShowModal(true)}>+ Add user</button>
                </div>
            </div>

            <div className="card">
                <div className="cd-hd d-flex align-items-center justify-content-between">
                    <span className="cd-t">Showing {filteredUsers.length} Users</span>
                </div>
                <div className="tw">
                    <table className="tbl">
                        <thead>
                            <tr>
                                <th>ID / Roll</th>
                                <th>Name</th>
                                <th>Role</th>
                                <th>Department</th>
                                <th>Face Reg.</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length === 0 ? (
                                <tr><td colSpan="7" style={{ textAlign: 'center' }}>No users found.</td></tr>
                            ) : (
                                filteredUsers.map(u => (
                                    <tr key={u._id}>
                                        <td><span className="tid">{u.rollNo || String(u._id).slice(-6).toUpperCase()}</span></td>
                                        <td>
                                            <div className="td-user d-flex align-items-center gap-2">
                                                <div className="td-av d-inline-flex align-items-center justify-content-center" 
                                                    style={{ 
                                                        background: u.role === 'student' ? 'var(--in5)' : u.role === 'admin' ? 'var(--red)' : 'var(--amber)', 
                                                        width: '28px', height: '28px', borderRadius: '7px', color: '#fff', fontSize: '10px', fontWeight: '800' 
                                                     }}>
                                                    {getInitials(u.name)}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: '600' }}>{u.name}</div>
                                                    <div style={{ fontSize: '10px', color: 'var(--g300)' }}>{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className={`badge ${u.role === 'student' ? 'b-scheduled' : u.role === 'admin' ? 'b-live' : 'b-warn'}`}>{u.role.toUpperCase()}</span></td>
                                        <td>{u.dept || 'General'}</td>
                                        <td>
                                            {u.faceImage ? <span className="badge b-pass">✓ Done</span> : <span className="badge b-draft">Not Reg.</span>}
                                        </td>
                                        <td><span className="badge b-pass">Active</span></td>
                                        <td>
                                            <div className="d-flex gap-1">
                                                <button className="btn btn-danger btn-xs" style={{ background: 'rgba(220,38,38,.1)', color: 'var(--red)', border: 'none' }} title="Delete user" onClick={() => handleDeleteUser(u._id)}>
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

            {/* Add User Modal */}
            {showModal && (
                <div className="modal-custom-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div className="card border-0 shadow-lg" style={{ width: '100%', maxWidth: '500px', padding: '0', borderRadius: '15px' }}>
                        <div className="cd-hd d-flex align-items-center justify-content-between p-4" style={{ borderBottom: '1px solid #eee' }}>
                            <h5 className="mb-0 fw-bold">Register New Account</h5>
                            <button className="btn-close" onClick={() => setShowModal(false)}></button>
                        </div>
                        <form onSubmit={handleSubmit(onAddUserSubmit)} className="p-4">
                            <div className="mb-3 text-start">
                                <label className="form-label small fw-bold text-muted text-uppercase mb-2">Account Role</label>
                                <select className={`form-select ${errors.role ? 'is-invalid' : ''}`} {...register('role')}>
                                    <option value="student">Student</option>
                                    <option value="faculty">Faculty</option>
                                    <option value="admin">Administrator</option>
                                </select>
                                {errors.role && <div className="invalid-feedback">{errors.role.message}</div>}
                            </div>

                            <div className="mb-3 text-start">
                                <label className="form-label small fw-bold text-muted text-uppercase mb-2">Full Name</label>
                                <input type="text" className={`form-control ${errors.name ? 'is-invalid' : ''}`} placeholder="e.g. Rahul Kumar" {...register('name')} />
                                {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
                            </div>

                            <div className="mb-3 text-start">
                                <label className="form-label small fw-bold text-muted text-uppercase mb-2">Email Address</label>
                                <input type="email" className={`form-control ${errors.email ? 'is-invalid' : ''}`} placeholder="name@college.edu" {...register('email')} />
                                {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
                            </div>

                            {selectedRole === 'student' && (
                                <div className="mb-3 text-start">
                                    <label className="form-label small fw-bold text-muted text-uppercase mb-2">Roll Number</label>
                                    <input type="text" className={`form-control ${errors.rollNo ? 'is-invalid' : ''}`} placeholder="CS2021001" {...register('rollNo')} />
                                    {errors.rollNo && <div className="invalid-feedback">{errors.rollNo.message}</div>}
                                </div>
                            )}

                            {(selectedRole === 'student' || selectedRole === 'faculty') && (
                                <div className="mb-3 text-start">
                                    <label className="form-label small fw-bold text-muted text-uppercase mb-2">Department</label>
                                    <select className={`form-select ${errors.dept ? 'is-invalid' : ''}`} {...register('dept')}>
                                        <option value="">Select Department</option>
                                        <option value="Computer Science">Computer Science & Engineering</option>
                                        <option value="Mathematics">Mathematics</option>
                                        <option value="Physics">Physics</option>
                                        <option value="Electronics">Electronics</option>
                                    </select>
                                    {errors.dept && <div className="invalid-feedback">{errors.dept.message}</div>}
                                </div>
                            )}

                            <div className="mb-4 text-start">
                                <label className="form-label small fw-bold text-muted text-uppercase mb-2">Password</label>
                                <input type="password" className={`form-control ${errors.password ? 'is-invalid' : ''}`} placeholder="Create initial password" {...register('password')} />
                                {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
                            </div>

                            <div className="d-flex gap-2 justify-content-end pt-3" style={{ borderTop: '1px solid #eee' }}>
                                <button type="button" className="btn btn-light px-4" onClick={() => setShowModal(false)} style={{ borderRadius: '8px' }}>Cancel</button>
                                <button type="submit" className="btn btn-primary px-4 fw-bold" disabled={formLoading} style={{ borderRadius: '8px', background: 'var(--in5)', border: 'none' }}>
                                    {formLoading ? 'Creating...' : 'Create Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminUsers;
