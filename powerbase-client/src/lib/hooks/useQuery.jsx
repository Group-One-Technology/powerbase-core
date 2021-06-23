import { useLocation } from 'react-router-dom';

/**
 * A hook to get the query params.
 *
 * @returns URLSearchParams
 * Usage:
 *  const query = useQuery();
 *  const viewId = query.get('view');
 */
export function useQuery() {
  return new URLSearchParams(useLocation().search);
}
