import React, { useEffect, useState } from "react";
import { collectionGroup, query, where, getDocs, collection, addDoc, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import LearnerCard from "../components/LearnerCard.jsx";

export default function LearnersPanel({ teacherCode, onSelectLearner, onCountChange = () => {}, styles = {}, reloadKey = 0 }) {
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedLearner, setSelectedLearner] = useState(null);
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    const fetchLearners = async () => {
      setLoading(true);
      try {
        console.debug("LearnersPanel.fetchLearners: teacherCode=" + teacherCode, "auth.uid=", auth.currentUser?.uid);
        if (!teacherCode) {
          setLearners([]);
          onCountChange(0);
          setLoading(false);
          return;
        }

        // Query across all users' gameProfiles subcollections where teacherCode matches
        const q = query(collectionGroup(db, "gameProfiles"), where("teacherCode", "==", teacherCode));
        console.debug("LearnersPanel.fetchLearners: running query for teacherCode", teacherCode);
        let snap;
        try {
          snap = await getDocs(q);
        } catch (err) {
          // If query is denied by rules (common if collectionGroup reads are restricted),
          // fall back to reading the current teacher's own gameProfiles subcollection so
          // sample/test data created under the teacher's account is visible.
          console.warn('LearnersPanel: collectionGroup query failed, attempting fallback to own gameProfiles', err?.code);
          if (err?.code === 'permission-denied') {
            try {
              const ownSnap = await getDocs(collection(db, 'users', auth.currentUser?.uid, 'gameProfiles'));
              const resultsOwn = ownSnap.docs.map((d) => ({ id: d.id, ...d.data(), _pathSegments: d.ref.path.split('/') }));

              // Augment fallback results with chapter and email data
              const mappedOwn = [];
              for (const r of resultsOwn) {
                const userId = auth.currentUser?.uid;

                // Calculate current chapter from chapterProgress
                const chapterProgress = r.chapterProgress || {};
                const completedChapters = Object.keys(chapterProgress).filter(key => chapterProgress[key] === true);
                const highestCompleted = completedChapters.length > 0
                  ? Math.max(...completedChapters.map(ch => parseInt(ch)))
                  : 0;
                const currentChapter = highestCompleted + 1;

                // Fetch user document to get email (teacher's own email in this case)
                let userEmail = 'No email';
                if (userId) {
                  try {
                    const userDoc = await getDoc(doc(db, 'users', userId));
                    if (userDoc.exists()) {
                      const userData = userDoc.data();
                      userEmail = userData.email || 'No email';
                    }
                  } catch (err) {
                    console.warn('Failed to fetch own email for accountId:', userId, err);
                  }
                }

                mappedOwn.push({
                  ...r,
                  accountId: userId,
                  chapter: currentChapter,
                  email: userEmail,
                  name: r.profileName || r.name || 'Unnamed'
                });
              }

              setLearners(mappedOwn);
              onCountChange(resultsOwn.length);
              setLoading(false);
              return;
            } catch (ownErr) {
              console.error('LearnersPanel fallback also failed:', ownErr);
              throw ownErr;
            }
          }
          throw err;
        }
        const results = snap.docs.map((d) => ({ id: d.id, ...d.data(), _pathSegments: d.ref.path.split('/') }));

        // Augment each profile with their account userId, calculate current chapter,
        // and fetch user email from user document
        const profilesWithUserData = [];
        for (const r of results) {
          // r._pathSegments example: ['users', '<uid>', 'gameProfiles', '<profileId>']
          const segments = r._pathSegments;
          const userIndex = segments.indexOf('users');
          const userId = userIndex !== -1 && segments.length > userIndex + 1 ? segments[userIndex + 1] : null;

          // Calculate current chapter from chapterProgress
          const chapterProgress = r.chapterProgress || {};
          const completedChapters = Object.keys(chapterProgress).filter(key => chapterProgress[key] === true);
          const highestCompleted = completedChapters.length > 0
            ? Math.max(...completedChapters.map(ch => parseInt(ch)))
            : 0;
          const currentChapter = highestCompleted + 1; // They're working on the next chapter

          // Fetch user document to get email
          let userEmail = 'No email';
          if (userId) {
            try {
              const userDoc = await getDoc(doc(db, 'users', userId));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                userEmail = userData.email || 'No email';
              }
            } catch (err) {
              console.warn('Failed to fetch user email for accountId:', userId, err);
            }
          }

          profilesWithUserData.push({
            ...r,
            accountId: userId,
            chapter: currentChapter,
            email: userEmail, // Use email from user document instead of gameProfile
            name: r.profileName || r.name || 'Unnamed' // Use the actual profile name
          });
        }

        // Wait for all user data fetches to complete
        const mapped = profilesWithUserData;

        setLearners(mapped);
        onCountChange(mapped.length);
      } catch (err) {
        // Log rich error details to help debug Firestore rule denials or network issues
        console.error('Failed to fetch learners by teacherCode:', err, {
          code: err?.code,
          message: err?.message,
          stack: err?.stack,
          customData: err?.customData,
        });
        setLearners([]);
        onCountChange(0);
      } finally {
        setLoading(false);
      }
    };

    fetchLearners();
  }, [teacherCode, onCountChange, reloadKey]);

  const sendMessage = async () => {
    if (!selectedLearner || !messageText.trim()) return;
    try {
      await addDoc(collection(db, 'users', selectedLearner.accountId, 'gameProfiles', selectedLearner.id, 'messages'), {
        message: messageText,
        senderId: auth.currentUser.uid,
        timestamp: new Date(),
        read: false
      });
      setMessageText('');
      setShowMessageModal(false);
      setSelectedLearner(null);
      alert('Message sent!');
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message.');
    }
  };

  return (
    <section>
      <h2>Learners</h2>
      {loading ? (
        <p>Loading learners...</p>
      ) : learners.length === 0 ? (
        <p>No learners found for this teacher code.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {learners.map((l) => (
            <LearnerCard
              key={l.id + '_' + (l.accountId || '')}
              profileName={l.name || 'Unnamed'}
              email={l.email || ''}
              chapter={l.chapter || 1}
              avatar={l.avatar || `https://i.pravatar.cc/80?u=${l.id}`}
              onMessage={() => { setSelectedLearner(l); setShowMessageModal(true); }}
            />
          ))}
        </div>
      )}

      {showMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Send Message to {selectedLearner?.name || 'Learner'}</h3>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type your message..."
              className="w-full p-3 border border-gray-300 rounded-lg mb-4"
              rows={4}
            ></textarea>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowMessageModal(false);
                  setSelectedLearner(null);
                  setMessageText('');
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={sendMessage}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
