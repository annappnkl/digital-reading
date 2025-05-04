// Optimized reading.tsx file
import { useState, useRef, useEffect } from 'react';
import { logWordClick } from '../lib/log';

const text = "Living in suburban North London was nothing but an act of pragmatism for my parents. Whenever I asked them why they chose to leave East London for the suburbs when I was ten, they would refer to functionality: it was a bit safer, you could buy a bit more space, it was near the city, it was near lots of motorways and close to schools. They talked about setting up their life in Pinner as if they had been looking for a hotel that was close to the airport for an early flight - convenient, anonymous, fuss-free, nothing special but it got the job done. Nothing about where my parents lived brought them any sensory pleasure or cause for relish not the landscape, nor the history of the place, not the parks, the architecture, the community or culture. They lived in the suburbs because it was close to things. They had built their home and therefore entire life around convenience.\n\n When we were together, Joe often used his northernness in argu - ments against me, as a way of proving he was more real than I was; more down to earth and therefore more likely to be right. It was one of my least favourite things about him - the way he lazily outsourced his integrity to Yorkshire, so that romantic implications of miners and moors would do all the hard work for him. In the early stages of our relationship, he used to make me feel like we had grown up in separate galaxies because his mum had worked as a hairdresser in Sheffield and mine was a receptionist in Harrow. The first time he took me home to his parents’ house - a modest three-bed in a suburb of Sheffield - I realized just what a lie I’d been told. If I hadn’t known I was in Yorkshire, I would have sworn we were driving around the pebbledash-fronted-leaded-window gap between the end of London and the beginning of Hertfordshire where I’d spent my adolescence. Joe’s cul-de- sac was the same as mine, the houses were all the same, his fridge was full of the same fruit-corner yogurts and ready-to-bake garlic bread. He’d had a bike just like mine, to spend his teenage weekends going up and down streets of identical red-roof houses just like I did. He was taken to PizzaExpress for his birthday like I was. The secret was out. “No more making out that we’ve had completely different upbringings, Joe,” I said to him on the train home. “No more pretending you belong in a song written by Jarvis Cocker about being in love with a woman in a tabard. You no more belong in that song than I belong in a Chas and Dave one. We grew up in matching suburbs.”\n\nIn recent years, I’d found myself craving the familiarity of home. The high streets I knew, with their high density of dentists, hair-dressers and bookies, and total lack of independent coffee shops. The long walk from the station to my parents’ house. The women with matching long bobs, the balding men, the teenagers in hoodies. The absence of individualism; the peaceful acquiescence to mundanity. Young adulthood had quickly turned into just plain adulthood - with its daily list of choices to confirm who I was, how I voted, who my broadband provider was—and returning to the scene of my teenage life for an afternoon felt like a brief holiday back in time. When I was in Pinner, I could be seventeen again, just for a day. I could pretend that my world was myopic and my choices meaningless and the pos-sibilities that were ahead of me were wide open and boundless.\n\nMum answered the door like she always answered the door - in a way that demonstrably made the point that her life was very busy. She did an apologetic wonky smile as she opened it to me, portable landline pressed up to her ear on her shoulder. “Sorry,” she mouthed, and rolled her eyes. ..."; // Full text

