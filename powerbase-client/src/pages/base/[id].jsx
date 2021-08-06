import React from 'react';
import { Redirect, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';

import { BaseTablesProvider, useBaseTables } from '@models/BaseTables';
import { Loader } from '@components/ui/Loader';

function Base({ id }) {
  const { data: tables } = useBaseTables();

  if (tables?.length) {
    const [firstTable] = tables;

    return <Redirect to={`/base/${id}/table/${firstTable.id}?${firstTable.defaultViewId ? `view=${firstTable.defaultViewId}` : ''}`} />;
  }

  return <Loader className="h-screen" />;
}

Base.propTypes = {
  id: PropTypes.string.isRequired,
};

export function BasePage() {
  const { id } = useParams();

  return (
    <BaseTablesProvider id={id}>
      <Base id={id} />
    </BaseTablesProvider>
  );
}
