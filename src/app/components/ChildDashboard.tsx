import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { User, Calendar, BookOpen, Target, Trophy, Star, Clock, TrendingUp, Award, Sparkles } from 'lucide-react';
import { Card } from './ui/card';
import FigmaPage from './figma/FigmaPage';
import { Badge } from './ui/badge';
import { NavigationBar } from './NavigationBar';
import { SettingsModal } from './SettingsModal';
import { AccountModal } from './AccountModal';
import { toast } from 'sonner';
import { getUserByUid } from '../services/firestoreService';

interface Registration {
  userUid: string; // ✅ Firebase UID
  childName: string;
  parentName: string;
  email: string;
  age: string;
  registeredAt: string;
  assessment?: any;
  assessmentCompletedAt?: string;
}

interface ChildDashboardProps {
  userUid: string
  onLogout: () => void;
}

export function ChildDashboard({ userUid, onLogout }: ChildDashboardProps) {
  const [childData, setChildData] = useState<Registration | null>(null);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isFigmaOpen, setIsFigmaOpen] = useState(false);

  // Convert userUid string to number for internal use
  const childId = parseInt(userUid) || 0;

    useEffect(() => {
    if (!userUid) {
      setChildData(null);
      return;
    }

    // 1️⃣ Try localStorage (web registration)
    const localUsers: Registration[] = JSON.parse(
      localStorage.getItem('users') || '[]'
    );

    const localMatch = localUsers.find(u => u.userUid === userUid);

    if (localMatch) {
      setChildData(localMatch);
      return;
    }

    // 2️⃣ Fallback to Firestore (mobile / Google users)
    (async () => {
      try {
        const cloud = await getUserByUid(userUid);
        if (cloud) {
          setChildData({
            userUid,
            childName: cloud.childName || '',
            parentName: cloud.parentName || '',
            email: cloud.email || '',
            age: cloud.age || '',
            registeredAt: cloud.registeredAt || new Date().toISOString(),
            assessment: cloud.assessment,
            assessmentCompletedAt: cloud.assessmentCompletedAt,
          });
        } else {
          setChildData(null);
        }
      } catch (err) {
        console.error('Failed to load child data', err);
        setChildData(null);
      }
    })();
  }, [userUid]);

    // Generate mock activity data (this would come from actual app usage)
    const mockActivities = [
      { day: 'Mon', minutes: 15, completed: 3 },
      { day: 'Tue', minutes: 20, completed: 5 },
      { day: 'Wed', minutes: 12, completed: 2 },
      { day: 'Thu', minutes: 25, completed: 6 },
      { day: 'Fri', minutes: 18, completed: 4 },
      { day: 'Sat', minutes: 30, completed: 7 },
      { day: 'Sun', minutes: 22, completed: 5 },
    ];
    setActivityData(mockActivities);

    // Generate achievements based on activity
    const mockAchievements = [
      { id: 1, title: 'First Steps', description: 'Completed first learning activity', icon: '🎯', unlocked: true },
      { id: 2, title: 'Quick Learner', description: 'Completed 5 activities in one day', icon: '⚡', unlocked: true },
      { id: 3, title: 'Reading Star', description: 'Read 10 stories', icon: '📚', unlocked: true },
      { id: 4, title: 'Week Warrior', description: 'Practiced every day this week', icon: '🏆', unlocked: false },
      { id: 5, title: 'Master Explorer', description: 'Completed all beginner levels', icon: '🌟', unlocked: false },
    ];
    setAchievements(mockAchievements);

  const handleStatistics = () => {
    toast.info('Statistics view - already on this page!');
  };

  const handleAccount = () => {
    setIsAccountOpen(true);
  };

  const handleSettings = () => {
    setIsSettingsOpen(true);
  };

  const handleStory = () => {
    toast.info('Story section coming soon!');
  };

  const handleFigma = () => {
    setIsFigmaOpen(true);
  };

  const handleLevel = () => {
    toast.info('Level section coming soon!');
  };

  if (!childData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-300 flex items-center justify-center">
        <Card className="p-8 bg-white/95">
          <p className="text-gray-600">Child data not found.</p>
        </Card>
      </div>
    );
  }

  // Calculate skill levels from assessment
  const getSkillLevels = () => {
    if (!childData.assessment) return [];

    const assessment = childData.assessment;

    // Map assessment data to skill levels (0-100 scale)
    const readingLevel = (() => {
      const readingAbility = (assessment as any).readingAbility;
      const mapping: Record<string, number> = {
        'cannotRead': 20,
        'lettersOnly': 40,
        'simpleWords': 60,
        'simpleSentences': 80,
        'shortStories': 100
      };
      return mapping[readingAbility] || 50;
    })();

    const communicationLevel = (() => {
      const verbalExpression = (assessment as any).verbalExpression;
      const mapping: Record<string, number> = {
        'veryLimited': 30,
        'someDifficulty': 60,
        'clearly': 90
      };
      return mapping[verbalExpression] || 60;
    })();

    const focusLevel = (() => {
      const focusDuration = (assessment as any).focusDuration;
      const mapping: Record<string, number> = {
        'lessThan5': 25,
        '5to10': 50,
        '10to20': 75,
        'moreThan20': 95
      };
      return mapping[focusDuration] || 50;
    })();

    const techLevel = (() => {
      const deviceUsage = (assessment as any).deviceUsage;
      const mapping: Record<string, number> = {
        'never': 20,
        'sometimes': 60,
        'often': 90
      };
      return mapping[deviceUsage] || 50;
    })();

    return [
      { skill: 'Reading', level: readingLevel, fullMark: 100 },
      { skill: 'Communication', level: communicationLevel, fullMark: 100 },
      { skill: 'Focus', level: focusLevel, fullMark: 100 },
      { skill: 'Technology', level: techLevel, fullMark: 100 },
      { skill: 'Confidence', level: 70, fullMark: 100 }, // Mock data
    ];
  };

  const skillLevels = getSkillLevels();
  const totalMinutes = activityData.reduce((sum, day) => sum + day.minutes, 0);
  const totalActivities = activityData.reduce((sum, day) => sum + day.completed, 0);
  const unlockedAchievements = achievements.filter(a => a.unlocked).length;

  // Get learning level badge
  const getLearningLevelBadge = () => {
    const level = (childData.assessment as any)?.overallLevel;
    const config: Record<string, { label: string; color: string; icon: string }> = {
      'beginner': { label: 'Beginner Learner', color: 'bg-blue-500', icon: '🌱' },
      'developing': { label: 'Developing Learner', color: 'bg-purple-500', icon: '🌿' },
      'confident': { label: 'Confident Learner', color: 'bg-green-500', icon: '🌳' }
    };
    return config[level] || { label: 'Not Assessed', color: 'bg-gray-500', icon: '❓' };
  };

  const levelBadge = getLearningLevelBadge();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-300">
      <NavigationBar 
        childName={childData.childName}
        onLogout={onLogout}
        onStatistics={handleStatistics}
        onAccount={handleAccount}
        onSettings={handleSettings}
        onStory={handleStory}
        onLevel={handleLevel}
        onFigma={handleFigma}
      />
      {isFigmaOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 p-8 overflow-auto">
          <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-2xl p-6">
            <FigmaPage name={`child-${userUid}-figma`} onClose={() => setIsFigmaOpen(false)} />
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Card className="bg-white/95 backdrop-blur-sm p-8 border-4 border-purple-300">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-4xl shadow-lg">
                  {childData.childName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-5xl mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {childData.parentName}
                  </h1>
                  <div className="flex items-center gap-4 text-gray-600 mb-3">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {childData.age} years old
                    </span>
                    <span className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Child: {childData.childName}
                    </span>
                  </div>
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-white ${levelBadge.color}`}>
                    <span className="text-xl">{levelBadge.icon}</span>
                    <span>{levelBadge.label}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 mb-1">Member Since</p>
                <p className="text-lg">{new Date(childData.registeredAt).toLocaleDateString()}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 border-0 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm mb-1">Learning Time</p>
                <p className="text-4xl">{totalMinutes}</p>
                <p className="text-purple-100 text-sm">minutes</p>
              </div>
              <Clock className="w-12 h-12 opacity-80" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white p-6 border-0 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-100 text-sm mb-1">Activities Done</p>
                <p className="text-4xl">{totalActivities}</p>
                <p className="text-pink-100 text-sm">completed</p>
              </div>
              <Target className="w-12 h-12 opacity-80" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 border-0 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">Achievements</p>
                <p className="text-4xl">{unlockedAchievements}</p>
                <p className="text-blue-100 text-sm">unlocked</p>
              </div>
              <Trophy className="w-12 h-12 opacity-80" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white p-6 border-0 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm mb-1">Current Streak</p>
                <p className="text-4xl">7</p>
                <p className="text-yellow-100 text-sm">days</p>
              </div>
              <Star className="w-12 h-12 opacity-80" />
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Weekly Activity */}
          <Card className="bg-white/95 backdrop-blur-sm p-6 border-2 border-purple-200">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-purple-600" />
              <h3 className="text-2xl text-purple-700">Weekly Activity</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E9D5FF" />
                <XAxis dataKey="day" stroke="#9333EA" />
                <YAxis stroke="#9333EA" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FAF5FF', 
                    border: '2px solid #9333EA',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="minutes" fill="#A855F7" radius={[8, 8, 0, 0]} name="Minutes" />
                <Bar dataKey="completed" fill="#EC4899" radius={[8, 8, 0, 0]} name="Activities" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Skill Levels */}
          <Card className="bg-white/95 backdrop-blur-sm p-6 border-2 border-pink-200">
            <div className="flex items-center gap-3 mb-4">
              <Award className="w-6 h-6 text-pink-600" />
              <h3 className="text-2xl text-pink-700">Skill Levels</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              {skillLevels.length > 0 ? (
                <RadarChart data={skillLevels}>
                  <PolarGrid stroke="#FCE7F3" />
                  <PolarAngleAxis dataKey="skill" stroke="#EC4899" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#EC4899" />
                  <Radar name="Current Level" dataKey="level" stroke="#EC4899" fill="#F9A8D4" fillOpacity={0.6} />
                  <Legend />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#FFF1F2', 
                      border: '2px solid #EC4899',
                      borderRadius: '8px'
                    }} 
                  />
                </RadarChart>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  Complete assessment to see skill levels
                </div>
              )}
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Learning Preferences */}
        {childData.assessment && (
          <Card className="bg-white/95 backdrop-blur-sm p-6 border-2 border-blue-200 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="w-6 h-6 text-blue-600" />
              <h3 className="text-2xl text-blue-700">Learning Profile</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                <p className="text-sm text-blue-600 mb-1">Learning Style</p>
                <p className="text-lg capitalize">
                  {childData.assessment.learningStyle === 'visual' && '👁️ Visual'}
                  {childData.assessment.learningStyle === 'audio' && '👂 Audio'}
                  {childData.assessment.learningStyle === 'handsOn' && '✋ Hands-on'}
                  {childData.assessment.learningStyle === 'combination' && '🌈 Mixed'}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
                <p className="text-sm text-purple-600 mb-1">Preferred Activity</p>
                <p className="text-lg capitalize">
                  {childData.assessment.preferredActivities === 'music' && '🎵 Music'}
                  {childData.assessment.preferredActivities === 'pictures' && '🎨 Pictures'}
                  {childData.assessment.preferredActivities === 'movement' && '🏃 Movement'}
                  {childData.assessment.preferredActivities === 'storytelling' && '📖 Stories'}
                </p>
              </div>
              <div className="bg-pink-50 p-4 rounded-lg border-2 border-pink-200">
                <p className="text-sm text-pink-600 mb-1">Motivation</p>
                <p className="text-lg capitalize">
                  {childData.assessment.motivation === 'praise' && '👏 Praise'}
                  {childData.assessment.motivation === 'rewards' && '🎁 Rewards'}
                  {childData.assessment.motivation === 'games' && '🎮 Games'}
                  {childData.assessment.motivation === 'stories' && '📚 Stories'}
                  {childData.assessment.motivation === 'competition' && '🏆 Competition'}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                <p className="text-sm text-green-600 mb-1">Primary Language</p>
                <p className="text-lg capitalize">
                  {childData.assessment.primaryLanguage === 'english' && '🇺🇸 English'}
                  {childData.assessment.primaryLanguage === 'filipino' && '🇵🇭 Filipino'}
                  {childData.assessment.primaryLanguage === 'other' && `🌍 ${childData.assessment.otherLanguage || 'Other'}`}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Achievements */}
        <Card className="bg-white/95 backdrop-blur-sm p-6 border-2 border-yellow-200">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-6 h-6 text-yellow-600" />
            <h3 className="text-2xl text-yellow-700">Achievements</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-5 rounded-lg border-2 transition-all ${
                  achievement.unlocked
                    ? 'bg-gradient-to-br from-yellow-100 to-orange-100 border-yellow-400'
                    : 'bg-gray-100 border-gray-300 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-4xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <h4 className={`mb-1 ${achievement.unlocked ? 'text-yellow-800' : 'text-gray-600'}`}>
                      {achievement.title}
                    </h4>
                    <p className={`text-sm ${achievement.unlocked ? 'text-yellow-700' : 'text-gray-500'}`}>
                      {achievement.description}
                    </p>
                    {achievement.unlocked && (
                      <Badge className="mt-2 bg-yellow-500 text-white">Unlocked ✓</Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        childName={childData.childName}
      />

      {/* Account Modal */}
      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        childId={childId}
        childName={childData.childName}
      />
    </div>
  );
}
