import React from 'react';
import cn from 'classnames';

import { useBase } from '@models/Base';
import { getDatabaseCredentials } from '@lib/api/databases';
import { useData } from '@lib/hooks/useData';
import { useBaseUser } from '@models/BaseUser';
import { decrypt } from '@lib/helpers/crypto';

import { ErrorAlert } from '@components/ui/ErrorAlert';
import { Button } from '@components/ui/Button';
import { Loader } from '@components/ui/Loader';
import { PERMISSIONS } from '@lib/constants/permissions';

export function BaseCredentials() {
  const { data: base } = useBase();
  const { baseUser } = useBaseUser();
  const {
    data, status, error, dispatch,
  } = useData();

  const canManageBase = baseUser?.can(PERMISSIONS.ManageBase);

  const handleViewCredentials = async () => {
    dispatch.pending();

    if (!canManageBase) {
      dispatch.rejected('User is unauthorized to view the credentials.');
      return;
    }

    try {
      const response = await getDatabaseCredentials({ id: base.id });
      dispatch.resolved(response.connectionString);
    } catch (err) {
      dispatch.rejected(err.response.data.exception || err.response.data.error);
    }
  };

  if (!canManageBase) return null;

  return (
    <div className="my-16">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Connection String
        </h3>
        <Button
          type="button"
          onClick={handleViewCredentials}
          loading={status === 'pending'}
          className="py-2 px-4 flex justify-center border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-700 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {data?.length ? 'Refresh' : 'View Credentials'}
        </Button>
      </div>
      {error && <ErrorAlert errors={error} />}
      {status === 'pending' && <Loader />}
      <p className={cn('text-base my-1', data?.length > 0 ? 'text-gray-900' : 'text-gray-500')}>
        {data?.length > 0 ? decrypt(data, base.id) : '*'.repeat(30)}
      </p>
    </div>
  );
}
