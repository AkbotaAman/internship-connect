import { useTypewriter } from '@/hooks/useTypewriter';

interface TypewriterTextProps {
  words: string[];
  className?: string;
  typeSpeed?: number;
  deleteSpeed?: number;
  delayBetweenWords?: number;
}

export function TypewriterText({
  words,
  className = '',
  typeSpeed = 100,
  deleteSpeed = 50,
  delayBetweenWords = 2000,
}: TypewriterTextProps) {
  const { text } = useTypewriter({
    words,
    typeSpeed,
    deleteSpeed,
    delayBetweenWords,
  });

  return (
    <span className={className}>
      {text}
      <span className="inline-block w-[3px] h-[1em] bg-current ml-1 animate-blink align-middle" />
    </span>
  );
}
