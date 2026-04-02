import { useState, useEffect, useCallback, useRef } from 'react';

export function useApi<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    fetcher()
      .then(d => { if (mounted.current) setData(d); })
      .catch((e: Error) => { if (mounted.current) setError(e.name === 'AbortError' ? 'Request timed out' : e.message); })
      .finally(() => { clearTimeout(timeout); if (mounted.current) setLoading(false); });

    return () => { controller.abort(); clearTimeout(timeout); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, refresh: load };
}
