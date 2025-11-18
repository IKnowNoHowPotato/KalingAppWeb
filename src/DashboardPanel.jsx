// src/ProfileSelection.jsx — remade into a panel dashboard with tabs
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { db, auth } from "./firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { Users, TrendingUp, Award, Clock, Menu, X, BookOpen } from "lucide-react";

import LearnersPanel from "./panels/LearnersPanel.jsx";
import StatisticsPanel from "./panels/StatisticsPanel.jsx";
import AccountProfilePanel from "./panels/AccountProfilePanel.jsx";
import QuizPanel from "./panels/QuizPanel.jsx";
import StatCard from "./components/StatCard.jsx";
import LearnerCard from "./components/LearnerCard.jsx";


export default function ProfileSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const [tab, setTab] = useState("learners");
  const [loading, setLoading] = useState(true);
  const [learnersCount, setLearnersCount] = useState(0);
  const [teacherDoc, setTeacherDoc] = useState(null);
  const [showCode, setShowCode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editState, setEditState] = useState({ name: "", subject: "", school: "" });
  const [saving, setSaving] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  // Student dashboard UI state (moved to top-level to satisfy React hooks rules)
  const [chapter, setChapter] = useState("1");
  const [dropdownOpenSmall, setDropdownOpenSmall] = useState(false);

  const handleChapterChange = (e) => setChapter(e.target.value);

  useEffect(() => {
    const init = async () => {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      if (!currentUser) {
        navigate("/login");
        return;
      }

      try {
        // Fetch teacher document
          const tDocRef = doc(db, "users", currentUser.uid);
        const tSnap = await getDoc(tDocRef);
        if (tSnap.exists()) {
          const data = tSnap.data();
          setTeacherDoc({ id: tSnap.id, ...data });
          setEditState({ name: data.name || "", subject: data.subject || "", school: data.school || "" });
        }

  // learners are loaded by the LearnersPanel via collectionGroup
  // parent will receive count updates from child
      } catch (err) {
        console.error("Error loading profile selection data:", err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn("Error signing out:", err);
    }
    localStorage.removeItem("currentUser");
    localStorage.removeItem("currentProfile");
    navigate("/login");
  };

  const goToDashboardWithLearner = (learner) => {
    localStorage.setItem("currentProfile", JSON.stringify(learner));
    navigate("/dashboard");
  };



  const saveAccount = async () => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) return;
    setSaving(true);
    try {
      await setDoc(doc(db, "users", currentUser.uid), {
        name: editState.name,
        subject: editState.subject,
        school: editState.school,
      }, { merge: true });
      // refresh local teacherDoc
      const tSnap = await getDoc(doc(db, "users", currentUser.uid));
      if (tSnap.exists()) setTeacherDoc({ id: tSnap.id, ...tSnap.data() });
    } catch (err) {
      console.error("Failed to save account:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 24, textAlign: 'center' }}>Loading dashboard...</div>;

  const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {};
  const currentProfile = JSON.parse(localStorage.getItem("currentProfile"));

  // If we're on the /dashboard route, render the student dashboard UI (design-only placeholders)
  if (location.pathname === "/dashboard") {
    return (
      <div style={studentStyles.container}>
        <div style={studentStyles.sidebar}>
          <h2 style={{ margin: 0 }}>{(currentProfile && currentProfile.name) ? `${currentProfile.name}'s Dashboard` : 'Student Dashboard'}</h2>

          <div style={studentStyles.dropdown}>
            <select value={chapter} onChange={handleChapterChange} style={studentStyles.select}>
              <option value="1">Chapter 1</option>
              <option value="2">Chapter 2</option>
              <option value="3">Chapter 3</option>
              <option value="overall">Overall</option>
            </select>
          </div>

          <div style={studentStyles.profileDropdown}>
            <button style={studentStyles.profileBtn} onClick={() => setDropdownOpenSmall(!dropdownOpenSmall)}>
              👤 Profile ▾
            </button>
            {dropdownOpenSmall && (
              <div style={studentStyles.dropdownMenu}>
                <a href="/profile">My Profile</a>
                <a href="/login">Logout</a>
              </div>
            )}
          </div>
          <div style={{ marginTop: 'auto', padding: 12 }}>
            <button
              onClick={() => { localStorage.removeItem('currentProfile'); navigate('/profile'); }}
              style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: '#0ea5a4', color: '#fff', cursor: 'pointer', width: '100%' }}
            >
              Back to Console
            </button>
          </div>
        </div>

        <div style={studentStyles.main}>
          {/* Design-only summary cards */}
          <div style={studentStyles.summarySection}>
            <div style={studentStyles.summaryCard}>
              <h3>Reading Summary</h3>
              <p style={{ color: '#0f172a' }}>—</p>
            </div>
            <div style={studentStyles.summaryCard}>
              <h3>Visual Summary</h3>
              <p style={{ color: '#0f172a' }}>—</p>
            </div>
            <div style={studentStyles.summaryCard}>
              <h3>Auditory Summary</h3>
              <p style={{ color: '#0f172a' }}>—</p>
            </div>
          </div>

          <div style={studentStyles.progressSection}>
            <h3>Progress</h3>
            <div>Visual
              <div style={studentStyles.progressBar}><div style={{...studentStyles.progressFill, width: '0%'}}></div></div>
            </div>
            <div>Reading
              <div style={studentStyles.progressBar}><div style={{...studentStyles.progressFill, width: '0%'}}></div></div>
            </div>
            <div>Auditory
              <div style={studentStyles.progressBar}><div style={{...studentStyles.progressFill, width: '0%'}}></div></div>
            </div>
          </div>

          <div style={studentStyles.historySection}>
            <h3>Student Activity History</h3>
            <div style={studentStyles.historyItem}>No activity yet</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-40 p-2 lg:hidden bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white flex flex-col transition-all duration-300 z-30 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center">
              <Users size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Teacher</h1>
              <p className="text-xs text-slate-400">Console</p>
            </div>
          </div>
          <div className="text-xs text-slate-400 mt-3 space-y-1">
            <p>{teacherDoc?.teacherCode ? (showCode ? `Code: ${teacherDoc.teacherCode}` : 'Code: ••••••') : 'Loading...'}</p>
            {teacherDoc?.teacherCode && (
              <button
                onClick={() => setShowCode((s) => !s)}
                className="text-cyan-400 hover:text-cyan-300 transition text-xs font-medium"
              >
                {showCode ? '🔒 Hide' : '👁 Show'}
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'learners', label: 'Learners', icon: Users },
            { id: 'quizzes', label: 'Quizzes', icon: BookOpen },
            { id: 'statistics', label: 'Statistics', icon: TrendingUp },
            { id: 'account', label: 'Account', icon: Award }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                setTab(id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                tab === id
                  ? 'bg-cyan-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 font-medium"
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        <div className="p-4 sm:p-8">
          {tab === 'learners' && (
            teacherDoc?.teacherCode ? (
              <div>
                {/* Header */}
                <div className="mb-8">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Dashboard</h1>
                      <p className="text-slate-600">Manage and track your learners' progress</p>
                    </div>

                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard 
                      title="Total Learners" 
                      value="24" 
                      change="+2 this week" 
                      icon={Users}
                      color="from-blue-500 to-blue-600"
                    />
                    <StatCard 
                      title="Avg. Progress" 
                      value="68%" 
                      change="+5% from last week" 
                      icon={TrendingUp}
                      color="from-emerald-500 to-emerald-600"
                    />
                    <StatCard 
                      title="Top Performers" 
                      value="8" 
                      change="Excellent progress" 
                      icon={Award}
                      color="from-amber-500 to-amber-600"
                    />
                    <StatCard 
                      title="Active Today" 
                      value="19" 
                      change="79% engagement" 
                      icon={Clock}
                      color="from-purple-500 to-purple-600"
                    />
                  </div>
                </div>

                {/* Learners Section */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">Learners</h2>
                      <p className="text-sm text-slate-600 mt-1">{learnersCount} total learners</p>
                    </div>
                    <input
                      type="search"
                      placeholder="Search learners..."
                      className="px-4 py-2 bg-white border border-slate-300 rounded-lg placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hidden sm:block"
                    />
                  </div>
                  <LearnersPanel teacherCode={teacherDoc?.teacherCode} onSelectLearner={goToDashboardWithLearner} onCountChange={setLearnersCount} styles={styles} reloadKey={reloadKey} />
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-slate-600">Loading teacher profile or teacher code…</div>
            )
          )}

          {tab === 'statistics' && (
            <StatisticsPanel learnersCount={learnersCount} teacherDoc={teacherDoc} styles={styles} />
          )}

          {tab === 'quizzes' && (
            <div>
              {/* Header */}
              <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Quiz Management</h1>
                    <p className="text-slate-600">Create and manage quizzes for your students</p>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    title="Active Quizzes"
                    value="3"
                    change="Visible to students"
                    icon={BookOpen}
                    color="from-purple-500 to-purple-600"
                  />
                  <StatCard
                    title="Completed Today"
                    value="8"
                    change="+23% from yesterday"
                    icon={Award}
                    color="from-green-500 to-green-600"
                  />
                  <StatCard
                    title="Avg. Score"
                    value="85%"
                    change="+5% from last week"
                    icon={TrendingUp}
                    color="from-blue-500 to-blue-600"
                  />
                  <StatCard
                    title="Questions Created"
                    value="47"
                    change="Across all quizzes"
                    icon={Clock}
                    color="from-yellow-500 to-yellow-600"
                  />
                </div>
              </div>

              {/* Quiz Panel */}
              <QuizPanel teacherCode={teacherDoc?.teacherCode} />
            </div>
          )}

          {tab === 'account' && (
            <AccountProfilePanel
              editState={editState}
              setEditState={setEditState}
              onSave={saveAccount}
              saving={saving}
              styles={styles}
              currentUser={currentUser}
              teacherDoc={teacherDoc}
            />
          )}
        </div>
      </main>
    </div>
  );
}

const styles = {
  container: { display: 'flex', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif" },
  sidebar: { width: 220, background: '#0f172a', color: '#fff', display: 'flex', flexDirection: 'column', padding: 16 },
  brand: { marginBottom: 18 },
  nav: { display: 'flex', flexDirection: 'column', gap: 8 },
  tab: { background: 'transparent', color: '#cbd5e1', border: 'none', padding: 10, textAlign: 'left', cursor: 'pointer', borderRadius: 6 },
  activeTab: { background: '#061827', color: '#fff', border: 'none', padding: 10, textAlign: 'left', cursor: 'pointer', borderRadius: 6 },
  logoutBtn: { width: '100%', padding: 10, background: '#ef4444', border: 'none', color: '#fff', borderRadius: 6, cursor: 'pointer' },
  main: { flex: 1, padding: 28, background: '#f8fafc' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 },
  card: { display: 'flex', gap: 12, alignItems: 'center', padding: 12, background: '#fff', borderRadius: 8, cursor: 'pointer', boxShadow: '0 6px 18px rgba(2,6,23,0.06)' },
  avatar: { width: 58, height: 58, borderRadius: 8, objectFit: 'cover' },
  statsRow: { display: 'flex', gap: 12, marginTop: 12 },
  statBox: { flex: 1, background: '#fff', padding: 18, borderRadius: 8, textAlign: 'center' },
  statNumber: { fontSize: 28, fontWeight: 700 },
  statLabel: { color: '#64748b' },
  label: { display: 'block', marginTop: 12, marginBottom: 6, color: '#334155' },
  input: { width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' },
  saveBtn: { padding: '10px 14px', background: '#0ea5a4', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }
};

const studentStyles = {
  container: { display: "flex", fontFamily: "'Segoe UI', sans-serif", height: "100vh", margin: 0 },
  sidebar: { width: "220px", background: "#4caf50", padding: "20px", boxSizing: "border-box" },
  dropdown: { marginBottom: "20px" },
  select: { width: "100%", padding: "12px", border: "none", borderRadius: "10px", background: "#4ddd87", color: "#f1f5f9", fontSize: "15px", cursor: "pointer" },
  profileDropdown: { marginTop: "20px" },
  profileBtn: { width: "100%", padding: "12px", border: "none", borderRadius: "10px", background: "#4ddd87", color: "#f1f5f9", fontSize: "15px", cursor: "pointer", textAlign: "left" },
  dropdownMenu: { display: "flex", flexDirection: "column", marginTop: "10px", background: "#3da94c", borderRadius: "8px", overflow: "hidden" },
  main: { flex: 1, padding: "20px", overflowY: "auto" },
  summarySection: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: "20px" },
  summaryCard: { background: "#4ddd87", padding: "20px", borderRadius: "12px" },
  progressSection: { marginTop: "20px", background: "#4ddd87", padding: "20px", borderRadius: "12px" },
  progressBar: { background: "#fff7dd", borderRadius: "8px", overflow: "hidden", margin: "10px 0" },
  progressFill: { height: "12px", borderRadius: "8px", background: "#95d1c6" },
  historySection: { marginTop: "20px", background: "#ffffff", color: "#333", padding: "20px", borderRadius: "12px" },
  historyItem: { padding: "10px", borderLeft: "4px solid #4caf50", marginBottom: "10px", background: "#f9f9f9", borderRadius: "6px" }
};
