import React, { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';

import { useAuthUser } from '@models/AuthUser';
import { useQuery } from '@lib/hooks/useQuery';
import { confirmEmail } from '@lib/api/auth';
import { useMounted } from '@lib/hooks/useMounted';
import { Page } from '@components/layout/Page';
import { Logo } from '@components/ui/Logo';
import { Loader } from '@components/ui/Loader';

export function ConfirmEmailPage() {
  const { mounted } = useMounted();
  const history = useHistory();
  const query = useQuery();
  const token = query.get('token');
  const { authUser } = useAuthUser();

  const [loading, setLoading] = useState(!!token);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState(!token
    ? 'Missing token. Could not verify account.'
    : undefined);

  useEffect(() => {
    if (authUser === null && token?.length && !emailSent) {
      setLoading(true);
      confirmEmail({ token })
        .then(async () => {
          mounted(() => setEmailSent(true));
          mounted(() => setLoading(false));
        })
        .catch((err) => {
          mounted(() => {
            setEmailSent(true);
            setError(err);
            setLoading(false);
          });
        });
    }
  }, [authUser]);

  useEffect(() => {
    if (localStorage.signedIn) history.push('/');
  }, [authUser]);

  return (
    <Page title="Confirm Your Email" navbar={false} className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Logo className="mx-auto h-12 w-auto" />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {error
            ? 'Something went wrong'
            : loading
              ? 'Almost there...'
              : 'Email Verified'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {loading && (
            <div className="h-12 w-full flex items-center justify-center">
              <Loader />
            </div>
          )}
          {error
            ? (
              <p className="my-4 text-gray-900 text-base">
                It seems the link is invalid or has expired. Do you want to&nbsp;
                <Link to="/user/reconfirm-email" className="text-indigo-600 hover:text-indigo-500">
                  request a new confirm email link?
                </Link>
              </p>
            ) : loading ? (
              <p className="my-4 text-gray-900 text-base">
                Please wait a bit. We&apos;re currently verifying your email address.
              </p>
            ) : (
              <p className="my-4 text-gray-900 text-base">
                You&apos;re email has successfully been verified. You can now&nbsp;
                <Link to="/login" className="text-indigo-600 hover:text-indigo-500">
                  login to your account
                </Link>
                .
              </p>
            )}
        </div>

        <div className="mt-4 flex justify-between">
          <Link to="/login" className="text-sm text-indigo-600 hover:text-indigo-500">
            Return to login
          </Link>
          <Link to="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-500">
            Forgot your password?
          </Link>
        </div>
      </div>
    </Page>
  );
}
