import { useQueryState } from 'nuqs';

export function useURLSearchParams(key: string) {
  const [search, setSearch] = useQueryState(key, {
    defaultValue: '',
    parse: (value) => value || '',
    history: 'push',
  });

  return {
    search,
    setSearch,
  };
}
