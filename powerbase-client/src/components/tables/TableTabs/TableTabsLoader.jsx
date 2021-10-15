import React from 'react';

export function TableTabsLoader() {
  return (
    <>
      <span className="sr-only">Loading the database&apos;s tables.</span>
      <div className="flex items-center py-2">
        <span className="h-5 bg-white bg-opacity-40 rounded w-36 animate-pulse" />
      </div>
      <div className="flex items-center py-2">
        <span className="h-5 bg-white bg-opacity-40 rounded w-60 animate-pulse" />
      </div>
      <div className="flex items-center py-2">
        <span className="h-5 bg-white bg-opacity-40 rounded w-36 animate-pulse" />
      </div>
    </>
  );
}
