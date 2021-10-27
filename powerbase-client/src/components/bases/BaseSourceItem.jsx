import React from 'react';
import { Link } from 'react-router-dom';

import { IBaseSource } from '@lib/propTypes/base';

export function BaseSourceItem({ source }) {
  return (
    <Link to={source.href}>
      <div className="h-full flex flex-col px-4 py-8">
        <h2 className="mt-4 text-gray-900 text-xl font-bold break-words" style={{ hyphens: 'auto' }}>
          {source.pretext && (
            <span className="block text-xs font-normal text-gray-500">{source.pretext}</span>
          )}
          {source.name}
        </h2>
        {source.description && (
          <p className="text-xs text-gray-500">{source.description}</p>
        )}
        {source.footnote && (
          <p className="mt-auto text-xs text-gray-500 px-4">{source.footnote}</p>
        )}
      </div>
    </Link>
  );
}

BaseSourceItem.propTypes = {
  source: IBaseSource.isRequired,
};
