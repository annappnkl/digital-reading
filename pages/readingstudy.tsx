// Optimized reading.tsx file
import { useState, useRef, useEffect } from 'react';
import { logWordClick } from '../lib/log';
import { useRouter } from 'next/router';
import { getTextForCEFRLevel } from '../lib/getTextForCEFRLevel';
import { LogParams } from '../lib/log';

export default function Home() {
  const router = useRouter();
  const [clicked_word_index, setClickedWordIndex] = useState<number | null>(null);
  const [buttonPosition, setButtonPosition] = useState<{ top: number; left: number } | null>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [text, setText] = useState('');
  const [displayedWords, setDisplayedWords] = useState<string[]>([]);
  const [originalWords, setOriginalWords] = useState<string[]>([]);  
  const [loadingAction, setLoadingAction] = useState<'synonym' | 'explanation' | 'retry' | 'translation' | 'explain_after_replace' | 'undo' | null>(null);
  const [modalContent, setModalContent] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [replacedWordIndices, setReplacedWordIndices] = useState<number[]>([]);
  const [session_id, setSession_id] = useState<string | null>(null);
  const [user_id, setUserId] = useState<string | null>(null);
  const [showFinalSecondsMessage] = useState(false);
  const [interventionOrder, setInterventionOrder] = useState<string[]>([]);
  const [currentStep] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('currentStep');
      return stored ? parseInt(stored, 10) : 0;
    }
    return 0;
  });
  
  const [showInstructions, setShowInstructions] = useState(true);
  const [translatedLabels, setTranslatedLabels] = useState<{ [index: number]: string }>({});
  const [simplifiedLabels, setSimplifiedLabels] = useState<{ [index: number]: string }>({});


  useEffect(() => {
    const story = getTextForCEFRLevel(currentStep);
    setText(story);
    const words = story.split(' ');
    setDisplayedWords(words);
    setOriginalWords(words);
  }, [currentStep]);

  useEffect(() => {
    const storedOrder = localStorage.getItem('interventionOrder');
    if (storedOrder) {
      setInterventionOrder(JSON.parse(storedOrder));
    }
  }, []);


  useEffect(() => {
    const storedSession_id = localStorage.getItem('session_id');
    const storedUserId = localStorage.getItem('user_id');

    setSession_id(storedSession_id);
    setUserId(storedUserId);
  }, []);

  /*
  useEffect(() => {
    if (!showInstructions) {

      const warningTimer = setTimeout(() => {
        setShowFinalSecondsMessage(true);
      }, 2 * 60 * 1000 + 55 * 1000); // 2:55
      
      const endTimer = setTimeout(() => {
        setShowFinalSecondsMessage(false);
        router.push('/conditionfeedback');
      }, 3 * 60 * 1000); // 3:00
      
  
      return () => {
        clearTimeout(warningTimer);
        clearTimeout(endTimer);
      };
    }
  }, [showInstructions, currentStep, interventionOrder, router]);
  */

  if (!interventionOrder.length) {
    return <p>Loading...</p>;
  }
  
  const currentIntervention = interventionOrder[currentStep];
  const isClickOnly = currentIntervention === 'click_only';

  
  if (showInstructions) {
    const instructionText: Record<string, string> = {
      synonym: "This method will replace a word with a simpler word or expression.",
      explanation: "This method will explain a word to you in simple english.",
      translation: "This method will translate a word to your native language.",
      click_only: "Just read the following text. If you want to highligh a word, click it, but nothing else will happen.",
    };
  
    return (
      <div className="p-4 max-w-xl mx-auto text-center">
        <h2 className="text-xl font-bold mb-4">📖 Story {currentStep + 1} of 4</h2>
        <p className="mb-6 text-gray-700">{instructionText[currentIntervention]}</p>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => setShowInstructions(false)}
        >
          Got it!
        </button>
      </div>
    );
  }
  

  
    
  const unreplaceable = new Set([
    'i','you','he','she','they','we','it','us','me','him','her','them','my','your','his','its','our','their',
    'this','that','these','those','who','what','where','when','why','how','which','whose',
    'a','an','the','of','to','as','and','or','but','in','on','at','by',
    ...'north,south,east,west'.split(','), ...'-/,(),.!?:;"“”‘’…'.split(''),
    ...'1,2,3,4,5,6,7,8,9,0'.split(','), ...'one,two,three,four,five,six,seven,eight,nine,ten'.split(',')
  ]);

  
  const sentence = text;
  
  const handleWordClick = async (index: number, word: string) => {
  
    setClickedWordIndex(index);

    const el = wordRefs.current[index];
    const container = containerRef.current;

    if (el && container) {
      const { top, left } = el.getBoundingClientRect();
      const { top: cTop, left: cLeft } = container.getBoundingClientRect();
      setButtonPosition({ top: top - cTop - 30, left: left - cLeft }); // <- this sets the floating spinner position
    }


    if (isClickOnly) {
      setReplacedWordIndices(prev => [...prev, index]);
      logWordClick({
        session_id: session_id ?? undefined,
        user_id: user_id ?? undefined,
        condition: currentIntervention,
        word,
        word_index_original: originalWords.findIndex(w => w === word),
        word_index_displayed: index,
        action: 'click_only',
        original_sentence: sentence,
        label: 'n/a',
        result_summary: 'Click logged (visual only)'
      });
      return;
    }

    // Active interventions: trigger appropriate action immediately
    if (currentIntervention === 'synonym') {
      handleAction('synonym');
    }
    if (currentIntervention === 'translation') {
      handleAction('translation');
    } else if (currentIntervention === 'explanation') {
      handleAction('explanation');
    }

  };
  

  const handleAction = async (action: 'synonym' | 'explanation' | 'translation' | 'retry' | 'explain_after_replace' | 'undo' ) => {
    if (clicked_word_index === null) return;
  
    setLoadingAction(action);
    const word = displayedWords[clicked_word_index];
  
    let label = '';
    let result_summary = '';
    let replacement: string | null = null;
    let explanation: string | null = null;
    const generated_text: string | null = null;
  
    if (currentIntervention !== 'translation') {
      const classifyRes = await fetchJSON('/api/classify', { word, sentence });
      label = classifyRes.label;
    } else {
      label = 'n/a'; // For translation, we don't classify, just use a placeholder
    }
    
    
  
    const word_index_original = originalWords.findIndex(w => w === word);
  
    if (action === 'synonym') {
      if (unreplaceable.has(word.toLowerCase())) {
        result_summary = 'Unreplaceable (grammar or stopword)';
        showToast('This word is already simple or grammatical. Try "E".');
  
        logWordClick({
          session_id: session_id ?? undefined,
          user_id: user_id ?? undefined,
          condition: currentIntervention,
          word,
          word_index_original,
          word_index_displayed: clicked_word_index,
          action,
          original_sentence: sentence,
          label,
          result_summary,
          replacement,
          explanation
        });
  
        resetFloatingUI();
        return;
      }
  
      if (label === 'person') {
        result_summary = `Unreplaceable (${label})`;
        showToast(`"${word}" is a name.`);
        logWordClick({
          session_id: session_id ?? undefined,
          user_id: user_id ?? undefined,
          condition: currentIntervention,
          word,
          word_index_original,
          word_index_displayed: clicked_word_index,
          action,
          original_sentence: sentence,
          label,
          result_summary
        });
        resetFloatingUI();
        return;
      }
      
      if (label === 'location') {
        const genericLocations = ['home', 'school', 'park', 'hospital', 'office', 'store', 'city', 'town', 'village', 'country', 'continent', 'world', 'café', 'library', 'restaurant', 'museum', 'theater', 'station', 'airport', 'beach', 'mountain', 'river', 'lake'];
        const isGeneric = genericLocations.includes(word.toLowerCase());
        const isProperNoun = /^[A-Z][a-z]+$/.test(word); // Capitalized
      
        if (!isGeneric && isProperNoun) {
          result_summary = `Unreplaceable (named location)`;
          showToast(`"${word}" is a location.`);
          logWordClick({
            session_id: session_id ?? undefined,
            user_id: user_id ?? undefined,
            condition: currentIntervention,
            word,
            word_index_original,
            word_index_displayed: clicked_word_index,
            action,
            original_sentence: sentence,
            label,
            result_summary
          });
          resetFloatingUI();
          return;
        }
      }
      
  
      
        const simplifyRes = await fetchJSON('/api/simplify', { word, sentence });
        replacement = simplifyRes.replacement;
      
  
      if (!replacement || replacement.toLowerCase() === word.toLowerCase()) {
        result_summary = 'No simpler alternative found, this is probably a stopword or grammatical word';
        showToast('No simpler alternative found, this is probably a stopword or grammatical word.');
  
        logWordClick({
          session_id: session_id ?? undefined,
          user_id: user_id ?? undefined,
          condition: currentIntervention,
          word,
          word_index_original,
          word_index_displayed: clicked_word_index,
          action,
          original_sentence: sentence,
          label,
          result_summary
        });
  
        resetFloatingUI();
        return;
      }
  
      //updateWord(clicked_word_index, replacement);
      setSimplifiedLabels(prev => ({ ...prev, [clicked_word_index]: replacement as string}));
      result_summary = 'Replaced successfully';
    }
  
    if (action === 'translation') {
        const nativeLang = localStorage.getItem('native_language') || 'your language';
        const translateRes = await fetchJSON('/api/translate', { word, sentence, target_language: nativeLang });
        const translated = translateRes.translated;
        setTranslatedLabels(prev => ({ ...prev, [clicked_word_index]: translated }));
        result_summary = "Translated successfully";
    }
    if (action === 'explanation' || action === 'explain_after_replace') {
      const defineRes = await fetchJSON('/api/define', { word });
      explanation = defineRes.definition;
      result_summary = 'Explanation provided';
      setModalContent(`Definition of "${word}":\n\n${explanation}`);
    }
    
    if (action === 'undo') {
      updateWord(clicked_word_index, originalWords[clicked_word_index]);
      setReplacedWordIndices(prev => prev.filter(i => i !== clicked_word_index));
      result_summary = 'Undo successful';
    }
    if (action === 'retry') {
      const simplifyRes = await fetchJSON('/api/simplify', { word, sentence });
      replacement = simplifyRes.replacement;
    
      if (!replacement || replacement.toLowerCase() === word.toLowerCase()) {
        result_summary = 'No simpler alternative found (retry)';
        showToast(result_summary);
        logWordClick({
          session_id: session_id ?? undefined,
          user_id: user_id ?? undefined,
          condition: currentIntervention,
          word,
          word_index_original,
          word_index_displayed: clicked_word_index,
          action,
          original_sentence: sentence,
          label,
          result_summary
        });
        resetFloatingUI();
        return;
      }
    
      updateWord(clicked_word_index, replacement);
      result_summary = 'Retry replacement successful';
    }
    
    
  /*
    // Add sentence continuation if applicable
    if (!unreplaceable.has(word.toLowerCase()) && label === 'neither') {
      const remaining = displayedWords.slice(clicked_word_index + 1).map(w => w.toLowerCase());
      const appearsLater = remaining.includes(word.toLowerCase());
  
      if (!appearsLater) {
        const remainingSentence = displayedWords.slice(clicked_word_index).join(' ');
        const trailingSentences = remainingSentence.split(/[.!?]/).filter(s => s.trim().length > 0);
  
        const continueRes = await fetchJSON('/api/continue', {
          context: displayedWords.join(' '),
          word,
          extend: trailingSentences.length <= 2
        });
  
        generated_text = continueRes.addition;
        const additionWords = generated_text.split(' ');
        setDisplayedWords(prev => [...prev, ...additionWords]);
        setOriginalWords(prev => [...prev, ...additionWords]);
      }
    }*/
  
    // Log final action with full metadata
    logWordClick({
      session_id: session_id ?? undefined,
      user_id: user_id ?? undefined,
      condition: currentIntervention,
      word,
      word_index_original,
      word_index_displayed: clicked_word_index,
      action: action as LogParams['action'],
      original_sentence: sentence,
      label,
      result_summary,
      replacement,
      explanation,
      generated_text
    });
  
    resetFloatingUI();
  };
  

  const fetchJSON = async (url: string, body: Record<string, unknown>) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return res.json();
  };

  const updateWord = (index: number, newWord: string) => {
    setDisplayedWords(prev => prev.map((w, i) => (i === index ? newWord : w)));
    setReplacedWordIndices(prev => [...prev, index]);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    resetFloatingUI();
    setTimeout(() => setToastMessage(null), 2500);
  };

  const resetFloatingUI = () => {
    setLoadingAction(null);
    setClickedWordIndex(null);
  };

  return (
    <div className="flex flex-col items-center justify-top min-h-screen p-4">
      {toastMessage && (
        <div className="fixed top-4 z-50 flex justify-center w-full pointer-events-none">
          <div
            onClick={() => setToastMessage(null)}
            className="bg-gray-300 text-black text-sm px-4 py-4 rounded shadow pointer-events-auto transition-transform duration-200 active:translate-y-[-10px] w-[311px] text-center"
          >
            {toastMessage}
          </div>
        </div>
      )}

      {showFinalSecondsMessage && (
        <div className="text-sm text-gray-500 mb-2 text-center">
          This reading session will be over in 5 seconds.
        </div>
      )}


      <div className="w-[311px] h-auto p-2 text-lg leading-7 relative mt-[52px]" ref={containerRef}>
          {displayedWords.map((word, i) => (
            <span
              key={i}
              className={`relative inline-block mx-1 cursor-pointer hover:text-blue-600 ${
                i === clicked_word_index ? 'bg-yellow-200' : ''
              } ${replacedWordIndices.includes(i) ? 'text-blue-800 italic' : 'text-black'}`}
              onClick={() => handleWordClick(i, word)}
              ref={el => void (wordRefs.current[i] = el)}
            >
              {simplifiedLabels[i] && (
                <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-xs text-purple-800 whitespace-nowrap italic">
                  {simplifiedLabels[i]}
                </span>
              )}
              {/* 🟦 Show translation as blue label if it exists */}
              {translatedLabels[i] && (
                <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-xs text-blue-600 whitespace-nowrap">
                {translatedLabels[i]}
                </span>
              )}
              {word}{' '}
            </span>
          ))}


          {clicked_word_index !== null && buttonPosition && (
            <div
              className="absolute z-50"
              style={{
                top: buttonPosition.top,
                left: buttonPosition.left,
              }}
            >
              <div className="flex flex-col gap-2 bg-gray-200 shadow-md rounded-lg p-1">
                {currentIntervention === 'synonym' && (
                  <button
                    onClick={() => handleAction('synonym')}
                    disabled={loadingAction !== null}
                    className="px-0 py-0 -top-4 rounded hover:bg-gray-100 text-left text-sm flex items-center gap-2"
                  >
                    {loadingAction === 'synonym' ? '⏳' : '🤏🏼 Simplify'}
                  </button>
                )}
                {currentIntervention === 'translation' && (
                  <button
                    onClick={() => handleAction('translation')}
                    disabled={loadingAction !== null}
                    className="px-0 py-0 -top-2 rounded hover:bg-gray-100 text-left text-sm flex items-center gap-2"
                  >
                    {loadingAction === 'translation' ? '⏳' : '🔁 Translate'}
                  </button>
                )}

                {currentIntervention === 'explanation' && (
                  <button
                    onClick={() => handleAction('explanation')}
                    disabled={loadingAction !== null}
                    className="px-3 py-0 -top-2 rounded hover:bg-gray-100 text-left text-sm flex items-center gap-2"
                  >
                    {loadingAction === 'explanation' ? '⏳' : '🧠 Explain'}
                  </button>
                )}
              </div>
            </div>
          )}

          

       
      </div>
      <div className="fixed bottom-0 left-0 w-full bg-white border-t p-4 flex justify-center z-40">
      <button
        onClick={() => {
          localStorage.setItem('nextStep', (currentStep + 1).toString());
          router.push('/conditionfeedback');
          
        }}
        className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
      >
        Next
      </button>
    </div>

    {/* Modal */}
    {modalContent && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white p-4 rounded-lg shadow-md max-w-sm text-sm relative m-4">
          <button
            onClick={() => setModalContent(null)}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          >
            ✖
          </button>
          <pre className="whitespace-pre-wrap">{modalContent}</pre>
        </div>
      </div>
    )}
  </div>
);
}