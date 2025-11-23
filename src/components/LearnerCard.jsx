export default function LearnerCard({ profileName, email, chapter, onMessage, avatar, selectable = false, checked = false, onToggle }) {
  return (
    <div className="relative bg-white rounded-lg border border-slate-200 p-4 md:p-5 transition-all duration-300 ease-out hover:shadow-lg hover:-translate-y-1">
      {selectable && (
        <label className="absolute top-3 left-3">
          <input type="checkbox" checked={checked} onChange={onToggle} className="w-4 h-4 md:w-5 md:h-5" />
        </label>
      )}
      {/* Header with Avatar and Name */}
      <div className="flex items-start gap-4 mb-4">
        <img
          src={avatar || `https://i.pravatar.cc/80?u=${profileName}`}
          alt={profileName}
          className="w-14 h-14 rounded-full flex-shrink-0 object-cover border-2 border-slate-200"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 text-sm truncate">{profileName || 'Unnamed'}</h3>
          <p className="text-xs text-slate-500 truncate">{email || 'No email'}</p>
          <div className="mt-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              ✓ Active
            </span>
          </div>
        </div>
      </div>

      {/* Chapter Display */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-600 font-semibold">Chapter</p>
          <span className="text-sm font-bold text-slate-900">{chapter ? `Chapter ${chapter}` : 'Chapter 1'}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full">
        <button
          onClick={onMessage}
          className="w-full px-3 py-2.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-100 transition duration-200"
        >
          ✉ Message
        </button>
      </div>
    </div>
  );
}
