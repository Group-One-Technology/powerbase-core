import { useViewFieldState } from '@models/view/ViewFieldState';

export function useRowAdd({ setRecords }) {
  const { initialFields } = useViewFieldState();

  const onRowAppended = () => {
    const record = initialFields.reduce((obj, item) => ({ ...obj, [item.name]: undefined }), { new: true });
    setRecords((records) => [...records, record]); // * Store value somewhere or this will be gone on mutate -> use useAddRecord
  };

  return { onRowAppended };
}
