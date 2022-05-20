import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import cn from 'classnames';
import { PlusCircleIcon } from '@heroicons/react/outline';

import { BasesProvider, useBases } from '@models/Bases';
import { useSharedBases } from '@models/SharedBases';
import { useGeneralSettings } from '@models/GeneralSettings';

import { Page } from '@components/layout/Page';
import { PageHeader } from '@components/layout/PageHeader';
import { PageContent } from '@components/layout/PageContent';
import { EmptyBase } from '@components/bases/EmptyBase';
import { BaseItem } from '@components/bases/BaseItem';
import { BaseErrorModal } from '@components/bases/BaseErrorModal';
import { Loader } from '@components/ui/Loader';

function BasesContentPage() {
  const { data: bases, mutate: mutateBases } = useBases();
  const { data: sharedBases, mutate: mutateSharedBases } = useSharedBases();
  const { data: generalSettings } = useGeneralSettings();
  const sampleDatabaseId = generalSettings?.sampleDatabase?.id;

  const [errorModal, setErrorModal] = useState({
    base: undefined,
    mutate: undefined,
    open: false,
  });

  const handleErrorClick = (value, mutate) => {
    setErrorModal({
      base: value,
      mutate,
      open: true,
    });
  };

  return (
    <Page authOnly>
      <div className="py-10">
        {sharedBases?.length !== 0 && <PageHeader title="Bases" />}
        <PageContent>
          {(bases?.length > 0 || sharedBases?.length > 0) && (
            <ul
              className={cn(
                'flex flex-col sm:flex-row flex-wrap gap-6',
                sharedBases?.length === 0 ? 'mt-20 px-4 justify-center' : 'mt-4',
              )}
            >
              {bases?.map((base) => (
                <li
                  key={base.id}
                  className="sm:w-40 sm:h-40 text-center bg-white rounded-lg shadow divide-y divide-gray-200"
                >
                  <BaseItem
                    base={base}
                    handleErrorClick={handleErrorClick}
                    mutate={mutateBases}
                    sampleDatabaseId={sampleDatabaseId}
                  />
                </li>
              ))}
              <li className="sm:w-40 sm:h-40 text-center bg-gray-200 rounded-lg shadow divide-y divide-gray-200">
                <Link to="/base/create" className="h-full">
                  <div className="h-full flex flex-col p-2 items-center justify-center">
                    <PlusCircleIcon className="mt-3 h-12 w-12 text-gray-500" />
                    <p className="mt-2 text-sm text-gray-500">
                      Add New
                    </p>
                  </div>
                </Link>
              </li>
            </ul>
          )}

          {sharedBases?.length > 0 && (
            <>
              <h2 className="mt-8 mb-4 text-2xl font-bold leading-tight text-gray-900 pb-4">
                Shared Bases
              </h2>
              <ul className="mt-4 flex flex-col sm:flex-row flex-wrap gap-6">
                {sharedBases.map((base) => {
                  const similarSharedBases = sharedBases.filter((item) => item.name === base.name);
                  const similarBases = bases?.filter((item) => item.name === base.name);
                  const hasDuplicateName = similarSharedBases.length > 1 || similarBases?.length > 0;

                  return (
                    <li
                      key={base.id}
                      className="sm:w-40 sm:h-40 text-center bg-white rounded-lg shadow divide-y divide-gray-200"
                    >
                      <BaseItem
                        base={base}
                        handleErrorClick={handleErrorClick}
                        mutate={mutateSharedBases}
                        showOwner={hasDuplicateName}
                        sampleDatabaseId={sampleDatabaseId}
                      />
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          {(bases == null && sharedBases == null) && <Loader className="h-80" />}
          {(bases?.length === 0 && sharedBases?.length === 0) && <EmptyBase />}
          {(errorModal.base && errorModal.base.logs?.errors) && (
            <BaseErrorModal
              open={errorModal.open}
              setOpen={(value) => setErrorModal((prevVal) => ({ ...prevVal, open: value }))}
              base={errorModal.base}
              mutateBases={errorModal.mutate}
            />
          )}
        </PageContent>
      </div>
    </Page>
  );
}

export function BasesPage() {
  return (
    <BasesProvider>
      <BasesContentPage />
    </BasesProvider>
  );
}
