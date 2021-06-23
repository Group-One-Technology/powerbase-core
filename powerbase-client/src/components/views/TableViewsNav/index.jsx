/* eslint-disable no-shadow */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Fragment } from 'react';
import {
  SearchIcon,
  FilterIcon,
  SwitchVerticalIcon,
  ShareIcon,
} from '@heroicons/react/outline';
import PropTypes from 'prop-types';

import { IId } from '@lib/propTypes/common';
import { IView } from '@lib/propTypes/view';
import { TableViewsSelect } from './TableViewsSelect';

export function TableViewsNav({
  baseId,
  tableId,
  viewId,
  views,
}) {
  if (!views || !views?.length) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 border-solid border-b-2 border-gray-200 h-11" />
    );
  }

  const currentView = viewId
    ? views?.find((item) => item.id.toString() === viewId.toString())
    : views[0];

  return (
    <>
      <div className="w-full px-4 sm:px-6 lg:px-8 border-solid border-b-2 border-gray-200 text-gray-700">
        <div className="relative flex  py-1.5 gap-x-2">
          <div className="flex-1 flex items-center">
            <TableViewsSelect
              baseId={baseId}
              tableId={tableId}
              currentView={currentView}
              views={views}
            />
          </div>
          <div className="flex-1 flex items-center justify-center gap-x-2">
            <button
              type="button"
              className="inline-flex items-center px-1.5 py-1 border border-transparent text-xs font-medium rounded text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <span className="sr-only">Filter fields</span>
              <FilterIcon className="block h-4 w-4" />
            </button>
            <button
              type="button"
              className="inline-flex items-center px-1.5 py-1 border border-transparent text-xs font-medium rounded text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <span className="sr-only">Sort fields</span>
              <SwitchVerticalIcon className="block h-4 w-4" />
            </button>
            <button
              type="button"
              className="inline-flex items-center px-1.5 py-1 border border-transparent text-xs font-medium rounded text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <span className="sr-only">Share this view</span>
              <ShareIcon className="block h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-end">
            <button
              type="button"
              className="inline-flex items-center px-1.5 py-1 border border-transparent text-xs font-medium rounded text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <span className="sr-only">Search</span>
              <SearchIcon className="block h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

TableViewsNav.propTypes = {
  baseId: IId.isRequired,
  viewId: IId.isRequired,
  tableId: IId.isRequired,
  views: PropTypes.arrayOf(IView),
};