export default function Home() {
  const [clickedWordIndex, setClickedWordIndex] = useState<number | null>(null);
  const [buttonPosition, setButtonPosition] = useState<{ top: number; left: number } | null>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sentence = text;
  const words = sentence.split(' ');
  const [displayedWords, setDisplayedWords] = useState(words);
  const [originalWords, setOriginalWords] = useState(words);
  const [loadingAction, setLoadingAction] = useState<'synonym' | 'explanation' | null>(null);
  const [modalContent, setModalContent] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [replacedWordIndices, setReplacedWordIndices] = useState<number[]>([]);
  const [floatingMenuMode, setFloatingMenuMode] = useState<'default' | 'replaced'>('default');
  
    const [userId] = useState(() => {
      return 'user-' + new Date().toISOString();
    });
  
    const [sessionId] = useState(() => {
      return 'session-' + Date.now().toString(36) + Math.random().toString(36).slice(2);
    });
  
    useEffect(() => {
      localStorage.setItem('userId', userId);
      localStorage.setItem('sessionId', sessionId);
    }, [userId, sessionId]);
  

  const unreplaceable = new Set([
    'i','you','he','she','they','we','it','us','me','him','her','them','my','your','his','its','our','their',
    'this','that','these','those','who','what','where','when','why','how','which','whose',
    'a','an','the','of','to','as','and','or','but','in','on','at','by',
    ...'north,south,east,west'.split(','), ...'-/,(),.!?:;"“”‘’…'.split(''),
    ...'1,2,3,4,5,6,7,8,9,0'.split(','), ...'one,two,three,four,five,six,seven,eight,nine,ten'.split(',')
  ]);

  const handleWordClick = async (index: number, word: string) => {
    setClickedWordIndex(index);
    setFloatingMenuMode(replacedWordIndices.includes(index) ? 'replaced' : 'default');
    const el = wordRefs.current[index];
    const container = containerRef.current;
    if (el && container) {
      const { top, left } = el.getBoundingClientRect();
      const { top: cTop, left: cLeft } = container.getBoundingClientRect();
      setButtonPosition({ top: top - cTop - 50, left: left - cLeft });
    }
  };

  const handleAction = async (action: 'synonym' | 'explanation') => {
    if (clickedWordIndex === null) return;
    setLoadingAction(action);
    const word = displayedWords[clickedWordIndex];
  
    let label = '';
    let resultSummary = '';
    let replacement: string | null = null;
    let explanation: string | null = null;
    let generatedText: string | null = null;
  
    const classifyRes = await fetchJSON('/api/classify', { word, sentence });
    label = classifyRes.label;
  
    if (action === 'synonym') {
      if (unreplaceable.has(word.toLowerCase())) {
        resultSummary = 'Unreplaceable (grammar or stopword)';
        showToast('This word is already simple or grammatical. Try "E".');
        logWordClick({ userId, sessionId, page: 1, word, wordIndex: clickedWordIndex, action, originalSentence: sentence, label, resultSummary });
        resetFloatingUI();
        return;
      }
  
      if (['person', 'location'].includes(label)) {
        resultSummary = `Unreplaceable (${label})`;
        showToast(`"${word}" is a ${label}. Try "E".`);
        logWordClick({ userId, sessionId, page: 1, word, wordIndex: clickedWordIndex, action, originalSentence: sentence, label, resultSummary });
        resetFloatingUI();
        return;
      }
  
      const simplifyRes = await fetchJSON('/api/simplify', { word, sentence });
      replacement = simplifyRes.replacement;
  
      if (!replacement || replacement.toLowerCase() === word.toLowerCase()) {
        resultSummary = 'No simpler alternative found';
        showToast('No simpler alternative found. Try "E".');
        logWordClick({ userId, sessionId, page: 1, word, wordIndex: clickedWordIndex, action, originalSentence: sentence, label, resultSummary });
        resetFloatingUI();
        return;
      }
  
      updateWord(clickedWordIndex, replacement);
      resultSummary = 'Replaced successfully';
    }
  
    if (action === 'explanation') {
      const defineRes = await fetchJSON('/api/define', { word });
      explanation = defineRes.definition;
      resultSummary = 'Explanation provided';
      setModalContent(`Definition of "${word}":\n\n${explanation}`);
    }
  
    if (!unreplaceable.has(word.toLowerCase()) && label === 'neither') {
      const remaining = displayedWords.slice(clickedWordIndex + 1).map(w => w.toLowerCase());
      const appearsLater = remaining.includes(word.toLowerCase());
  
      if (!appearsLater) {
        const remainingSentence = displayedWords.slice(clickedWordIndex).join(' ');
        const trailingSentences = remainingSentence.split(/[.!?]/).filter(s => s.trim().length > 0);
  
        const continueRes = await fetchJSON('/api/continue', {
          context: displayedWords.join(' '),
          word,
          extend: trailingSentences.length <= 2
        });
  
        generatedText = continueRes.addition;
        const additionWords = generatedText.split(' ');
        setDisplayedWords(prev => [...prev, ...additionWords]);
        setOriginalWords(prev => [...prev, ...additionWords]);
      }
    }
  
    logWordClick({
      userId,
      sessionId,
      page: 1,
      word,
      wordIndex: clickedWordIndex,
      action,
      originalSentence: sentence,
      label,
      resultSummary,
      replacement,
      explanation,
      generatedText
    });
  
    resetFloatingUI();
  };
  

  const fetchJSON = async (url: string, body: any) => {
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
    setButtonPosition(null);
  };

  const handleUndo = () => {
    if (clickedWordIndex === null) return;
    updateWord(clickedWordIndex, originalWords[clickedWordIndex]);
    setReplacedWordIndices(prev => prev.filter(i => i !== clickedWordIndex));
    resetFloatingUI();
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

      <div className="w-[311px] h-auto p-2 text-lg leading-7 relative" ref={containerRef}>
        {displayedWords.map((word, i) => (
          <span
            key={i}
            className={`cursor-pointer hover:text-blue-600 ${
              i === clickedWordIndex ? 'bg-yellow-200' : ''
            } ${
              replacedWordIndices.includes(i) ? 'text-blue-800 italic' : 'text-black'
            }`}
            onClick={() => handleWordClick(i, word)}
            ref={el => (wordRefs.current[i] = el)}
          >
            {word}{' '}
          </span>
        ))}

        {clickedWordIndex !== null && buttonPosition && (
          <div
            className="absolute z-10"
            style={{
              top: buttonPosition.top - (floatingMenuMode === 'replaced' ? 80 : 0),
              left: buttonPosition.left,
            }}
          >
            {floatingMenuMode === 'default' ? (
              <div className="flex gap-1.5">
                <button
                  onClick={() => handleAction('synonym')}
                  disabled={loadingAction !== null}
                  className="w-10 h-10 rounded-full bg-gray-200 shadow-md text-sm font-bold flex items-center justify-center"
                >
                  {loadingAction === 'synonym' ? '⏳' : 'S'}
                </button>
                <button
                  onClick={() => handleAction('explanation')}
                  disabled={loadingAction !== null}
                  className="w-10 h-10 rounded-full bg-gray-200 shadow-md text-sm font-bold flex items-center justify-center"
                >
                  {loadingAction === 'explanation' ? '⏳' : 'E'}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 bg-gray-200 shadow-md rounded-lg p-1">
                <button onClick={handleUndo} className="px-3 py-1 rounded hover:bg-gray-100 text-left text-sm">
                  🔙 Undo
                </button>
                <button
                  onClick={() => handleAction('synonym')}
                  disabled={loadingAction !== null}
                  className="px-3 py-1 rounded hover:bg-gray-100 text-left text-sm flex items-center gap-2"
                >
                  {loadingAction === 'synonym' ? '⏳' : '🔁'} Try another
                </button>
                <button
                  onClick={() => handleAction('explanation')}
                  disabled={loadingAction !== null}
                  className="px-3 py-1 rounded hover:bg-gray-100 text-left text-sm flex items-center gap-2"
                >
                  {loadingAction === 'explanation' ? '⏳' : '🧠'} Explain
                </button>
              </div>
            )}
          </div>
        )}
      </div>

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
