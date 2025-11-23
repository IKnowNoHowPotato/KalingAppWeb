import React from "react";

export default function StatisticsPanel({ learnersCount = 0, teacherDoc = {}, styles = {} }) {
  return (
    <section>
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Statistics</h1>
        <p className="text-slate-600">Track your teaching metrics and learner progress</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm text-slate-600 font-medium mb-2">Total Learners</p>
          <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">{learnersCount}</div>
          <p className="text-xs text-slate-500">Active learners</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm text-slate-600 font-medium mb-2">Account Created</p>
          <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">
            {teacherDoc?.createdAt ? new Date(teacherDoc.createdAt).toLocaleDateString() : '-'}
          </div>
          <p className="text-xs text-slate-500">Join date</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm text-slate-600 font-medium mb-2">Messages Sent</p>
          <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">—</div>
          <p className="text-xs text-slate-500">To learners</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm text-slate-600 font-medium mb-2">Avg. Engagement</p>
          <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">—</div>
          <p className="text-xs text-slate-500">Coming soon</p>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 md:p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-3">Overview</h3>
        <p className="text-slate-600 text-sm mb-3">
          More detailed charts and progress metrics can be added here. This section will include learner progress trends, 
          engagement analytics, chapter completion rates, and more.
        </p>
        <ul className="space-y-2 text-sm text-slate-600">
          <li>✓ Learner engagement tracking</li>
          <li>✓ Chapter progress analytics</li>
          <li>✓ Message activity logs</li>
          <li>✓ Performance trends</li>
        </ul>
      </div>
    </section>
  );
}
