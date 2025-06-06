// pages/studyintro.tsx
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Start() {
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem('interventionOrder')) {
      const interventions = ['click_only', 'translation', 'explanation', 'synonym'];
      const shuffled = interventions.sort(() => 0.5 - Math.random());
      localStorage.setItem('interventionOrder', JSON.stringify(shuffled));
      localStorage.setItem('currentStep', '0');
    }
  }, []);
  
  return (
    <div className="min-h-screen flex p-4">
      <div className="max-w-md text-left">
        <h1 className="text-2xl font-bold mb-4">📖 Now let&apos;s read! You can click on any word in these texts! In each story, clicking a word tirggers a different interaction!</h1>
        <p className="mb-6 text-gray-700">
        Each story takes approximately 3-4 minutes to read. After each story, you will be asked questions.
        </p>
        <p className="mb-6 text-gray-700">
        Before you start reading a story, the method will be explained to you. Read the instruction and start reading.
        </p>
        <button
          onClick={() => router.push('/readingstudy')}
          className="px-6 py-2 flex justify-end bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Start Reading
        </button>
      </div>
    </div>
  );
}
