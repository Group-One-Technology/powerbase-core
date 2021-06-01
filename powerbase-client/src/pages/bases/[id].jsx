import React from 'react';
import { Redirect, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { BaseTablesProvider, useBaseTables } from '@models/BaseTables';

function Base({ id }) {
  const { data: tables } = useBaseTables();

  if (tables) {
    return <Redirect to={`/bases/${id}/tables/${tables[0].id}`} />;
  }

  return <div>Loading...</div>;
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
