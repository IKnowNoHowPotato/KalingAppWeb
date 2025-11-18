import React from "react";

export default function ProfilePanel({ currentUser = {}, teacherDoc = {}, styles = {} }) {
  return (
    <section>
      <h2>Profile</h2>
      <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
        <img src={currentUser.photoURL || `https://i.pravatar.cc/100?u=${currentUser.uid}`} alt="you" style={{ width: 100, height: 100, borderRadius: 12 }} />
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{teacherDoc?.name || currentUser.displayName || currentUser.email}</div>
          <div style={{ color: '#64748b' }}>Email: {currentUser.email}</div>
          <div style={{ color: '#64748b' }}>Teacher Code: {teacherDoc?.teacherCode || '—'}</div>
        </div>
      </div>
    </section>
  );
}
