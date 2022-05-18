import React from 'react';
import cn from 'classnames';

import { useAuthUser } from '@models/AuthUser';
import { useData } from '@lib/hooks/useData';
import { sendTestEmail } from '@lib/api/settings';

export function TestEmailButton() {
  const { authUser } = useAuthUser();
  const { data, status, dispatch } = useData();

  if (!authUser) return null;

  const handleSendTestEmail = async (evt) => {
    evt.preventDefault();
    dispatch.pending();

    try {
      await sendTestEmail();
      dispatch.resolved('Successfully sent the test email! Please check your email to verify it.');
    } catch (err) {
      dispatch.rejected(err.response.data.exception || err.response.data.error, true);
    }
  };

  return (
    <div className="my-2">
      <button
        type="button"
        className={cn(
          'my-2 inline-flex items-center justify-center border border-transparent font-medium px-6 py-2 text-base rounded-md shadow-sm',
          status === 'pending'
            ? 'bg-gray-300 text-gray-900'
            : 'text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 border border-gray-300',
        )}
        onClick={handleSendTestEmail}
        disabled={status === 'pending'}
      >
        Send Test Email
      </button>
      {status === 'resolved' && (
        <p className="my-1 text-sm text-green-500">
          {data}
        </p>
      )}
    </div>
  );
}
