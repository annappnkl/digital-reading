// pages/PreSurvey.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function PreSurvey() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    native_language: '',
    reading_language: '',
    english_proficiency: '',
    education: '',
    current_education: '',
    frequency: '',
    duration: '',
    understanding_method: '',
    success: '',
    fail_reason: '',
    bothered: '',
    reading_confidence: '',
    reading_satisfaction: '',
    reading_barriers: '',
    bother_reason: '',
  });
  const [consentGiven, setConsentGiven] = useState(false);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = async () => {
    const requiredFields = [
      'age',
      'gender',
      'native_language',
      'reading_language',
      'english_proficiency',
      'education',
      'current_education',
      'frequency',
      'duration',
      'understanding_method',
      'success',
      'bothered',
      'reading_confidence',
      'reading_satisfaction'
    ];
  
    const missing = requiredFields.some(field => !formData[field as keyof typeof formData]);
  
    if (missing) {
      alert('Please fill in all info before proceeding');
      return;
    }
  
    localStorage.setItem('preSurveyData', JSON.stringify(formData));
    const session_id = localStorage.getItem('session_id');
    const user_id = localStorage.getItem('user_id');
    localStorage.setItem('native_language', formData.native_language);
  
    const payload = {
      session_id,
      user_id,
      timestamp: new Date().toISOString(),
      ...formData
    };
  
    const { error } = await supabase.from('pre_survey').insert(payload);
    if (error) {
      console.error('Supabase insert error:', error);
      return;
    }
  
    // Map to CEFR and store
    const levelMap: Record<string, string> = {
      native: 'C2',
      fluent: 'C1',
      intermediate: 'B1',
      basic: 'A1'
    };
    const level = levelMap[formData.english_proficiency] || 'B2';
    localStorage.setItem('english_level', level);
  
    router.push('/studyintro');
  };
  
  

  return (
    <div className="p-4 max-w-md mx-auto">
      {step === 1 && (
        <div>
          <h2 className="text-xl font-bold mb-2">Consent & Overview</h2>
          <p className="mb-4">        This study explores how interactive digital reading tools can support comprehension when reading longer texts. You’ll be asked to read 4 short excerpts and interact with the text by clicking on words that you don't understand.
          At the start and end, you’ll answer a few questions about your experience.</p>
          <label className="block mb-2">
            <input
              type="checkbox"
              checked={consentGiven}
              onChange={(e) => setConsentGiven(e.target.checked)}
              className="mr-2"
            />
            I agree to participate in the study and to my answers being used within this research. I understand that my responses will be anonymous.
          </label>
          <div className="flex justify-end mt-4">

            <button
              onClick={nextStep}
              disabled={!consentGiven}
              className={`mt-4 px-4 py-2 rounded text-white ${consentGiven ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
            >
              Next
            </button>
            </div>
        </div>
      )}

        {step === 2 && (
        <div>
            <h2 className="text-xl font-bold mb-2">Some questions about you!</h2>

            <input
            name="age"
            type="number"
            placeholder="Age"
            value={formData.age}
            onChange={handleChange}
            className="block mb-2 p-2 border rounded w-full"
            />

            <label className="block p-2 mb-1 font-semibold">Gender</label>
            <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="block mb-2 p-2 border rounded w-full"
            >
            <option value="">Select</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="nonbinary">Non-binary</option>
            <option value="prefer_not_say">Prefer not to say</option>
            </select>

            <input
            name="native_language"
            placeholder="Your native language"
            value={formData.native_language}
            onChange={handleChange}
            className="block p-2 mb-1 border rounded w-full"
            />
            <input
            name="reading_language"
            placeholder="Languages you read in"
            value={formData.reading_language}
            onChange={handleChange}
            className="block mb-2 p-2 border rounded w-full"
            />
            <label className="block p-2 mb-1 font-semibold">How well do you speak English?</label>
              <select
                name="english_proficiency"
                value={formData.english_proficiency}
                onChange={handleChange}
                className="block mb-2 p-2 border rounded w-full"
              >
                <option value="">Select</option>
                <option value="native">Native speaker (C2)</option>
                <option value="fluent">Fluent (C1)</option>
                <option value="intermediate">Intermediate (B1, B2)</option>
                <option value="basic">Basic (A1, A2)</option>
              </select>

            <label className="block p-2 mb-1 font-semibold">What is your most recent fulfilled Education Level?</label>
            <select
            name="education"
            value={formData.education}
            onChange={handleChange}
            className="block mb-2 p-2 border rounded w-full"
            >
              <option value="">Select</option>
              <option value="highschool">High School</option>
              <option value="bachelor">Bachelor’s Degree</option>
              <option value="master">Master’s Degree</option>
              <option value="doctorate">Doctorate or higher</option>
              <option value="other">Other</option>
            </select>
            <label className="block p-2 mb-1 font-semibold">And what's your current Education or Occupation?</label>
            <select
            name="current_education"
            value={formData.current_education}
            onChange={handleChange}
            className="block mb-2 p-2 border rounded w-full"
            >
              <option value="">Select</option>
              <option value="highschool">High School</option>
              <option value="bachelor">Bachelor’s Degree</option>
              <option value="master">Master’s Degree</option>
              <option value="doctorate">Doctorate</option>
              <option value="working">Working</option>
              <option value="other">Other</option>
            </select>

            <div className="flex justify-end mt-4">
              <button onClick={nextStep} className="px-4 justify-end py-2 bg-blue-600 text-white rounded">Next</button>
            </div>
        </div>
        )}


      {step === 3 && (
        <div>
          <h2 className="text-xl font-bold mb-2">Reading Habits</h2>
          <label className="block p-2 mb-1 font-semibold">How often do you read books on your phone or a digital device?</label>
          <select name="frequency" value={formData.frequency} onChange={handleChange} className="block mb-2 p-2 border rounded w-full">
            <option value="">Select</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="rarely">Rarely</option>
          </select>
          <label className="block p-2 mb-1 font-semibold">Try to estimate how long you read on average, in each reading session.</label>
          <select name="duration" value={formData.duration} onChange={handleChange} className="block mb-2 p-2 border rounded w-full">
            <option value="">Select</option>
            <option value="0">Less than 5 minutes</option>
            <option value="1">5-15 minutes</option>
            <option value="2">15-30 minutes</option>
            <option value="3">30-60 minutes</option>
            <option value="4">1-2 hours</option>
            <option value="5">More than 2 hours at a time</option>
          </select>

          <label className="block p-2 mb-1 font-semibold">When you don't understand a word you are reading what do you do?</label>
          <select name="understanding_method" value={formData.understanding_method} onChange={handleChange} className="block mb-2 p-2 border rounded w-full">
            <option value="">Select</option>
            <option value="infer">I try to understand through context</option>
            <option value="ignore">I ignore it</option>
            <option value="google">I look on google</option>
            <option value="app">I use a dictionary app</option>
            <option value="book">I use an analog book dictionary</option>
            <option value="function">I the "look up" or "define" function of the app I read on</option>
            <option value="ask">I ask somebody</option>
            <option value="other">Other</option>
          </select>

          <label className="block p-2 mb-1 font-semibold">How successful do you feel you are with this method?</label>
          <select name="success" value={formData.success} onChange={handleChange} className="block mb-2 p-2 border rounded w-full">
            <option value="">Select</option>
            <option value="1">Not at all</option>
            <option value="2">Somewhat</option>
            <option value="3">Good</option>
            <option value="4">Very good</option>
            <option value="5">Excellent</option>
          </select>

          <label className="block p-2 mb-1 font-semibold">If you said "not at all" or "somewhat", what do you think is the reason?</label>
          <input name="fail_reason" 
          placeholder=""
          value={formData.fail_reason} 
          onChange={handleChange} 
          className="block mb-2 p-2 border rounded w-full">
          </input>

          <label className="block p-2 mb-1 font-semibold">Does it bother you, when you don't understand something you read?</label>
          <select name="bothered" value={formData.bothered} onChange={handleChange} className="block mb-2 p-2 border rounded w-full">
            <option value="">Select</option>
            <option value="1">Not at all</option>
            <option value="2">Very little</option>
            <option value="3">Moderately</option>
            <option value="4">A lot</option>
            <option value="5">Very very much</option>
          </select>

          {parseInt(formData.bothered) >= 2 && (
            <>
              <label className="block p-2 mb-1 font-semibold">Why does it bother you?</label>
              <textarea
                name="bother_reason"
                placeholder="e.g. It breaks the flow, makes me feel slow or confused, distracts me, I end up on Instagram/TikTok etc."
                value={formData.bother_reason || ''}
                onChange={handleChange}
                className="block mb-4 p-2 border rounded w-full"
                rows={3}
              />
            </>
          )}
          <div className="flex justify-end mt-4">
            <button onClick={nextStep} className="px-4 py-2 bg-blue-600 text-white rounded">Next</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <h2 className="text-xl font-bold mb-2">Please state how much you agree or disagree with these statements.</h2>
          <label className="block p-2 mb-1 font-semibold">I am confident in my English reading abilities.</label>
          <select name="reading_confidence" value={formData.reading_confidence} onChange={handleChange} className="block mb-4 p-2 border rounded w-full">
            <option value="">Select</option>
            <option value="1">Strongly disagree</option>
            <option value="2">Disagree</option>
            <option value="3">Neutral</option>
            <option value="4">Agree</option>
            <option value="5">Strongly agree</option>
        </select>
        <label className="block p-2 mb-1 font-semibold">I am happy with how much I read.</label>
        <select
          name="reading_satisfaction"
          value={formData.reading_satisfaction}
          onChange={handleChange}
          className="block mb-2 p-2 border rounded w-full"
        >
          <option value="">Select</option>
          <option value="very_happy">Yes, I'm very happy</option>
          <option value="somewhat_happy">Somewhat, but I’d like to read more</option>
          <option value="neutral">I'm neutral about it</option>
          <option value="somewhat_unhappy">Not really, I wish I read more</option>
          <option value="very_unhappy">No, I'm not happy with how little I read</option>
        </select>

        {['somewhat_happy', 'somewhat_unhappy', 'very_unhappy', 'neutral'].includes(formData.reading_satisfaction) && (
          <>
            <label className="block mb-2">If you wish you read more, why don’t you?</label>
            <textarea
              name="reading_barriers"
              placeholder="e.g. no time, too tired, too many distractions..."
              value={formData.reading_barriers}
              onChange={handleChange}
              className="block mb-4 p-2 border rounded w-full"
              rows={3}
            />
          </>
        )}

          <div className="flex justify-end mt-4">
            <button onClick={handleSubmit} className="px-4 py-2 justify-end bg-blue-600 text-white rounded">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
