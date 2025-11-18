import React, { useEffect, useState } from "react";
import { collection, addDoc, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { collectionGroup } from "firebase/firestore";

export default function QuizPanel({ teacherCode }) {
  const navigate = useNavigate();
  const [learners, setLearners] = useState([]);
  const [selectedLearners, setSelectedLearners] = useState([]);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [questions, setQuestions] = useState([{ question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState('create'); // 'create', 'select-students'
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const fetchLearners = async () => {
      if (!teacherCode) return;
      try {
        const q = query(collectionGroup(db, "gameProfiles"), where("teacherCode", "==", teacherCode));
        const snap = await getDocs(q);
        const results = snap.docs.map((d) => ({ id: d.id, ...d.data(), docRef: d.ref }));

        const profilesWithUserData = [];
        for (const r of results) {
          const segments = r._pathSegments;
          const userId = segments[segments.indexOf('users') + 1];

          profilesWithUserData.push({
            ...r,
            accountId: userId,
            name: r.profileName || r.name || 'Unnamed',
            selected: false
          });
        }
        setLearners(profilesWithUserData);
      } catch (err) {
        console.error('Failed to fetch learners:', err);
      }
    };
    fetchLearners();
  }, [teacherCode]);

  const addQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
  };

  const updateQuestion = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
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
    setSelectedLearners(learners.filter(l => l.selected).map(l => l.id));
  };

  const selectAllLearners = () => {
    const allSelected = learners.every(l => l.selected);
    setLearners(learners.map(l => ({ ...l, selected: !allSelected })));
  };

  const createQuiz = async () => {
    if (!quizTitle.trim() || !questions.some(q => q.question.trim())) {
      alert('Please fill in the quiz title and at least one question.');
      return;
    }

    const selectedLearnersData = learners.filter(l => l.selected);
    if (selectedLearnersData.length === 0) {
      alert('Please select at least one student to assign the quiz to.');
      return;
    }

    setLoading(true);
    try {
      const quizData = {
        title: quizTitle,
        description: quizDescription,
        questions: questions.filter(q => q.question.trim() !== ''),
        teacherCode: teacherCode,
        teacherId: auth.currentUser.uid,
        createdAt: new Date(),
        isActive: isActive,
        assignedTo: selectedLearnersData.map(l => ({
          learnerId: l.id,
          accountId: l.accountId,
          name: l.name,
          assignedAt: new Date(),
          completed: false
        }))
      };

      await addDoc(collection(db, 'quizzes'), quizData);

      // Create quiz assignments in each learner's subcollection
      for (const learner of selectedLearnersData) {
        const quizRef = doc(learner.docRef, 'quizzes', quizData.title);
        await updateDoc(quizRef, {
          ...quizData,
          learnerId: learner.id,
          accountId: learner.accountId
        });
      }

      alert('Quiz created and assigned successfully!');
      navigate('/profile');
    } catch (err) {
      console.error('Error creating quiz:', err);
      alert('Failed to create quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (currentStep === 'select-students') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Select Students</h1>
          <button
            onClick={() => setCurrentStep('create')}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Back to Quiz
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{quizTitle || 'Untitled Quiz'}</h2>
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
                <div>
                  <h3 className="font-semibold text-gray-900">{learner.name}</h3>
                  <p className="text-sm text-gray-600">Chapter {learner.chapter || 1}</p>
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
            onClick={createQuiz}
            disabled={loading || learners.filter(l => l.selected).length === 0}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Quiz...' : 'Create Quiz'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Create New Quiz</h1>
        <button
          onClick={() => navigate('/profile')}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Back to Dashboard
        </button>
      </div>

      <div className="space-y-6">
        {/* Quiz Basic Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quiz Information</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quiz Title *</label>
              <input
                type="text"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                placeholder="Enter quiz title..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={quizDescription}
                onChange={(e) => setQuizDescription(e.target.value)}
                placeholder="Enter quiz description..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Active (Visible to students)
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
              <div key={qIndex} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">Question {qIndex + 1}</h3>
                  {questions.length > 1 && (
                    <button
                      onClick={() => removeQuestion(qIndex)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    value={q.question}
                    onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                    placeholder="Enter question..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {q.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name={`q${qIndex}`}
                          checked={q.correctAnswer === oIndex}
                          onChange={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...q.options];
                            newOptions[oIndex] = e.target.value;
                            updateQuestion(qIndex, 'options', newOptions);
                          }}
                          placeholder={`Option ${oIndex + 1}`}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-end">
            <button
              onClick={() => {
                if (questions.some(q => q.question.trim() === '')) {
                  alert('Please make sure all questions are filled out.');
                  return;
                }
                setCurrentStep('select-students');
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Continue to Select Students
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
