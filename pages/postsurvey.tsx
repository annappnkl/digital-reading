// pages/postsurvey.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function PostSurvey() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    ranking_helpful: '',
    ranking_enjoyable: '',
    ranking_disruptive: '',
    ranking_effort: '',
    per_condition_helpfulness: {
      synonym: '',
      explanation: '',
      translation: '',
      click_only: ''
    },
    comprehension: '',
    stress: '',
    notes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    localStorage.setItem('postSurveyData', JSON.stringify(formData));
    const session_id = localStorage.getItem('session_id');
    const user_id = localStorage.getItem('user_id');

    await supabase.from('post_survey').insert({
      session_id,
      user_id,
      timestamp: new Date().toISOString(),
      ...formData
    });

    router.push('/completion');
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      {step === 1 && (
        <>
          <h1 className="text-xl font-bold mb-4">🎉 One last thing!</h1>
          <p className="text-gray-700 mb-4">
            You’re almost done. We just have a few final questions about your experience.
          </p>
          <button
            onClick={() => setStep(2)}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Continue
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <h1 className="text-xl font-bold mb-4">Post-Reading Survey</h1>

          <p className="mb-2 font-semibold">How helpful was each reading mode?</p>
          {['synonym', 'explanation', 'translation', 'click_only'].map(mode => (
            <div key={mode} className="mb-2">
              <label className="capitalize block">{mode.replace('_', ' ')}</label>
              <select
                name={mode}
                value={formData.per_condition_helpfulness[mode]}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    per_condition_helpfulness: {
                      ...prev.per_condition_helpfulness,
                      [mode]: e.target.value
                    }
                  }))
                }
                className="block w-full p-2 border rounded"
              >
                <option value="">Select (1 = Not helpful, 5 = Very helpful)</option>
                {[1, 2, 3, 4, 5].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          ))}

          <label className="block mt-4 mb-1">Which mode was the most helpful?</label>
          <select name="ranking_helpful" value={formData.ranking_helpful} onChange={handleChange} className="block mb-2 p-2 border rounded w-full">
            <option value="">Select</option>
            {['synonym', 'explanation', 'translation', 'click_only'].map(opt => (
              <option key={opt} value={opt}>{opt.replace('_', ' ')}</option>
            ))}
          </select>

          <label className="block mb-1">Which mode did you enjoy using the most?</label>
          <select name="ranking_enjoyable" value={formData.ranking_enjoyable} onChange={handleChange} className="block mb-2 p-2 border rounded w-full">
            <option value="">Select</option>
            {['synonym', 'explanation', 'translation', 'click_only'].map(opt => (
              <option key={opt} value={opt}>{opt.replace('_', ' ')}</option>
            ))}
          </select>

          <label className="block mb-1">Which mode disrupted your reading flow the most?</label>
          <select name="ranking_disruptive" value={formData.ranking_disruptive} onChange={handleChange} className="block mb-2 p-2 border rounded w-full">
            <option value="">Select</option>
            {['synonym', 'explanation', 'translation', 'click_only', 'none'].map(opt => (
              <option key={opt} value={opt}>{opt.replace('_', ' ')}</option>
            ))}
          </select>

          <label className="block mb-1">Which mode required the most effort?</label>
          <select name="ranking_effort" value={formData.ranking_effort} onChange={handleChange} className="block mb-2 p-2 border rounded w-full">
            <option value="">Select</option>
            {['synonym', 'explanation', 'translation', 'click_only'].map(opt => (
              <option key={opt} value={opt}>{opt.replace('_', ' ')}</option>
            ))}
          </select>

          <label className="block mb-2 mt-4">"I feel confident I understood the story."</label>
          <select name="comprehension" value={formData.comprehension} onChange={handleChange} className="block mb-4 p-2 border rounded w-full">
            <option value="">Select</option>
            <option value="1">Strongly disagree</option>
            <option value="2">Disagree</option>
            <option value="3">Neutral</option>
            <option value="4">Agree</option>
            <option value="5">Strongly agree</option>
          </select>

          <label className="block mb-2">"I felt stressed reading the text."</label>
          <select name="stress" value={formData.stress} onChange={handleChange} className="block mb-4 p-2 border rounded w-full">
            <option value="">Select</option>
            <option value="1">Not at all</option>
            <option value="2">A little</option>
            <option value="3">Moderately</option>
            <option value="4">Quite a bit</option>
            <option value="5">Extremely</option>
          </select>

          <label className="block mb-2">Any final thoughts or suggestions?</label>
          <textarea name="notes" value={formData.notes} onChange={handleChange} className="block mb-4 p-2 border rounded w-full" rows={4}></textarea>

          <div className="flex justify-end">
            <button onClick={handleSubmit} className="px-4 py-2 bg-green-600 text-white rounded">
              Submit
            </button>
          </div>
        </>
      )}
    </div>
  );
}
