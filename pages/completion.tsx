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
      <p className="mt-2 text-sm text-gray-500">If you came from SurveySwap here is your Karma: V3GR-DYBX-OL7U .</p>
    </div>
  );
}
