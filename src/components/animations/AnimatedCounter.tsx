import { useCountUp } from '@/hooks/useCountUp';

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  className?: string;
}

export function AnimatedCounter({
  end,
  duration = 2000,
  suffix = '',
  className = '',
}: AnimatedCounterProps) {
  const { count, ref } = useCountUp({ end, duration });

  return (
    <div ref={ref} className={className}>
      {count.toLocaleString()}{suffix}
    </div>
  );
}
