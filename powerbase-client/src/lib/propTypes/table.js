import PropTypes from 'prop-types';
import { IId } from './common';

export const ITable = PropTypes.shape({
  id: IId.isRequired,
  name: PropTypes.string.isRequired,
  alias: PropTypes.string,
  description: PropTypes.string,
  defaultViewId: IId,
  pageSize: PropTypes.number.isRequired,
  createdAt: PropTypes.string.isRequired,
  updatedAt: PropTypes.string.isRequired,
  databaseId: IId.isRequired,
});
