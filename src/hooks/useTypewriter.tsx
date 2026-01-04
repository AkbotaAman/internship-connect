import { useState, useEffect, useCallback } from 'react';

interface UseTypewriterProps {
  words: string[];
  typeSpeed?: number;
  deleteSpeed?: number;
  delayBetweenWords?: number;
  loop?: boolean;
}

export function useTypewriter({
  words,
  typeSpeed = 100,
  deleteSpeed = 50,
  delayBetweenWords = 2000,
  loop = true,
}: UseTypewriterProps) {
  const [text, setText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);

  const tick = useCallback(() => {
    const currentWord = words[wordIndex];
    
    if (isWaiting) return;

    if (isDeleting) {
      setText(currentWord.substring(0, text.length - 1));
      if (text.length === 0) {
        setIsDeleting(false);
        setWordIndex((prev) => (prev + 1) % words.length);
      }
    } else {
      setText(currentWord.substring(0, text.length + 1));
      if (text.length === currentWord.length) {
        setIsWaiting(true);
        setTimeout(() => {
          setIsWaiting(false);
          if (loop || wordIndex < words.length - 1) {
            setIsDeleting(true);
          }
        }, delayBetweenWords);
      }
    }
  }, [text, wordIndex, isDeleting, isWaiting, words, delayBetweenWords, loop]);

  useEffect(() => {
    const speed = isDeleting ? deleteSpeed : typeSpeed;
    const timer = setTimeout(tick, speed);
    return () => clearTimeout(timer);
  }, [tick, isDeleting, deleteSpeed, typeSpeed]);

  return { text, isDeleting };
}
