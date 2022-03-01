import { useState } from 'react';
import { searchFieldByName } from '@lib/api/fields';
import debounce from 'lodash.debounce';
import { useAsync } from 'react-async-hook';
import { toSnakeCase } from '@lib/helpers/text/textTypeFormatters';
import useConstant from '../useConstant';

const DEBOUNCED_TIMEOUT = 100; // 100ms

export const useDebouncedInput = (setNameExists, id) => {
  const [fieldName, setFieldName] = useState('');
  const searchPowerbase = async (name) => {
    try {
      const { data } = await searchFieldByName({ id, name });
      setNameExists(!!data?.id);
    } catch (error) {
      setNameExists(false);
    }
  };

  const debouncedSearchPowerbase = useConstant(() => debounce(searchPowerbase, DEBOUNCED_TIMEOUT));

  const search = useAsync(async () => {
    if (fieldName.length === 0) {
      return [];
    }
    return debouncedSearchPowerbase(toSnakeCase(fieldName.toLowerCase()));
  }, [fieldName]);

  return {
    fieldName,
    setFieldName,
    search,
  };
};
