/**
 * useIsMounted — returns a ref that is true when the component is mounted.
 * Useful for preventing state updates after unmount.
 */

import { useEffect, useRef } from 'react';

export function useIsMounted() {
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  return isMounted;
}
