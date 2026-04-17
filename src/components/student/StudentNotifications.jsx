import React, { useState } from 'react';
import StudentLayout from '../../layouts/StudentLayout';
import { Link } from 'react-router-dom';

const StudentNotifications = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'exams',
      isRead: false,
      iconBg: 'var(--rbg)',
      iconNode: <svg fill="none" height="16" stroke="var(--red)" strokeWidth="2" viewBox="0 0 24 24" width="16"><circle cx="12" cy="12" r="10"></circle><line x1="12" x2="12" y1="8" y2="12"></line></svg>,
      title: '⏰ CS301 Final starts in 2 hours!',
      descHtml: <>Your CS301 Data Structures final exam starts at <strong>10:00 AM today</strong>. Ensure face authentication is complete 15 minutes before.</>,
      linkText: 'Go to Face Auth →',
      linkTo: '/student/faceauth',
      btnClass: 'btn-n'
    },
    {
      id: 2,
      type: 'results',
      isRead: false,
      iconBg: 'var(--gbg)',
      iconNode: <svg fill="none" height="16" stroke="var(--green)" strokeWidth="2" viewBox="0 0 24 24" width="16"><polyline points="20 6 9 17 4 12"></polyline></svg>,
      title: '✅ CS101 Unit 3 Result Published',
      descHtml: <>You scored <strong>78/100 (78%) — Grade B+</strong>. You ranked #14 out of 85 students. Above class average!</>,
      linkText: 'View Detailed Result →',
      linkTo: '/student/results',
      btnClass: 'btn-g'
    },
    {
      id: 3,
      type: 'exams',
      isRead: true,
      iconBg: 'var(--abg)',
      iconNode: '📅',
      title: 'MA201 Mid-term Scheduled',
      descHtml: <>Calculus mid-term has been scheduled for March 15 at 2:00 PM. Duration: 2 hours · 80 marks · AI proctored.</>,
      time: '2 days ago'
    }
  ]);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'unread') return !n.isRead;
    if (activeFilter === 'exams') return n.type === 'exams';
    if (activeFilter === 'results') return n.type === 'results';
    return true;
  });

  return (
    <StudentLayout>
      <div className="pg-intro"><h2>Notifications</h2></div>

      <div className="d-flex gap-2 flex-wrap" style={{ marginBottom: '14px' }}>
        <button className={`btn ${activeFilter === 'all' ? 'btn-n' : 'btn-g'} btn-sm`} onClick={() => setActiveFilter('all')}>All ({notifications.length})</button>
        <button className={`btn ${activeFilter === 'unread' ? 'btn-n' : 'btn-g'} btn-sm`} onClick={() => setActiveFilter('unread')}>Unread {unreadCount > 0 ? `(${unreadCount})` : '(0)'}</button>
        <button className={`btn ${activeFilter === 'exams' ? 'btn-n' : 'btn-g'} btn-sm`} onClick={() => setActiveFilter('exams')}>Exams</button>
        <button className={`btn ${activeFilter === 'results' ? 'btn-n' : 'btn-g'} btn-sm`} onClick={() => setActiveFilter('results')}>Results</button>
        <button className="btn btn-g btn-sm" style={{ marginLeft: 'auto' }} onClick={markAllRead}>Mark all read</button>
      </div>

      <div className="card">
        {filteredNotifications.length === 0 ? (
           <div className="d-flex flex-column align-items-center justify-content-center p-4" style={{ color: 'var(--g500)' }}>
             <p className="mb-0">No notifications found.</p>
           </div>
        ) : filteredNotifications.map((notif, idx) => (
          <div key={notif.id} className="d-flex gap-3 align-items-start" style={{ padding: '13px 0', borderBottom: idx !== filteredNotifications.length - 1 ? '1px solid var(--g50)' : 'none', opacity: notif.isRead ? 0.7 : 1 }}>
            <div className="d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px', borderRadius: '9px', background: notif.iconBg, flexShrink: 0 }}>
              {notif.iconNode}
            </div>
            <div style={{ flex: 1 }}>
              <div className="d-flex justify-content-between" style={{ marginBottom: '3px' }}>
                <div style={{ fontFamily: 'var(--fd)', fontSize: '13px', fontWeight: 700, color: 'var(--g900)' }}>{notif.title}</div>
                {!notif.isRead && (
                  <span style={{ fontSize: '10px', fontWeight: 700, background: 'var(--in1)', color: 'var(--in5)', padding: '2px 7px', borderRadius: '99px' }}>Unread</span>
                )}
              </div>
              <p style={{ fontSize: '13px', color: 'var(--g500)', marginBottom: '0' }}>{notif.descHtml}</p>
              {notif.time && <div style={{ fontSize: '11px', color: 'var(--g300)', marginTop: '4px' }}>{notif.time}</div>}
              {notif.linkTo && (
                <Link className={`btn ${notif.btnClass} btn-xs`} to={notif.linkTo} style={{ marginTop: '8px' }}>{notif.linkText}</Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </StudentLayout>
  );
};

export default StudentNotifications;
