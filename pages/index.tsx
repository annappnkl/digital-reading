// pages/index.tsx
import { useRouter } from 'next/router';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabaseClient';

export default function Start() {
  const router = useRouter();


  const generateRandomInterventionOrder = () => {
    const interventions = ['synonym', 'explanation', 'translation', 'click_only'];
    for (let i = interventions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [interventions[i], interventions[j]] = [interventions[j], interventions[i]];
    }
    return interventions;
  };

  const handleStart = async () => {
    const session_id = uuidv4();
    const user_id = 'user-' + new Date().toISOString();
    const interventionOrder = generateRandomInterventionOrder();
    const readingLevel = 'unknown'; // Will be updated later after ReadTheory-style quiz
  
    localStorage.setItem('session_id', session_id);
    localStorage.setItem('user_id', user_id);
    localStorage.setItem('interventionOrder', JSON.stringify(interventionOrder));
    localStorage.setItem('currentStep', '0');
  
    await supabase.from('sessions').insert({
      session_id: session_id,
      user_id: user_id,
      start_time: new Date().toISOString(),
      session_type: 'interactive',
      intervention_order: JSON.stringify(interventionOrder),
      reading_level: readingLevel
    });
  };
  

  const handleButtonClick = async () => {
    await handleStart();
    router.push('/presurvey');
  };

  
  
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">📖 Welcome to the Reading Study!</h1>
        <p className="mb-6 text-gray-700">
        The study takes about 10–15 minutes and your responses will remain anonymous.
        </p>
        <button
          onClick={handleButtonClick}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Start
        </button>
      </div>
    </div>
  );
}
