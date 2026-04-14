import React, { useState } from 'react';
import StudentLayout from '../../layouts/StudentLayout';
import { Link } from 'react-router-dom';

const StudentNotifications = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  return (
    <StudentLayout>
      <div className="pg-intro"><h2>Notifications</h2></div>

      <div className="d-flex gap-2 flex-wrap" style={{ marginBottom: '14px' }}>
        <button className={`btn ${activeFilter === 'all' ? 'btn-n' : 'btn-g'} btn-sm`} onClick={() => setActiveFilter('all')}>All (6)</button>
        <button className={`btn ${activeFilter === 'unread' ? 'btn-n' : 'btn-g'} btn-sm`} onClick={() => setActiveFilter('unread')}>Unread (3)</button>
        <button className={`btn ${activeFilter === 'exams' ? 'btn-n' : 'btn-g'} btn-sm`} onClick={() => setActiveFilter('exams')}>Exams</button>
        <button className={`btn ${activeFilter === 'results' ? 'btn-n' : 'btn-g'} btn-sm`} onClick={() => setActiveFilter('results')}>Results</button>
        <button className="btn btn-g btn-sm" style={{ marginLeft: 'auto' }}>Mark all read</button>
      </div>

      <div className="card">
        {/* Notification 1 */}
        <div className="d-flex gap-3 align-items-start" style={{ padding: '13px 0', borderBottom: '1px solid var(--g50)' }}>
          <div className="d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px', borderRadius: '9px', background: 'var(--rbg)', flexShrink: 0 }}>
            <svg fill="none" height="16" stroke="var(--red)" strokeWidth="2" viewBox="0 0 24 24" width="16">
              <circle cx="12" cy="12" r="10"></circle><line x1="12" x2="12" y1="8" y2="12"></line>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div className="d-flex justify-content-between" style={{ marginBottom: '3px' }}>
              <div style={{ fontFamily: 'var(--fd)', fontSize: '13px', fontWeight: 700, color: 'var(--g900)' }}>⏰ CS301 Final starts in 2 hours!</div>
              <span style={{ fontSize: '10px', fontWeight: 700, background: 'var(--in1)', color: 'var(--in5)', padding: '2px 7px', borderRadius: '99px' }}>Unread</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--g500)' }}>Your CS301 Data Structures final exam starts at <strong>10:00 AM today</strong>. Ensure face authentication is complete 15 minutes before.</p>
            <Link className="btn btn-n btn-xs" to="/student/faceauth" style={{ marginTop: '8px' }}>Go to Face Auth →</Link>
          </div>
        </div>

        {/* Notification 2 */}
        <div className="d-flex gap-3 align-items-start" style={{ padding: '13px 0', borderBottom: '1px solid var(--g50)' }}>
          <div className="d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px', borderRadius: '9px', background: 'var(--gbg)', flexShrink: 0 }}>
            <svg fill="none" height="16" stroke="var(--green)" strokeWidth="2" viewBox="0 0 24 24" width="16">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--fd)', fontSize: '13px', fontWeight: 700, color: 'var(--g900)', marginBottom: '3px' }}>✅ CS101 Unit 3 Result Published</div>
            <p style={{ fontSize: '13px', color: 'var(--g500)' }}>You scored <strong>78/100 (78%) — Grade B+</strong>. You ranked #14 out of 85 students. Above class average!</p>
            <Link className="btn btn-g btn-xs" to="/student/results" style={{ marginTop: '8px' }}>View Detailed Result →</Link>
          </div>
        </div>

        {/* Notification 3 */}
        <div className="d-flex gap-3 align-items-start" style={{ padding: '13px 0', opacity: 0.7 }}>
          <div className="d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px', borderRadius: '9px', background: 'var(--abg)', flexShrink: 0 }}>📅</div>
          <div>
            <div style={{ fontFamily: 'var(--fd)', fontSize: '13px', fontWeight: 700, color: 'var(--g900)', marginBottom: '3px' }}>MA201 Mid-term Scheduled</div>
            <p style={{ fontSize: '13px', color: 'var(--g500)' }}>Calculus mid-term has been scheduled for March 15 at 2:00 PM. Duration: 2 hours · 80 marks · AI proctored.</p>
            <div style={{ fontSize: '11px', color: 'var(--g300)', marginTop: '4px' }}>2 days ago</div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentNotifications;
