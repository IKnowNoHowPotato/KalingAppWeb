import React, { useState, useEffect } from "react";
import { collection, addDoc, collectionGroup, query, where, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { v4 as uuidv4 } from "uuid";

export default function AssessmentPanel({ teacherCode }) {
  const [learners, setLearners] = useState([]);
  const [assessmentTitle, setAssessmentTitle] = useState('');
  const [assessmentDescription, setAssessmentDescription] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [questions, setQuestions] = useState([{ id: uuidv4(), text: '', answers: [{ id: uuidv4(), text: '' }, { id: uuidv4(), text: '' }, { id: uuidv4(), text: '' }, { id: uuidv4(), text: '' }], correctAnswerId: '' }]);
  const [loading, setLoading] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [currentStep, setCurrentStep] = useState('list'); // 'list', 'create', 'select-students'
  const [assessments, setAssessments] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const fetchAssessments = async () => {
      if (!auth.currentUser?.uid) return;
      try {
        console.debug("Fetching assessments for teacherId:", auth.currentUser.uid);
        // Use subcollection under teacher user document for better organization
        const assessmentsRef = collection(db, 'users', auth.currentUser.uid, 'assessments');
        const snap = await getDocs(assessmentsRef);
        const assessmentList = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        console.debug("Found assessments:", assessmentList.length);
        setAssessments(assessmentList);
      } catch (err) {
        console.error('Failed to fetch assessments:', err);
      }
    };
    fetchAssessments();

    const fetchLearners = async () => {
      if (!teacherCode) return;
      try {
        console.debug("AssessmentPanel.fetchLearners: teacherCode=" + teacherCode, "auth.uid=", auth.currentUser?.uid);

        // Query across all users' gameProfiles subcollections where teacherCode matches
        const q = query(collectionGroup(db, "gameProfiles"), where("teacherCode", "==", teacherCode));
        console.debug("AssessmentPanel.fetchLearners: running query for teacherCode", teacherCode);
        let snap;
        try {
          snap = await getDocs(q);
        } catch (err) {
          // If query is denied by rules (common if collectionGroup reads are restricted),
          // fall back to reading the current teacher's own gameProfiles subcollection so
          // sample/test data created under the teacher's account is visible.
          console.warn('AssessmentPanel: collectionGroup query failed, attempting fallback to own gameProfiles', err?.code);
          if (err?.code === 'permission-denied') {
            try {
              const ownSnap = await getDocs(collection(db, 'users', auth.currentUser?.uid, 'gameProfiles'));
              const resultsOwn = ownSnap.docs.map((d) => ({ id: d.id, ...d.data(), _pathSegments: d.ref.path.split('/') }));

              // Augment fallback results with chapter and email data
              const mappedOwn = [];
              for (const r of resultsOwn) {
                const segments = r._pathSegments;
                const userIndex = segments.indexOf('users');
                const userId = userIndex !== -1 && segments.length > userIndex + 1 ? segments[userIndex + 1] : null;

                // Calculate current chapter from chapterProgress
                const chapterProgress = r.chapterProgress || {};
                const completedChapters = Object.keys(chapterProgress).filter(key => chapterProgress[key] === true);
                const highestCompleted = completedChapters.length > 0
                  ? Math.max(...completedChapters.map(ch => parseInt(ch)))
                  : 0;
                const currentChapter = highestCompleted + 1;

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
                    console.warn('Failed to fetch email for accountId:', userId, err);
                  }
                }

                mappedOwn.push({
                  ...r,
                  accountId: userId,
                  chapter: currentChapter,
                  email: userEmail,
                  name: r.profileName || r.name || 'Unnamed',
                  selected: false
                });
              }

              setLearners(mappedOwn);
              return;
            } catch (ownErr) {
              console.error('AssessmentPanel fallback also failed:', ownErr);
              throw ownErr;
            }
          }
          throw err;
        }
        const results = snap.docs.map((d) => ({ id: d.id, ...d.data(), _pathSegments: d.ref.path.split('/') }));

        // Augment each profile with their account userId, calculate current chapter, and fetch email
        const profilesWithUserData = [];
        for (const r of results) {
          const segments = r._pathSegments;
          const userIndex = segments.indexOf('users');
          const userId = userIndex !== -1 && segments.length > userIndex + 1 ? segments[userIndex + 1] : null;

          // Calculate current chapter from chapterProgress
          const chapterProgress = r.chapterProgress || {};
          const completedChapters = Object.keys(chapterProgress).filter(key => chapterProgress[key] === true);
          const highestCompleted = completedChapters.length > 0
            ? Math.max(...completedChapters.map(ch => parseInt(ch)))
            : 0;
          const currentChapter = highestCompleted + 1;

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
            name: r.profileName || r.name || 'Unnamed',
            selected: false
          });
        }

        setLearners(profilesWithUserData);
      } catch (err) {
        console.error('Failed to fetch learners by teacherCode:', err, {
          code: err?.code,
          message: err?.message,
          stack: err?.stack,
          customData: err?.customData,
        });
        setLearners([]);
      }
    };
    fetchLearners();
  }, [teacherCode]);

  // Predefined color options for background
  const colorOptions = [
    '#FFFFFF', // White
    '#E3F2FD', // Light Blue
    '#F3E5F5', // Light Purple
    '#E8F5E8', // Light Green
    '#FFF3E0', // Light Orange
    '#FAFAFA', // Light Gray
    '#FCE4EC', // Light Pink
    '#E0F2F1', // Light Teal
    '#FBE9E7', // Light Red
    '#F9FBE7'  // Light Yellow
  ];

  const addQuestion = () => {
    setQuestions([...questions, {
      id: uuidv4(),
      text: '',
      answers: [{ id: uuidv4(), text: '' }, { id: uuidv4(), text: '' }, { id: uuidv4(), text: '' }, { id: uuidv4(), text: '' }],
      correctAnswerId: ''
    }]);
  };

  const updateQuestion = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  const updateAnswer = (questionIndex, answerIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].answers[answerIndex].text = value;
    setQuestions(updatedQuestions);
  };

  const setCorrectAnswer = (questionIndex, answerId) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].correctAnswerId = answerId;
    setQuestions(updatedQuestions);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const toggleLearnerSelection = (learnerId) => {
    setLearners(learners.map(l =>
      l.id === learnerId ? { ...l, selected: !l.selected } : l
    ));
  };

  const selectAllLearners = () => {
    const allSelected = learners.every(l => l.selected);
    setLearners(learners.map(l => ({ ...l, selected: !allSelected })));
  };

  const goToSelectStudents = () => {
    if (!assessmentTitle.trim()) {
      alert('Please enter an assessment title.');
      return;
    }

    if (!questions.some(q => q.text.trim())) {
      alert('Please add at least one question.');
      return;
    }

    // Validate all questions have required answers and correct answer selected
    for (const question of questions) {
      if (!question.text.trim()) continue;

      if (question.answers.filter(ans => ans.text.trim()).length < 2) {
        alert('Each question must have at least 2 answer choices.');
        return;
      }

      if (!question.correctAnswerId) {
        alert('Please select the correct answer for each question.');
        return;
      }
    }

    setCurrentStep('select-students');
  };

  const createAssessment = async () => {
    const selectedLearnersData = learners.filter(l => l.selected);
    if (selectedLearnersData.length === 0) {
      alert('Please select at least one student to assign the assessment to.');
      return;
    }

    setLoading(true);
    try {
      const baseAssessmentData = {
        title: assessmentTitle,
        description: assessmentDescription,
        backgroundColor: backgroundColor,
        questions: questions.filter(q => q.text.trim() !== '').map(q => ({
          id: q.id,
          text: q.text,
          answers: q.answers.filter(ans => ans.text.trim()), // Remove empty answers
          correctAnswerId: q.correctAnswerId
        })),
        teacherCode: teacherCode,
        teacherId: auth.currentUser.uid,
        createdAt: new Date(),
        isActive: isActive
      };

      // Also store master copy in teacher's subcollection for management
      console.debug("Creating master assessment in teacher subcollection");
      const masterAssessmentData = {
        ...baseAssessmentData,
        assignedLearners: selectedLearnersData.map(l => ({
          learnerId: l.id,
          accountId: l.accountId,
          name: l.name,
          assignedAt: new Date(),
          completed: false
        }))
      };
      await addDoc(collection(db, 'users', auth.currentUser.uid, 'assessments'), masterAssessmentData);

      // Create assessment documents in each selected student's gameProfile subcollection
      for (const learner of selectedLearnersData) {
        const studentAssessmentData = {
          ...baseAssessmentData,
          assignedAt: new Date(),
          learnerId: learner.id,
          learnerName: learner.name,
          completed: false,
          submitted: false,
          answers: [] // Will store student's answers
        };

        console.debug(`Creating assessment in student's gameProfile: ${learner.accountId}/${learner.id}`);
        await addDoc(collection(db, 'users', learner.accountId, 'gameProfiles', learner.id, 'assessments'), studentAssessmentData);
      }

      alert('Assessment created and assigned successfully!');
      // Reset form and refresh list
      setAssessmentTitle('');
      setAssessmentDescription('');
      setBackgroundColor('#FFFFFF');
      setQuestions([{ id: uuidv4(), text: '', answers: [{ id: uuidv4(), text: '' }, { id: uuidv4(), text: '' }, { id: uuidv4(), text: '' }, { id: uuidv4(), text: '' }], correctAnswerId: '' }]);
      setIsActive(true);
      setCurrentStep('list');
      setLearners(learners.map(l => ({ ...l, selected: false })));

      // Refresh assessments list from teacher's subcollection
      console.debug("Refreshing assessment list from subcollection");
      const assessmentsRef = collection(db, 'users', auth.currentUser.uid, 'assessments');
      const snap = await getDocs(assessmentsRef);
      const assessmentList = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setAssessments(assessmentList);
    } catch (err) {
      console.error('Error creating assessment:', err);
      alert('Failed to create assessment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAssessmentStatus = async (assessmentId, currentStatus) => {
    try {
      const assessmentRef = doc(db, 'users', auth.currentUser.uid, 'assessments', assessmentId);
      await updateDoc(assessmentRef, {
        isActive: !currentStatus,
        lastModified: new Date()
      });

      // Update local state
      setAssessments(assessments.map(a =>
        a.id === assessmentId ? { ...a, isActive: !currentStatus } : a
      ));

      alert(`Assessment ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
    } catch (err) {
      console.error('Error updating assessment status:', err);
      alert('Failed to update assessment status.');
    }
  };

  const deleteAssessment = async (assessmentId) => {
    if (!confirm('Are you sure you want to delete this assessment? This action cannot be undone.')) {
      return;
    }

    try {
      // Delete from assessments collection
      const assessmentRef = doc(db, 'users', auth.currentUser.uid, 'assessments', assessmentId);

      // Note: We should also delete related learner_assessments, but for simplicity we'll skip that for now
      // In a production app, you would delete all related records

      // For now, just delete the assessment document
      // We'll need to import deleteDoc
      await updateDoc(assessmentRef, { isDeleted: true, deletedAt: new Date() });

      // Remove from local state
      setAssessments(assessments.filter(a => a.id !== assessmentId));

      alert('Assessment deleted successfully!');
    } catch (err) {
      console.error('Error deleting assessment:', err);
      alert('Failed to delete assessment.');
    }
  };

  const viewAssessmentDetails = (assessment) => {
    setSelectedAssessment(assessment);
    setShowDetails(true);
  };

  const editAssessment = (assessment) => {
    // Load assessment data for editing
    setAssessmentTitle(assessment.title || '');
    setAssessmentDescription(assessment.description || '');
    setBackgroundColor(assessment.backgroundColor || '#FFFFFF');
    setQuestions(assessment.questions?.length ?
      assessment.questions.map(q => ({
        id: q.id,
        text: q.text || '',
        answers: q.answers || [],
        correctAnswerId: q.correctAnswerId || ''
      })) : []
    );
    setIsActive(assessment.isActive ?? true);
    setSelectedAssessment(assessment);
    setCurrentStep('create');
  };

  if (currentStep === 'select-students') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Select Students for Assessment</h1>
          <button
            onClick={() => setCurrentStep('create')}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Back to Assessment
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{assessmentTitle || 'Untitled Assessment'}</h2>
            <div className="flex gap-2">
              <button
                onClick={selectAllLearners}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {learners.every(l => l.selected) ? 'Deselect All' : 'Select All'}
              </button>
              <span className="text-sm text-gray-600 pt-2">
                {learners.filter(l => l.selected).length} of {learners.length} selected
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {learners.map((learner) => (
            <div
              key={learner.id}
              onClick={() => toggleLearnerSelection(learner.id)}
              className={`
                p-4 border rounded-lg cursor-pointer transition-all
                ${learner.selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
              `}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={learner.selected}
                  onChange={() => toggleLearnerSelection(learner.id)}
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{learner.name}</h3>
                  <p className="text-sm text-gray-600">{learner.email}</p>
                  <p className="text-xs text-gray-500">Chapter {learner.chapter || 1}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={() => setCurrentStep('create')}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Back
          </button>
          <button
            onClick={createAssessment}
            disabled={loading || learners.filter(l => l.selected).length === 0}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Assessment...' : 'Create Assessment'}
          </button>
        </div>

        {/* Assessment Details Modal */}
        {showDetails && selectedAssessment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedAssessment.title}</h2>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Questions: {selectedAssessment.questions?.length || 0}</span>
                  <span>Students: {selectedAssessment.assignedLearners?.length || 0}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedAssessment.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedAssessment.isActive ? 'Active' : 'Inactive'}
                  </span>
                  {selectedAssessment.createdAt && (
                    <span>Created: {new Date(selectedAssessment.createdAt.seconds * 1000).toLocaleDateString()}</span>
                  )}
                </div>
                {selectedAssessment.description && (
                  <p className="text-gray-700 mt-2">{selectedAssessment.description}</p>
                )}
              </div>

              <div className="p-6 max-h-[60vh] overflow-y-auto">
                <h3 className="text-lg font-semibold mb-4">Questions & Answers</h3>
                <div className="space-y-4">
                  {selectedAssessment.questions?.map((question, qIndex) => (
                    <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Question {qIndex + 1}: {question.text}</h4>
                      <div className="space-y-1 ml-4">
                        {question.answers?.map((answer, aIndex) => (
                          <div key={answer.id} className={`flex items-center gap-2 ${
                            question.correctAnswerId === answer.id ? 'font-bold text-green-700' : ''
                          }`}>
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                              question.correctAnswerId === answer.id
                                ? 'bg-green-500 text-white'
                                : 'border border-gray-300'
                            }`}>
                              {question.correctAnswerId === answer.id ? '✓' : aIndex + 1}
                            </span>
                            <span>{answer.text}</span>
                            {question.correctAnswerId === answer.id && (
                              <span className="text-green-600 text-sm">(Correct Answer)</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {selectedAssessment.assignedLearners && selectedAssessment.assignedLearners.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Assigned Students ({selectedAssessment.assignedLearners.length})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedAssessment.assignedLearners.map((learner, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {learner.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{learner.name}</p>
                            <p className="text-sm text-gray-600">
                              Assigned on {new Date(learner.assignedAt.seconds * 1000).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      setShowDetails(false);
                      editAssessment(selectedAssessment);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Edit Assessment
                  </button>
                  <button
                    onClick={() => toggleAssessmentStatus(selectedAssessment.id, selectedAssessment.isActive)}
                    className={`px-4 py-2 text-white rounded ${
                      selectedAssessment.isActive
                        ? 'bg-orange-500 hover:bg-orange-600'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {selectedAssessment.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => {
                      setShowDetails(false);
                      deleteAssessment(selectedAssessment.id);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (currentStep === 'list') {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">My Assessments</h1>
            <p className="text-slate-600">View and manage your created assessments</p>
          </div>
          <button
            onClick={() => setCurrentStep('create')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <span>+</span> Create Assessment
          </button>
        </div>

        {/* Assessments List */}
        <div className="space-y-6">
          {assessments.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="text-gray-400 mb-4">
                📝
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No assessments yet</h3>
              <p className="text-gray-600 mb-6">Create your first assessment to get started with student evaluations</p>
              <button
                onClick={() => setCurrentStep('create')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Your First Assessment
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {assessments.map((assessment) => (
                <div key={assessment.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="h-3" style={{ backgroundColor: assessment.backgroundColor || '#FFFFFF' }}></div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">{assessment.title}</h3>
                        {assessment.description && (
                          <p className="text-gray-600 text-sm mb-2">{assessment.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Questions: {assessment.questions?.length || 0}</span>
                          <span>Students: {assessment.assignedLearners?.length || 0}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            assessment.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {assessment.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        {assessment.createdAt && (
                          <p className="text-xs text-gray-400 mt-2">
                            Created on {new Date(assessment.createdAt.seconds * 1000).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 mt-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => viewAssessmentDetails(assessment)}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => editAssessment(assessment)}
                          className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm font-medium"
                        >
                          Edit
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleAssessmentStatus(assessment.id, assessment.isActive)}
                          className={`flex-1 px-4 py-2 text-white rounded text-sm font-medium ${
                            assessment.isActive
                              ? 'bg-orange-500 hover:bg-orange-600'
                              : 'bg-green-600 hover:bg-green-700'
                          }`}
                        >
                          {assessment.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => deleteAssessment(assessment.id)}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-6">
        {/* Assessment Basic Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Assessment Information</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assessment Title *</label>
              <input
                type="text"
                value={assessmentTitle}
                onChange={(e) => setAssessmentTitle(e.target.value)}
                placeholder="Enter assessment title..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={assessmentDescription}
                onChange={(e) => setAssessmentDescription(e.target.value)}
                placeholder="Enter assessment description..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
              <div className="flex flex-wrap gap-3">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setBackgroundColor(color)}
                    className={`
                      w-12 h-12 rounded-lg border-4 transition-all hover:scale-110
                      ${backgroundColor === color ? 'border-blue-500 shadow-lg' : 'border-gray-300'}
                    `}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Current: {backgroundColor}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Active (Visible to assigned students)
              </label>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Questions</h2>
            <button
              onClick={addQuestion}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              + Add Question
            </button>
          </div>

          <div className="space-y-4">
            {questions.map((q, qIndex) => (
              <div key={q.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">Question {qIndex + 1}</h3>
                  {questions.length > 1 && (
                    <button
                      onClick={() => removeQuestion(qIndex)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    value={q.text}
                    onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                    placeholder="Enter question..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Answer Choices:</label>
                    {q.answers.map((answer, aIndex) => (
                      <div key={answer.id} className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name={`q${qIndex}`}
                          checked={q.correctAnswerId === answer.id}
                          onChange={() => setCorrectAnswer(qIndex, answer.id)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <input
                          type="text"
                          value={answer.text}
                          onChange={(e) => updateAnswer(qIndex, aIndex, e.target.value)}
                          placeholder={`Choice ${aIndex + 1}`}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="text-sm text-gray-600">
                    Select the radio button next to the correct answer.
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next Step */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-end">
            <button
              onClick={goToSelectStudents}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Continue to Select Students →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
