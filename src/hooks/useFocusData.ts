import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

/**
 * Load async data and re-load every time the screen regains focus, so edits made
 * on other screens (new recipe, new log entry) show up immediately.
 */
export function useFocusData<T>(loader: () => Promise<T>, initial: T) {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const result = await loader();
      setData(result);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        setLoading(true);
        try {
          const result = await loader();
          if (active) setData(result);
        } finally {
          if (active) setLoading(false);
        }
      })();
      return () => {
        active = false;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  return { data, loading, reload, setData };
}
