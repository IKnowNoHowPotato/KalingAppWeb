import React from "react";

export default function StatisticsPanel({ learnersCount = 0, teacherDoc = {}, styles = {} }) {
  return (
    <section>
      <h2>Statistics</h2>
      <div style={styles.statsRow}>
        <div style={styles.statBox}>
          <div style={styles.statNumber}>{learnersCount}</div>
          <div style={styles.statLabel}>Learners</div>
        </div>
        <div style={styles.statBox}>
          <div style={styles.statNumber}>{teacherDoc?.createdAt ? new Date(teacherDoc.createdAt).toLocaleDateString() : '-'}</div>
          <div style={styles.statLabel}>Joined</div>
        </div>
      </div>
      <p style={{ color: '#64748b' }}>More detailed charts and progress metrics can be added here.</p>
    </section>
  );
}
