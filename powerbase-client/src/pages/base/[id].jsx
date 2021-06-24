import React from 'react';
import { Redirect, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';

import { BaseTablesProvider, useBaseTables } from '@models/BaseTables';
import { TableViewsProvider, useTableViews } from '@models/TableViews';
import { IId } from '@lib/propTypes/common';
import { Loader } from '@components/ui/Loader';

function TableView({ id, tableId }) {
  const { data: views } = useTableViews();

  if (views) {
    return <Redirect to={`/base/${id}/table/${tableId}?view=${views[0].id}`} />;
  }

  return <Loader className="h-screen" />;
}

TableView.propTypes = {
  id: IId.isRequired,
  tableId: IId.isRequired,
};

function Base({ id }) {
  const { data: tables } = useBaseTables();

  if (tables) {
    const tableId = tables[0].id;

    return (
      <TableViewsProvider id={tableId}>
        <TableView id={id} tableId={tableId} />
      </TableViewsProvider>
    );
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
