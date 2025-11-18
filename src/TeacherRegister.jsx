import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "./firebase";
import { createUserWithEmailAndPassword, updateProfile, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function TeacherRegister() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [subject, setSubject] = useState("");
  const [school, setSchool] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim()) return setErrorMsg("Please enter your full name.");
    if (!email.trim()) return setErrorMsg("Please enter your email.");
    if (password.length < 6) return setErrorMsg("Password must be at least 6 characters.");
    if (password !== confirmPassword) return setErrorMsg("Passwords do not match.");

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Set display name
      try {
        await updateProfile(user, { displayName: name });
      } catch (err) {
        // Non-fatal
        console.warn("updateProfile failed:", err);
      }

      // Generate a unique 6-character alphanumeric teacher code
      const generateCode = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let out = "";
        for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
        return out;
      };

      // Ensure the auth state has propagated to the client SDK before we attempt
      // a security-rule-guarded write. Some browsers may not have auth.currentUser
      // populated immediately after createUserWithEmailAndPassword.
      try {
        if (!auth.currentUser || auth.currentUser.uid !== user.uid) {
          console.debug("Waiting for auth.currentUser to be set...");
          await new Promise((resolve) => {
            const unsub = onAuthStateChanged(auth, (u) => {
              if (u && u.uid === user.uid) {
                unsub();
                resolve();
              }
            });
          });
        }
        // Force-refresh token to ensure Firestore requests carry a fresh auth token
        try {
          await auth.currentUser.getIdToken(true);
        } catch (tokenErr) {
          console.warn("getIdToken failed:", tokenErr);
        }
        console.debug("auth.currentUser ready:", auth.currentUser?.uid, "user.uid:", user.uid);
      } catch (err) {
        console.warn("Auth readiness check failed:", err);
      }

      let teacherCode = null;
      const maxAttempts = 8;
      // Reserve a teacher code by attempting to create a doc at /teacherCodes/{code}.
      // Firestore rules allow creation only if the doc does not already exist, so a write
      // failure with permission-denied typically means the code is already taken.
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const candidate = generateCode();
        try {
          await setDoc(doc(db, "teacherCodes", candidate), {
            uid: user.uid,
            createdAt: new Date().toISOString(),
          });
          // Successful reservation
          teacherCode = candidate;
          break;
        } catch (err) {
          console.warn("teacher code reservation attempt failed", err);
          // If permission denied, that usually indicates the document already exists (collision)
          // so we should try another code. For other errors, rethrow.
          if (err?.code === "permission-denied" || String(err).includes("permission")) {
            // collision or rule prevented write; try next candidate
            continue;
          }
          throw err;
        }
      }
      if (!teacherCode) {
        throw new Error("Failed to generate a unique teacher code. Please try again.");
      }

      // Save teacher profile in Firestore under `users` collection (role: teacher)
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name,
        email,
        role: "teacher",
        subject: subject || null,
        school: school || null,
        teacherCode,
        createdAt: new Date().toISOString(),
      });

      // Add teacherCode into localStorage currentUser blob for easy access in UI
      try {
        const userObj = { ...(user || {}), teacherCode };
        localStorage.setItem("currentUser", JSON.stringify(userObj));
      } catch (err) {
        // ignore localStorage errors
      }
      navigate("/profile");
    } catch (err) {
      console.error(err);
      switch (err.code) {
        case "auth/email-already-in-use":
          setErrorMsg("This email is already in use. Try logging in.");
          break;
        case "auth/invalid-email":
          setErrorMsg("Invalid email address.");
          break;
        case "auth/operation-not-allowed":
          setErrorMsg("Operation not allowed. Check Firebase settings.");
          break;
        case "auth/weak-password":
          setErrorMsg("Weak password. Choose a stronger password.");
          break;
        default:
          setErrorMsg(err.message || "Registration failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.body}>
      <div style={styles.box}>
        <h2>Teacher Registration</h2>
        <form onSubmit={handleRegister} style={styles.form}>
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="text"
            placeholder="Subject(s) taught (optional)"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            style={styles.input}
          />
          <input
            type="text"
            placeholder="School / Institution (optional)"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            style={styles.input}
          />

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Registering..." : "Register as Teacher"}
          </button>
        </form>
        {errorMsg && <p style={styles.error}>{errorMsg}</p>}

        <p style={{ marginTop: 12 }}>
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            style={{ ...styles.linkButton }}
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}

const styles = {
  body: {
    fontFamily: "'Segoe UI', sans-serif",
    background: "#4ddd87",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    margin: 0,
    color: "#0f172a",
  },
  box: {
    background: "#f8fafc",
    padding: "36px",
    borderRadius: "10px",
    width: "420px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
    textAlign: "center",
  },
  form: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  input: {
    width: '85%',
    padding: '10px',
    margin: '8px 0',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    fontSize: '14px',
  },
  button: {
    width: '90%',
    padding: '12px',
    marginTop: '12px',
    border: 'none',
    borderRadius: '8px',
    background: '#0ea5a4',
    color: '#fff',
    fontWeight: '600',
    cursor: 'pointer',
  },
  error: { color: '#ef4444', fontSize: '13px', marginTop: '10px' },
  linkButton: {
    background: 'transparent',
    border: 'none',
    color: '#0ea5a4',
    cursor: 'pointer',
    textDecoration: 'underline',
    padding: 0,
    fontSize: '14px'
  }
};
