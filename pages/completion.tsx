// pages/Completion.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Complete() {
  const router = useRouter();

  useEffect(() => {
    localStorage.clear(); // Clear all study-related data
    const timer = setTimeout(() => {
      router.push('/');
    }, 3000);
    return () => clearTimeout(timer);
  }, [router]);
  

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Thank you for participating!</h1>
      <p className="text-gray-700">Your input is valuable to our research.</p>
      <p className="mt-2 text-sm text-gray-500">The following code gives you Karma that can be used to get free research participants at SurveySwap.io. Go to: https://surveyswap.io/sr/V3GR-DYBX-OL7U Or, alternatively, enter the code manually: V3GR-DYBX-OL7U</p>
    </div>
  );
}
