// src/login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, provider, db } from "./firebase";
import { signInWithEmailAndPassword, signInWithPopup, signOut } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg(""); // Clear previous error
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  // Debug: log auth state and uid to help diagnose permissions issues
  console.debug("login: signed in user", { uid: user?.uid, authCurrent: auth.currentUser?.uid });

      // Ensure this user exists in `users` collection and has role 'teacher'
  // Debug: ensure we're authenticated before reading
  console.debug("login: attempting to read users/" + user.uid);
  const teacherDoc = await getDoc(doc(db, "users", user.uid));
      if (!teacherDoc.exists() || teacherDoc.data().role !== "teacher") {
        // Not a teacher account — sign out and show message
        await signOut(auth);
        setErrorMsg("This account is not registered as a teacher. Please register first.");
        return;
      }

      // Update lastLogin in the teacher doc
      // Debug: attempting to update lastLogin
      console.debug("login: attempting to update lastLogin for", user.uid);
      await setDoc(
        doc(db, "users", user.uid),
        { lastLogin: new Date().toISOString() },
        { merge: true }
      );

      localStorage.setItem("currentUser", JSON.stringify(user));
      navigate("/profile");
    } catch (err) {
      // Friendly error messages
      switch (err.code) {
        case "auth/invalid-email":
          setErrorMsg("Invalid email address.");
          break;
        case "auth/user-disabled":
          setErrorMsg("This user account has been disabled.");
          break;
        case "auth/user-not-found":
          setErrorMsg("User not found. Please sign up first.");
          break;
        case "auth/wrong-password":
          setErrorMsg("Incorrect password.");
          break;
        case "auth/operation-not-allowed":
          setErrorMsg("Email/Password sign-in is not enabled. Enable it in Firebase.");
          break;
        default:
          setErrorMsg(err.message);
      }
    }
  };

  const loginWithGoogle = async () => {
    setErrorMsg(""); // Clear previous error
    try {
      const result = await signInWithPopup(auth, provider);
  const user = result.user;
  console.debug("google sign-in: user", { uid: user?.uid, authCurrent: auth.currentUser?.uid });

  // Only allow login if user exists in `users` and has role 'teacher'
  console.debug("google: attempting to read users/" + user.uid);
  const teacherDoc = await getDoc(doc(db, "users", user.uid));
      if (!teacherDoc.exists() || teacherDoc.data().role !== "teacher") {
        await signOut(auth);
        setErrorMsg("Google account is not registered as a teacher. Please register first.");
        return;
      }

      // Update lastLogin in `users`
      console.debug("google: attempting to update lastLogin for", user.uid);
      await setDoc(
        doc(db, "users", user.uid),
        { lastLogin: new Date().toISOString() },
        { merge: true }
      );

      localStorage.setItem("currentUser", JSON.stringify(user));
      navigate("/profile");
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div style={styles.body}>
      <div style={styles.loginBox}>
        <h2>Login</h2>
        <form
          onSubmit={handleLogin}
          style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
        >
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
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
          <button type="submit" style={styles.button}>
            Login
          </button>
        </form>
        <button
          style={{ ...styles.button, ...styles.googleBtn }}
          onClick={loginWithGoogle}
        >
          <img
            src="https://www.svgrepo.com/show/355037/google.svg"
            alt="Google"
            style={styles.googleImg}
          />{" "}
          Login with Google
        </button>
        <button
          style={{ ...styles.button, marginTop: 8, background: '#0ea5a4' }}
          onClick={() => navigate('/register-teacher')}
        >
          Register as Teacher
        </button>
        {errorMsg && <p style={styles.error}>{errorMsg}</p>}
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
    color: "#f1f5f9",
  },
  loginBox: {
    background: "#8bb99c",
    padding: "40px",
    borderRadius: "12px",
    width: "320px",
    boxShadow: "0 0 20px rgba(0,0,0,0.5)",
    textAlign: "center",
  },
  input: {
    width: "75%",
    padding: "12px",
    margin: "10px 0",
    border: "none",
    borderRadius: "8px",
    background: "#c9e4d4",
    color: "#0f172a",
    fontSize: "15px",
  },
  button: {
    width: "100%",
    padding: "12px",
    marginTop: "15px",
    border: "none",
    borderRadius: "8px",
    background: "#4caf50",
    color: "#0f172a",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background 0.3s",
  },
  googleBtn: {
    background: "#ffffff",
    color: "#0f172a",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
    marginTop: "10px",
  },
  googleImg: { width: "18px", height: "18px" },
  error: { color: "#f87171", fontSize: "14px", marginTop: "10px" },
};
