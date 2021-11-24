import React from 'react';
import { Redirect, useParams } from 'react-router-dom';

import { BaseProvider, useBase } from '@models/Base';
import { Loader } from '@components/ui/Loader';
import { BaseTablesProvider, useBaseTables } from '@models/BaseTables';

function Base() {
  const { data: base, error } = useBase();
  const { data: tables } = useBaseTables();

  if (base) {
    if (base.defaultTable) {
      return <Redirect to={`/base/${base.id}/table/${base.defaultTable.id}?view=${base.defaultTable.defaultViewId}`} />;
    }

    if (tables?.length) {
      const [firstTable] = tables;

      return <Redirect to={`/base/${base.id}/table/${firstTable.id}?${firstTable.defaultViewId ? `view=${firstTable.defaultViewId}` : ''}`} />;
    }
  }

  if (error) {
    return <Redirect to="/404" />;
  }

  return <Loader className="h-screen" />;
}

export function BasePage() {
  const { id } = useParams();

  return (
    <BaseProvider id={id}>
      <BaseTablesProvider>
        <Base />
      </BaseTablesProvider>
    </BaseProvider>
  );
}
