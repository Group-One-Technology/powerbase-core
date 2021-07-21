import PropTypes from 'prop-types';
import { IId } from './common';

export const ITable = PropTypes.shape({
  id: IId.isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string,
  defaultViewId: IId.isRequired,
  page_size: PropTypes.number.isRequired,
  createdAt: PropTypes.string.isRequired,
  updatedAt: PropTypes.string.isRequired,
  databaseId: IId.isRequired,
});
