import { useEffect, useState } from 'react';
import {
  BookOpen,
  Eye,
  Sparkles,
  Star,
  CheckCircle2,
  ArrowRight,
  Volume2,
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { updateUserByNumericId } from '../services/firestoreService';

interface StorySelectionProps {
  userUid: string; // ✅ Firebase UID
  childName: string;
  onStorySelect: (storyType: 'pre-reader' | 'early-reader') => void;
  onBack: () => void;
}


/**
 * Recommendation logic based on AssessmentForm.tsx values
 */
function getRecommendedStory(
  assessment: any
): 'pre-reader' | 'early-reader' {
  let score = 0;

  // Reading ability
  switch (assessment.readingAbility) {
    case 'cannotRead':
      score += 0;
      break;
    case 'lettersOnly':
      score += 1;
      break;
    case 'simpleWords':
      score += 2;
      break;
    case 'simpleSentences':
      score += 3;
      break;
    case 'shortStories':
      score += 4;
      break;
  }

  // Alphabet & phonics
  if (assessment.recognizeAlphabet === 'yes') score += 1;
  if (assessment.letterSounds === 'yes') score += 1;

  // Overall level
  if (assessment.overallLevel === 'developing') score += 1;
  if (assessment.overallLevel === 'confident') score += 2;

  return score >= 4 ? 'early-reader' : 'pre-reader';
}

export function StorySelection({
  userUid,
  childName,
  onStorySelect,
  onBack,
}: StorySelectionProps) {
  const [assessmentData, setAssessmentData] = useState<any>(null);
  const [recommendation, setRecommendation] =
    useState<'pre-reader' | 'early-reader' | null>(null);

  /**
   * Load assessment from localStorage
   */
  useEffect(() => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const child = users.find((u: any) => u.id === userUid);

    if (child?.assessment) {
      setAssessmentData(child.assessment);
      setRecommendation(getRecommendedStory(child.assessment));
    }
  }, [userUid]);

  /**
   * Save chosen story to localStorage + Firebase
   */
  async function handleStartStory(
    storyId: 'pre-reader' | 'early-reader'
  ) {
    if (!assessmentData) {
      alert('Please complete the assessment before starting a story.');
      return;
    }

    const timestamp = new Date().toISOString();

    // 1️⃣ Save locally
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const index = users.findIndex((u: any) => u.id === userUid);

    if (index !== -1) {
      users[index].storySelection = storyId;
      users[index].storyRecommended = recommendation;
      users[index].storySelectedAt = timestamp;
      localStorage.setItem('users', JSON.stringify(users));
    }

    // 2️⃣ Save to Firebase
    try {
      await updateUserByNumericId(Number(userUid), {
        storySelection: storyId,
        storyRecommended: recommendation,
        storySelectedAt: timestamp,
      });
    } catch (err) {
      console.warn(
        'Failed to save story selection to Firebase (offline mode)',
        err
      );
    }

    // 3️⃣ Continue
    onStorySelect(storyId);
  }

  const stories = [
    {
      id: 'pre-reader',
      title: 'The Magical Garden',
      type: 'Picture Story',
      description:
        'A colorful adventure through a magical garden with friendly animals.',
      features: [
        'Beautiful pictures and illustrations',
        'Audio narration with sound effects',
        'Simple point-and-click interactions',
        'Perfect for visual learners',
      ],
      icon: Eye,
      gradient: 'from-pink-400 to-purple-500',
      bgGradient: 'from-pink-50 to-purple-50',
      difficulty: 'Beginner',
      estimatedTime: '5–8 minutes',
    },
    {
      id: 'early-reader',
      title: 'The Little Explorer',
      type: 'Reading Story',
      description:
        'Join Sam on an exciting adventure to discover new places and make friends.',
      features: [
        'Simple words and short sentences',
        'Colorful illustrations to support text',
        'Reading comprehension questions',
        'Perfect for practicing reading skills',
      ],
      icon: BookOpen,
      gradient: 'from-blue-400 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50',
      difficulty: 'Early Reader',
      estimatedTime: '8–12 minutes',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Choose Your Story Adventure!
          </h1>
          <p className="text-xl text-gray-700 mt-2">
            Hello{' '}
            <span className="font-bold text-purple-600">{childName}</span> 🌟
          </p>
        </div>

        {/* Recommendation Banner */}
        {recommendation && (
          <Card className="bg-gradient-to-r from-yellow-300 to-yellow-400 text-yellow-900 p-6 mb-8 border-none shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <p className="font-semibold">
                Recommended Story:{' '}
                {recommendation === 'pre-reader'
                  ? 'The Magical Garden'
                  : 'The Little Explorer'}
              </p>
            </div>
          </Card>
        )}

        {/* Story Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {stories.map((story) => (
            <Card
              key={story.id}
              className={`relative overflow-hidden border-4 transition-all hover:scale-105 ${
                story.id === recommendation
                  ? 'border-yellow-400 shadow-2xl'
                  : 'border-purple-200 shadow-lg'
              }`}
            >
              {/* ⭐ Recommended Tag */}
              {story.id === recommendation && (
                <div className="absolute top-4 right-4 z-10">
                  <span className="flex items-center gap-2 bg-yellow-300 text-yellow-900 px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                    <Star className="w-4 h-4 fill-yellow-600" />
                    Recommended
                  </span>
                </div>
              )}

              <div className={`bg-gradient-to-r ${story.gradient} p-6 text-white`}>
                <div className="flex gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <story.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <Badge className="bg-white/20 border-none mb-1">
                      {story.type}
                    </Badge>
                    <h2 className="text-2xl">{story.title}</h2>
                  </div>
                </div>
              </div>

              <div className={`p-6 bg-gradient-to-br ${story.bgGradient}`}>
                <p className="mb-4 text-gray-700">{story.description}</p>

                <div className="space-y-2 mb-6">
                  {story.features.map((f, i) => (
                    <div key={i} className="flex gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 mb-6">
                  <Badge variant="outline">📚 {story.difficulty}</Badge>
                  <Badge variant="outline">⏱️ {story.estimatedTime}</Badge>
                </div>

                <Button
                  disabled={!assessmentData}
                  onClick={() =>
                    handleStartStory(
                      story.id as 'pre-reader' | 'early-reader'
                    )
                  }
                  className={`w-full bg-gradient-to-r ${story.gradient} text-white py-6 text-lg`}
                >
                  Start This Story
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Info */}
        <Card className="bg-white/80 p-6 border-2 border-purple-200 mb-6">
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Volume2 className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-gray-600">
              Both stories are fun and educational. You can always try the other
              one later!
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
