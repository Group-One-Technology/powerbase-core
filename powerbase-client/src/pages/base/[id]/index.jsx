import React from 'react';
import { Redirect, useParams } from 'react-router-dom';

import { BaseProvider, useBase } from '@models/Base';
import { Loader } from '@components/ui/Loader';

function Base() {
  const { data: base, error } = useBase();

  if (base) {
    return <Redirect to={`/base/${base.id}/table/${base.defaultTable.id}?view=${base.defaultTable.defaultViewId}`} />;
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
      <Base />
    </BaseProvider>
  );
}
