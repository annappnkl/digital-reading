// pages/Completion.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Complete() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/'); // reroute to start/index screen
    }, 3000); // 3 seconds delay to let the user read the message

    return () => clearTimeout(timer);
  }, [router]);

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
      <p className="mt-2 text-sm text-gray-500">You’ll be redirected to the start screen shortly.</p>
    </div>
  );
}
