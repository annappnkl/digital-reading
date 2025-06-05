// pages/postsurvey.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function PostSurvey() {
    const router = useRouter();
    const [formData, setFormData] = useState({
      ranking_helpful: '',
      ranking_enjoyable: '',
      ranking_not_enjoyable:  '',
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
     <h1 className="text-xl font-bold mb-4">✨ Yay you did it! Some last questions</h1>

    
      <label className="block mt-4 p-2 mb-1 font-semibold">Which method was the most helpful?</label>
      <select name="ranking_helpful" value={formData.ranking_helpful} onChange={handleChange} className="block mb-2 p-2 border rounded w-full">
        <option value="">Select</option>
        {['Synonym/simplification replacement', 'Detailed explanation', 'Translation to my native language', 'Marking words & dictionary', 'None'].map(opt => (
          <option key={opt} value={opt}>{opt.replace('_', ' ')}</option>
        ))}
      </select>

      <label className="block p-2 mb-1 font-semibold">Which method did you enjoy using the most?</label>
      <select name="ranking_enjoyable" value={formData.ranking_enjoyable} onChange={handleChange} className="block mb-2 p-2 border rounded w-full">
        <option value="">Select</option>
        {['Synonym/simplification replacement', 'Detailed explanation', 'Translation to my native language', 'Marking words & dictionary', 'None'].map(opt => (
          <option key={opt} value={opt}>{opt.replace('_', ' ')}</option>
        ))}
      </select>

      <label className="block p-2 mb-1 font-semibold">Which method did you enjoy using the least?</label>
      <select name="ranking_not_enjoyable" value={formData.ranking_not_enjoyable} onChange={handleChange} className="block mb-2 p-2 border rounded w-full">
        <option value="">Select</option>
        {['Synonym/simplification replacement', 'Detailed explanation', 'Translation to my native language', 'Marking words & dictionary', 'None'].map(opt => (
          <option key={opt} value={opt}>{opt.replace('_', ' ')}</option>
        ))}
      </select>

      <label className="block p-2 mb-1 font-semibold">Which method distracted you most from reading?</label>
      <select name="ranking_disruptive" value={formData.ranking_disruptive} onChange={handleChange} className="block mb-2 p-2 border rounded w-full">
        <option value="">Select</option>
        {['Synonym/simplification replacement', 'Detailed explanation', 'Translation to my native language', 'Marking words & dictionary', 'None'].map(opt => (
          <option key={opt} value={opt}>{opt.replace('_', ' ')}</option>
        ))}
      </select>

      <label className="block p-2 mb-1 font-semibold">Which method required the most effort?</label>
      <select name="ranking_effort" value={formData.ranking_effort} onChange={handleChange} className="block mb-2 p-2 border rounded w-full">
        <option value="">Select</option>
        {['Synonym/simplification replacement', 'Detailed explanation', 'Translation to my native language', 'Marking words & dictionary', 'None'].map(opt => (
          <option key={opt} value={opt}>{opt.replace('_', ' ')}</option>
        ))}
      </select>

      <label className="block p-2 mb-1 font-semibold">Any final thoughts or suggestions?</label>
      <textarea name="notes" value={formData.notes} onChange={handleChange} className="block mb-4 p-2 border rounded w-full" rows={4}></textarea>

      <div className="flex justify-end">
        <button onClick={handleSubmit} className="px-4 py-2 bg-green-600 text-white rounded">
          Submit
        </button>
      </div>

    </div>
  );
}
