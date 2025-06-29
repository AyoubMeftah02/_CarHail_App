import { useState, useEffect } from 'react';

// Possible ride workflow states – extend as needed
export type RideStatus = 'searching' | 'inProgress' | 'completed' | 'cancelled';

/**
 * Subscribe to real-time ride-status updates coming from the backend.
 * In production you would connect to your backend via WebSocket / SSE and
 * listen for messages like `{ id: string; status: RideStatus }`.
 *
 * For the purposes of this demo we simply simulate ride completion 30 s after
 * hook initialisation. Replace the `setTimeout` block with your real event
 * handler.
 */
export default function useRideStatus(rideId: string | null): RideStatus {
  const [status, setStatus] = useState<RideStatus>('inProgress');

  useEffect(() => {
    if (!rideId) return;

    // --- Demo implementation -------------------------------------------------
    // Simulate the driver finishing the ride after 30 seconds.
    const timeoutId = setTimeout(() => {
      setStatus('completed');
    }, 30_000);

    // -------------------------------------------------------------------------
    // Example production implementation using WebSocket:
    // const ws = new WebSocket(`wss://api.example.com/rides/${rideId}`);
    // ws.onmessage = (event) => {
    //   const { status: newStatus } = JSON.parse(event.data);
    //   setStatus(newStatus);
    // };
    // return () => ws.close();
    // -------------------------------------------------------------------------

    return () => clearTimeout(timeoutId);
  }, [rideId]);

  return status;
}
