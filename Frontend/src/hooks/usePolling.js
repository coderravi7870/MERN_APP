import { useEffect, useRef } from 'react';

export function usePolling(callback, delay) {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    
    tick(); // Run immediately
    
    const id = setInterval(tick, delay);
    return () => clearInterval(id);
  }, [delay]);
}