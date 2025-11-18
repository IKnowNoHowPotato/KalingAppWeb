import React from "react";

export default function AccountProfilePanel({
  editState,
  setEditState,
  onSave,
  saving = false,
  styles = {},
  currentUser = {},
  teacherDoc = {},
}) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-4">Profile</h2>
        <div className="flex items-center gap-4">
          <img
            src={currentUser.photoURL || `https://i.pravatar.cc/100?u=${currentUser.uid}`}
            alt="you"
            className="w-20 h-20 rounded-lg object-cover"
          />
          <div>
            <div className="text-lg font-bold">{teacherDoc?.name || currentUser.displayName || currentUser.email}</div>
            <div className="text-sm text-slate-500">Email: {currentUser.email}</div>
            <div className="text-sm text-slate-500">Teacher Code: {teacherDoc?.teacherCode || '—'}</div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-4">Account Management</h2>
        <p className="text-sm text-slate-600 mb-4">Manage your teacher account settings below.</p>
        <label className="block text-sm text-slate-700">Name</label>
        <input
          className="w-full px-3 py-2 rounded border border-gray-200 mb-3"
          value={editState.name}
          onChange={(e) => setEditState((prev) => ({ ...prev, name: e.target.value }))}
        />
        <label className="block text-sm text-slate-700">Subject</label>
        <input
          className="w-full px-3 py-2 rounded border border-gray-200 mb-3"
          value={editState.subject}
          onChange={(e) => setEditState((prev) => ({ ...prev, subject: e.target.value }))}
        />
        <label className="block text-sm text-slate-700">School</label>
        <input
          className="w-full px-3 py-2 rounded border border-gray-200 mb-4"
          value={editState.school}
          onChange={(e) => setEditState((prev) => ({ ...prev, school: e.target.value }))}
        />
        <div>
          <button
            onClick={onSave}
            disabled={saving}
            className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>
    </section>
  );
}
