import { useState } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { updateUserByNumericId } from '../services/firestoreService';
import { BookOpen, MessageCircle, Focus, Lightbulb, Smartphone, AlertCircle, Award, FileText } from 'lucide-react';

interface AssessmentFormProps {
  childName: string;
  registrationId: number;
  onComplete: () => void;
}

interface AssessmentData {
  // A. Child Information
  gradeLevel: string;
  priorAssessment: string;
  
  // B. Reading Ability
  readingAbility: string;
  recognizeAlphabet: string;
  letterSounds: string;
  understandInstructions: string;
  
  // C. Language & Communication
  primaryLanguage: string;
  otherLanguage: string;
  verbalExpression: string;
  understandQuestions: string;
  
  // D. Attention & Behavior
  focusDuration: string;
  enjoysLearning: string;
  difficultyReaction: string;
  
  // E. Learning Preferences
  learningStyle: string;
  preferredActivities: string;
  
  // F. Technology Familiarity
  deviceUsage: string;
  independentSkills: string[];
  
  // G. Special Considerations
  specialConsiderations: string[];
  otherConsideration: string;
  
  // H. Learning Support & Motivation
  supervisionLevel: string;
  motivation: string;
  
  // I. Overall Assessment
  overallLevel: string;
  additionalNotes: string;
}

