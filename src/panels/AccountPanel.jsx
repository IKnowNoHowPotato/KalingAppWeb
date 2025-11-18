import React from "react";

export default function AccountPanel({ editState, setEditState, onSave, saving = false, styles = {} }) {
  return (
    <section>
      <h2>Account Management</h2>
      <div style={{ maxWidth: 640 }}>
        <p>Manage your teacher account settings below.</p>
        <label style={styles.label}>Name</label>
        <input style={styles.input} value={editState.name} onChange={(e) => setEditState(prev => ({...prev, name: e.target.value}))} />
        <label style={styles.label}>Subject</label>
        <input style={styles.input} value={editState.subject} onChange={(e) => setEditState(prev => ({...prev, subject: e.target.value}))} />
        <label style={styles.label}>School</label>
        <input style={styles.input} value={editState.school} onChange={(e) => setEditState(prev => ({...prev, school: e.target.value}))} />
        <div style={{ marginTop: 12 }}>
          <button onClick={onSave} style={styles.saveBtn} disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</button>
        </div>
      </div>
    </section>
  );
}
