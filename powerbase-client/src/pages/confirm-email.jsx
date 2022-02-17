import React, { useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';

import { Page } from '@components/layout/Page';
import { Logo } from '@components/ui/Logo';
import { useAuthUser } from '@models/AuthUser';
import { SUPPORT_EMAIL } from '@lib/constants';

export function ConfirmEmailNoticePage() {
  const history = useHistory();
  const { authUser } = useAuthUser();

  useEffect(() => {
    if (localStorage.signedIn) history.push('/');
  }, [authUser]);

  return (
    <Page title="Confirm Your Email" navbar={false} className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Logo className="mx-auto h-12 w-auto" />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Confirm your Email</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <p className="my-4 text-gray-900 text-base">
            Thank you for registering.
          </p>
          <p className="my-4 text-gray-900 text-base">
            To get started with your account, please check the message we&apos;ve sent to your email and confirm your email address.
          </p>

          <p className="my-4 text-gray-900 text-base">
            If you have any questions, feel free to&nbsp;
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-indigo-600">email us</a>.
          </p>
        </div>

        <div className="mt-4 flex justify-between">
          <Link to="/login" className="text-sm text-indigo-600 hover:text-indigo-500">
            Login instead
          </Link>
          <Link to="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-500">
            Forgot your password?
          </Link>
        </div>
      </div>
    </Page>
  );
}
