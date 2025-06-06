import { useRouter } from 'next/router';
import { generateQuestions } from '../lib/generateQuestions';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function ConditionFeedback() {
  const router = useRouter();
  const [intervention, setIntervention] = useState('');
  const [step, setStep] = useState<number>(0);
  const [formData, setFormData] = useState({
    helpfulness: '',
    stress: '',
    comprehension: '',
    difficulty: '',
    confidence: '',
    usefulness: '',
    notes: '',
  });

    const [questions, setQuestions] = useState<{ question: string, answer: string }[]>([]);
    const [answers, setAnswers] = useState<string[]>(['', '', '']);

    const handleAnswerChange = (i: number, val: string) => {
    const copy = [...answers];
    copy[i] = val;
    setAnswers(copy);
    };

    useEffect(() => {
        if (typeof window === 'undefined') return;
      
        const orderRaw = localStorage.getItem('interventionOrder');
        const currentStep = parseInt(localStorage.getItem('currentStep') || '0', 10);
      
        if (orderRaw) {
          const order = JSON.parse(orderRaw);
          setStep(currentStep);
          setIntervention(order[currentStep]);
      
          const session_id = localStorage.getItem('session_id');
          if (session_id && order[currentStep]) {
            generateQuestions(session_id, order[currentStep]).then((res) => {
              setQuestions(res.questions);
            });
          }
        }
      }, []);
      

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {

    const session_id = localStorage.getItem('session_id');
    const user_id = localStorage.getItem('user_id');
  
    await supabase.from('condition_feedback').insert({
      session_id,
      user_id,
      condition: intervention,
      condition_index: step,
      gpt_q1: questions[0]?.question,
      gpt_a1: answers[0],
      gpt_q2: questions[1]?.question,
      gpt_a2: answers[1],
      gpt_q3: questions[2]?.question,
      gpt_a3: answers[2],
      timestamp: new Date().toISOString(),
      ...formData
    });
  
    const currentStep = parseInt(localStorage.getItem('currentStep') || '0', 10);
    const nextStep = currentStep + 1;
    const totalSteps = 4;
  
    localStorage.setItem('currentStep', nextStep.toString());
  
    if (nextStep < totalSteps) {
      router.push('/readingstudy');
    } else {
      router.push('/postsurvey');
    }
  };
  
  
  return (
    <div className="p-4 max-w-md mx-auto">
      {questions.length > 0 && (
        <div className="mt-6">
            <h3 className="font-semibold mb-2">Quick questions about what you just read, answer as best as you can:</h3>
            {questions.map((q, i) => (
            <div key={i} className="mb-4">
                <p className="mb-1 text-gray-800">{q.question}</p>
                <textarea
                value={answers[i]}
                onChange={(e) => handleAnswerChange(i, e.target.value)}
                className="w-full border p-2 rounded"
                rows={2}
                />
            </div>
            ))}
        </div>
        )}
    
        <label className="block p-2 mb-1 font-semibold">I understood the text well.</label>
        <select name="comprehension" value={formData.comprehension} onChange={handleChange} className="block mb-4 p-2 border rounded w-full">
        <option value="">Select</option>
        <option value="1">Completely agree</option>
        <option value="2">Somewhat agree</option>
        <option value="3">Neutral</option>
        <option value="4">Somewhat disagree</option>
        <option value="5">Completely disagree</option>
        </select>

        <label className="block p-2 mb-1 font-semibold">The story felt difficult to follow.</label>
        <select name="difficulty" value={formData.difficulty} onChange={handleChange} className="block mb-4 p-2 border rounded w-full">
        <option value="">Select</option>
        <option value="1">Completely agree</option>
        <option value="2">Somewhat agree</option>
        <option value="3">Neutral</option>
        <option value="4">Somewhat disagree</option>
        <option value="5">Completely disagree</option>
        </select>

        <label className="block p-2 mb-1 font-semibold">I felt comfortable while reading.</label>
        <select name="confidence" value={formData.confidence} onChange={handleChange} className="block mb-4 p-2 border rounded w-full">
        <option value="">Select</option>
        <option value="1">Completely agree</option>
        <option value="2">Somewhat agree</option>
        <option value="3">Neutral</option>
        <option value="4">Somewhat disagree</option>
        <option value="5">Completely disagree</option>
        </select>

        <label className="block p-2 mb-1 font-semibold">The method helped me understand the text better.</label>
        <select name="usefulness" value={formData.usefulness} onChange={handleChange} className="block mb-4 p-2 border rounded w-full">
        <option value="">Select</option>
        <option value="1">Completely agree</option>
        <option value="2">Somewhat agree</option>
        <option value="3">Neutral</option>
        <option value="4">Somewhat disagree</option>
        <option value="5">Completely disagree</option>
        </select>


      <label className="block p-2 mb-1 font-semibold">This method felt helpful.</label>
      <select name="helpfulness" value={formData.helpfulness} onChange={handleChange} className="block mb-4 p-2 border rounded w-full">
        <option value="">Select</option>
        <option value="1">Completely agree</option>
        <option value="2">Somewhat agree</option>
        <option value="3">Neutral</option>
        <option value="4">Somewhat disagree</option>
        <option value="5">Completely disagree</option>
      </select>

      <label className="block p-2 mb-1 font-semibold">I felt uncomfortable while reading.</label>
      <select name="stress" value={formData.stress} onChange={handleChange} className="block mb-4 p-2 border rounded w-full">
        <option value="">Select</option>
        <option value="1">Completely agree</option>
        <option value="2">Somewhat agree</option>
        <option value="3">Neutral</option>
        <option value="4">Somewhat disagree</option>
        <option value="5">Completely disagree</option>
      </select>

      <label className="block p-2 mb-1 font-semibold">Do you have any other comments about this method? Something that went well or did not go well?</label>
      <textarea name="notes" value={formData.notes} onChange={handleChange} className="block mb-4 p-2 border rounded w-full" rows={4}></textarea>


      <div className="flex justify-end">
        <button onClick={handleSubmit} className="px-4 py-2 bg-green-600 text-white rounded">
            Next
        </button>
    </div>
    </div>
  );
}