export function AssessmentForm({ childName, registrationId, onComplete }: AssessmentFormProps) {
  const [formData, setFormData] = useState<AssessmentData>({
    gradeLevel: '',
    priorAssessment: '',
    readingAbility: '',
    recognizeAlphabet: '',
    letterSounds: '',
    understandInstructions: '',
    primaryLanguage: '',
    otherLanguage: '',
    verbalExpression: '',
    understandQuestions: '',
    focusDuration: '',
    enjoysLearning: '',
    difficultyReaction: '',
    learningStyle: '',
    preferredActivities: '',
    deviceUsage: '',
    independentSkills: [],
    specialConsiderations: [],
    otherConsideration: '',
    supervisionLevel: '',
    motivation: '',
    overallLevel: '',
    additionalNotes: '',
  });

  const handleCheckboxChange = (field: 'independentSkills' | 'specialConsiderations', value: string) => {
    const currentValues = formData[field];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    setFormData({ ...formData, [field]: newValues });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.gradeLevel || !formData.readingAbility) {
      toast.error('Please complete all required sections!');
      return;
    }

    // Save assessment data locally under `users` and attempt cloud update
    const registrations = JSON.parse(localStorage.getItem('users') || '[]');
    const index = registrations.findIndex((r: any) => r.id === registrationId);
    if (index !== -1) {
      registrations[index].assessment = formData;
      registrations[index].assessmentCompletedAt = new Date().toISOString();
      localStorage.setItem('users', JSON.stringify(registrations));
    }

    try {
      await updateUserByNumericId(registrationId, { assessment: formData, assessmentCompletedAt: new Date().toISOString() })
    } catch (err) {
      console.warn('Failed to update assessment in cloud', err)
    }

    toast.success(`Assessment completed for ${childName}! 🎯`);
    onComplete();
  };

  const RadioGroup = ({ 
    name, 
    options, 
    value, 
    onChange 
  }: { 
    name: string; 
    options: { value: string; label: string }[]; 
    value: string; 
    onChange: (value: string) => void;
  }) => (
    <div className="space-y-2">
      {options.map((option) => (
        <label key={option.value} className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange(e.target.value)}
            className="w-4 h-4 text-purple-600 focus:ring-purple-500"
          />
          <span className="text-gray-700">{option.label}</span>
        </label>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 via-purple-300 to-pink-300 p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-4 border-purple-300 p-8 mb-6">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4 shadow-lg">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Child Learning & Reading Readiness Assessment
            </h1>
            <p className="text-gray-600 mb-2">
              For Parent / Teacher Use Only
            </p>
            <div className="inline-block bg-blue-100 border-2 border-blue-300 rounded-lg px-4 py-2">
              <p className="text-blue-800">
                Assessment for: <span className="font-semibold">{childName}</span>
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
            <p className="text-blue-800 text-sm">
              <strong>Purpose:</strong> This assessment helps identify the child's reading ability, learning readiness, 
              attention level, and preferred learning style. The information will be used to adjust the learning experience 
              inside the assessment application to better suit the child's needs.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* A. Child Information */}
            <section className="border-4 border-purple-200 rounded-lg p-6 bg-purple-50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white">
                  A
                </div>
                <h2 className="text-2xl text-purple-700">Child Information</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-purple-700 mb-3 block">
                    Grade / Level (if applicable) *
                  </Label>
                  <RadioGroup
                    name="gradeLevel"
                    value={formData.gradeLevel}
                    onChange={(value) => setFormData({ ...formData, gradeLevel: value })}
                    options={[
                      { value: 'preschool', label: 'Preschool' },
                      { value: 'kindergarten', label: 'Kindergarten' },
                      { value: 'grade1', label: 'Grade 1' },
                      { value: 'grade2plus', label: 'Grade 2 or above' },
                      { value: 'notEnrolled', label: 'Not currently enrolled' },
                    ]}
                  />
                </div>

                <div>
                  <Label className="text-purple-700 mb-3 block">
                    Has the child undergone any prior learning assessment?
                  </Label>
                  <RadioGroup
                    name="priorAssessment"
                    value={formData.priorAssessment}
                    onChange={(value) => setFormData({ ...formData, priorAssessment: value })}
                    options={[
                      { value: 'yes', label: 'Yes' },
                      { value: 'no', label: 'No' },
                      { value: 'notSure', label: 'Not sure' },
                    ]}
                  />
                </div>
              </div>
            </section>

            {/* B. Reading Ability */}
            <section className="border-4 border-blue-200 rounded-lg p-6 bg-blue-50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl text-blue-700">Reading Ability</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-blue-700 mb-3 block">
                    How would you describe the child's reading ability? *
                  </Label>
                  <RadioGroup
                    name="readingAbility"
                    value={formData.readingAbility}
                    onChange={(value) => setFormData({ ...formData, readingAbility: value })}
                    options={[
                      { value: 'cannotRead', label: 'Cannot read yet' },
                      { value: 'lettersOnly', label: 'Recognizes letters only' },
                      { value: 'simpleWords', label: 'Reads simple words' },
                      { value: 'simpleSentences', label: 'Reads simple sentences' },
                      { value: 'shortStories', label: 'Reads short stories independently' },
                    ]}
                  />
                </div>

                <div>
                  <Label className="text-blue-700 mb-3 block">
                    Can the child recognize the alphabet (A–Z)?
                  </Label>
                  <RadioGroup
                    name="recognizeAlphabet"
                    value={formData.recognizeAlphabet}
                    onChange={(value) => setFormData({ ...formData, recognizeAlphabet: value })}
                    options={[
                      { value: 'yes', label: 'Yes' },
                      { value: 'some', label: 'Some letters' },
                      { value: 'no', label: 'No' },
                    ]}
                  />
                </div>

                <div>
                  <Label className="text-blue-700 mb-3 block">
                    Can the child recognize letter sounds (phonics)?
                  </Label>
                  <RadioGroup
                    name="letterSounds"
                    value={formData.letterSounds}
                    onChange={(value) => setFormData({ ...formData, letterSounds: value })}
                    options={[
                      { value: 'yes', label: 'Yes' },
                      { value: 'sometimes', label: 'Sometimes' },
                      { value: 'no', label: 'No' },
                    ]}
                  />
                </div>

                <div>
                  <Label className="text-blue-700 mb-3 block">
                    Can the child understand instructions when they are spoken aloud?
                  </Label>
                  <RadioGroup
                    name="understandInstructions"
                    value={formData.understandInstructions}
                    onChange={(value) => setFormData({ ...formData, understandInstructions: value })}
                    options={[
                      { value: 'yes', label: 'Yes' },
                      { value: 'sometimes', label: 'Sometimes' },
                      { value: 'no', label: 'No' },
                    ]}
                  />
                </div>
              </div>
            </section>

            {/* C. Language & Communication */}
            <section className="border-4 border-green-200 rounded-lg p-6 bg-green-50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl text-green-700">Language & Communication</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-green-700 mb-3 block">
                    Primary language spoken at home:
                  </Label>
                  <RadioGroup
                    name="primaryLanguage"
                    value={formData.primaryLanguage}
                    onChange={(value) => setFormData({ ...formData, primaryLanguage: value })}
                    options={[
                      { value: 'english', label: 'English' },
                      { value: 'filipino', label: 'Filipino' },
                      { value: 'other', label: 'Other' },
                    ]}
                  />
                  {formData.primaryLanguage === 'other' && (
                    <Input
                      type="text"
                      placeholder="Please specify language"
                      value={formData.otherLanguage}
                      onChange={(e) => setFormData({ ...formData, otherLanguage: e.target.value })}
                      className="mt-2 border-2 border-green-300"
                    />
                  )}
                </div>

                <div>
                  <Label className="text-green-700 mb-3 block">
                    Can the child express answers or needs verbally?
                  </Label>
                  <RadioGroup
                    name="verbalExpression"
                    value={formData.verbalExpression}
                    onChange={(value) => setFormData({ ...formData, verbalExpression: value })}
                    options={[
                      { value: 'clearly', label: 'Clearly' },
                      { value: 'someDifficulty', label: 'With some difficulty' },
                      { value: 'veryLimited', label: 'Very limited' },
                    ]}
                  />
                </div>

                <div>
                  <Label className="text-green-700 mb-3 block">
                    Does the child understand basic spoken questions?
                  </Label>
                  <RadioGroup
                    name="understandQuestions"
                    value={formData.understandQuestions}
                    onChange={(value) => setFormData({ ...formData, understandQuestions: value })}
                    options={[
                      { value: 'yes', label: 'Yes' },
                      { value: 'sometimes', label: 'Sometimes' },
                      { value: 'no', label: 'No' },
                    ]}
                  />
                </div>
              </div>
            </section>

            {/* D. Attention & Behavior */}
            <section className="border-4 border-orange-200 rounded-lg p-6 bg-orange-50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                  <Focus className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl text-orange-700">Attention & Behavior</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-orange-700 mb-3 block">
                    How long can the child stay focused on an activity?
                  </Label>
                  <RadioGroup
                    name="focusDuration"
                    value={formData.focusDuration}
                    onChange={(value) => setFormData({ ...formData, focusDuration: value })}
                    options={[
                      { value: 'lessThan5', label: 'Less than 5 minutes' },
                      { value: '5to10', label: '5–10 minutes' },
                      { value: '10to20', label: '10–20 minutes' },
                      { value: 'moreThan20', label: 'More than 20 minutes' },
                    ]}
                  />
                </div>

                <div>
                  <Label className="text-orange-700 mb-3 block">
                    Does the child enjoy learning activities or games?
                  </Label>
                  <RadioGroup
                    name="enjoysLearning"
                    value={formData.enjoysLearning}
                    onChange={(value) => setFormData({ ...formData, enjoysLearning: value })}
                    options={[
                      { value: 'yes', label: 'Yes' },
                      { value: 'sometimes', label: 'Sometimes' },
                      { value: 'no', label: 'No' },
                    ]}
                  />
                </div>

                <div>
                  <Label className="text-orange-700 mb-3 block">
                    How does the child react when tasks become difficult?
                  </Label>
                  <RadioGroup
                    name="difficultyReaction"
                    value={formData.difficultyReaction}
                    onChange={(value) => setFormData({ ...formData, difficultyReaction: value })}
                    options={[
                      { value: 'triesAgain', label: 'Tries again' },
                      { value: 'getFrustrated', label: 'Gets frustrated easily' },
                      { value: 'stopsImmediately', label: 'Stops immediately' },
                    ]}
                  />
                </div>
              </div>
            </section>

            {/* E. Learning Preferences */}
            <section className="border-4 border-pink-200 rounded-lg p-6 bg-pink-50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl text-pink-700">Learning Preferences</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-pink-700 mb-3 block">
                    The child learns best through:
                  </Label>
                  <RadioGroup
                    name="learningStyle"
                    value={formData.learningStyle}
                    onChange={(value) => setFormData({ ...formData, learningStyle: value })}
                    options={[
                      { value: 'visual', label: 'Pictures and visuals' },
                      { value: 'audio', label: 'Listening and audio instructions' },
                      { value: 'handsOn', label: 'Hands-on activities' },
                      { value: 'combination', label: 'A combination of all' },
                    ]}
                  />
                </div>

                <div>
                  <Label className="text-pink-700 mb-3 block">
                    Which activities does the child enjoy most?
                  </Label>
                  <RadioGroup
                    name="preferredActivities"
                    value={formData.preferredActivities}
                    onChange={(value) => setFormData({ ...formData, preferredActivities: value })}
                    options={[
                      { value: 'music', label: 'Music and sounds' },
                      { value: 'pictures', label: 'Pictures and colors' },
                      { value: 'movement', label: 'Movement and actions' },
                      { value: 'storytelling', label: 'Storytelling' },
                    ]}
                  />
                </div>
              </div>
            </section>

            {/* F. Technology Familiarity */}
            <section className="border-4 border-indigo-200 rounded-lg p-6 bg-indigo-50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl text-indigo-700">Technology Familiarity</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-indigo-700 mb-3 block">
                    Has the child used a tablet or mobile phone before?
                  </Label>
                  <RadioGroup
                    name="deviceUsage"
                    value={formData.deviceUsage}
                    onChange={(value) => setFormData({ ...formData, deviceUsage: value })}
                    options={[
                      { value: 'often', label: 'Yes, often' },
                      { value: 'sometimes', label: 'Sometimes' },
                      { value: 'never', label: 'Never' },
                    ]}
                  />
                </div>

                <div>
                  <Label className="text-indigo-700 mb-3 block">
                    The child can independently:
                  </Label>
                  <div className="space-y-2">
                    {[
                      { value: 'tap', label: 'Tap items on the screen' },
                      { value: 'drag', label: 'Drag and drop objects' },
                      { value: 'swipe', label: 'Swipe the screen' },
                      { value: 'needsAssistance', label: 'Needs assistance' },
                    ].map((skill) => (
                      <label key={skill.value} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.independentSkills.includes(skill.value)}
                          onChange={() => handleCheckboxChange('independentSkills', skill.value)}
                          className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 rounded"
                        />
                        <span className="text-gray-700">{skill.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* G. Special Considerations */}
            <section className="border-4 border-red-200 rounded-lg p-6 bg-red-50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl text-red-700">Special Considerations</h2>
              </div>

              <div>
                <Label className="text-red-700 mb-3 block">
                  (Leave blank if not applicable)
                </Label>
                <div className="space-y-2">
                  {[
                    { value: 'speechDelay', label: 'Speech delay' },
                    { value: 'learningDifficulty', label: 'Learning difficulty' },
                    { value: 'hearingDifficulty', label: 'Hearing difficulty' },
                    { value: 'visionDifficulty', label: 'Vision difficulty' },
                    { value: 'attentionConcerns', label: 'Attention or focus concerns' },
                    { value: 'other', label: 'Other' },
                  ].map((consideration) => (
                    <label key={consideration.value} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.specialConsiderations.includes(consideration.value)}
                        onChange={() => handleCheckboxChange('specialConsiderations', consideration.value)}
                        className="w-4 h-4 text-red-600 focus:ring-red-500 rounded"
                      />
                      <span className="text-gray-700">{consideration.label}</span>
                    </label>
                  ))}
                </div>
                {formData.specialConsiderations.includes('other') && (
                  <Input
                    type="text"
                    placeholder="Please specify"
                    value={formData.otherConsideration}
                    onChange={(e) => setFormData({ ...formData, otherConsideration: e.target.value })}
                    className="mt-3 border-2 border-red-300"
                  />
                )}
              </div>
            </section>

            {/* H. Learning Support & Motivation */}
            <section className="border-4 border-yellow-200 rounded-lg p-6 bg-yellow-50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl text-yellow-700">Learning Support & Motivation</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-yellow-700 mb-3 block">
                    During learning activities, the child is usually:
                  </Label>
                  <RadioGroup
                    name="supervisionLevel"
                    value={formData.supervisionLevel}
                    onChange={(value) => setFormData({ ...formData, supervisionLevel: value })}
                    options={[
                      { value: 'alwaysSupervised', label: 'Always supervised' },
                      { value: 'sometimesSupervised', label: 'Sometimes supervised' },
                      { value: 'independent', label: 'Independent' },
                    ]}
                  />
                </div>

                <div>
                  <Label className="text-yellow-700 mb-3 block">
                    What motivates the child most?
                  </Label>
                  <RadioGroup
                    name="motivation"
                    value={formData.motivation}
                    onChange={(value) => setFormData({ ...formData, motivation: value })}
                    options={[
                      { value: 'praise', label: 'Praise' },
                      { value: 'rewards', label: 'Rewards or stickers' },
                      { value: 'games', label: 'Games' },
                      { value: 'stories', label: 'Stories' },
                      { value: 'competition', label: 'Competition' },
                    ]}
                  />
                </div>
              </div>
            </section>

            {/* I. Overall Assessment */}
            <section className="border-4 border-teal-200 rounded-lg p-6 bg-teal-50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white">
                  I
                </div>
                <h2 className="text-2xl text-teal-700">Overall Assessment</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-teal-700 mb-3 block">
                    Overall learning level of the child:
                  </Label>
                  <RadioGroup
                    name="overallLevel"
                    value={formData.overallLevel}
                    onChange={(value) => setFormData({ ...formData, overallLevel: value })}
                    options={[
                      { value: 'beginner', label: 'Beginner learner' },
                      { value: 'developing', label: 'Developing learner' },
                      { value: 'confident', label: 'Confident learner' },
                    ]}
                  />
                </div>

                <div>
                  <Label htmlFor="additionalNotes" className="text-teal-700 mb-2 block">
                    Additional notes or observations about the child:
                  </Label>
                  <Textarea
                    id="additionalNotes"
                    rows={5}
                    placeholder="Share any additional observations that might help personalize the learning experience..."
                    value={formData.additionalNotes}
                    onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                    className="border-2 border-teal-300"
                  />
                </div>
              </div>
            </section>

            <div className="flex gap-4 pt-6">
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xl py-7 shadow-lg hover:shadow-xl transition-all"
              >
                Complete Assessment 🎯
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
