import { useEffect, useState } from 'react';

/**
 * Hook that returns a progress percentage (0-100) for the current ride.
 * A new ride gets its own randomised timeline. For the demo we simply
 * increment by a random step every few seconds. When progress hits 100 the
 * ride is considered completed.  Production apps should instead subscribe to
 * real ride-tracking events coming from the backend.
 */
export default function useRideProgress(triggerKey: string | null): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!triggerKey) return; // No ride yet

    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        // Each tick add 5-20% randomly.
        const next = prev + Math.floor(Math.random() * 16) + 5;
        return next > 100 ? 100 : next;
      });
    }, 4_000 + Math.random() * 2_000); // every 4-6s

    return () => clearInterval(interval);
  }, [triggerKey]);

  return progress;
}
