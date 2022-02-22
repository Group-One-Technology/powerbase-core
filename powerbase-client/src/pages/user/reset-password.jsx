import React, { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';

import { useAuthUser } from '@models/AuthUser';
import { useValidState } from '@lib/hooks/useValidState';
import { PASSWORD_VALIDATOR } from '@lib/validators/PASSWORD_VALIDATOR';
import { useMounted } from '@lib/hooks/useMounted';
import { useQuery } from '@lib/hooks/useQuery';

import { Page } from '@components/layout/Page';
import { Input } from '@components/ui/Input';
import { resetPassword } from '@lib/api/auth';
import { Button } from '@components/ui/Button';
import { ErrorAlert } from '@components/ui/ErrorAlert';
import { Logo } from '@components/ui/Logo';

export function ResetPasswordPage() {
  const { mounted } = useMounted();
  const history = useHistory();
  const query = useQuery();
  const token = query.get('token');

  const { authUser } = useAuthUser();
  const [password, setPassword, { error: passwordError }] = useValidState('', PASSWORD_VALIDATOR);
  const [passwordConfirmation, setPasswordConfirmation, { error: passwordConfirmationError }] = useValidState('', PASSWORD_VALIDATOR);

  const [errors, setErrors] = useState();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = (evt) => setPassword(evt.target.value);
  const handlePasswordConfirmationChange = (evt) => setPasswordConfirmation(evt.target.value);

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    setLoading(true);
    setSuccess(false);
    setErrors(undefined);

    if (password.length && passwordConfirmation.length && (password !== passwordConfirmation)) {
      setErrors('Password doesn\'t match confirm password.');
      setLoading(false);
      return;
    }

    try {
      await resetPassword({ token, password, passwordConfirmation });
      mounted(() => setSuccess(true));
    } catch (err) {
      setErrors(err.response.data.exception || err.response.data.error);
    }

    mounted(() => setLoading(false));
  };

  useEffect(() => {
    if (localStorage.signedIn) history.push('/');
  }, [authUser]);

  return (
    <Page title="Login" navbar={false} className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Logo className="mx-auto h-12 w-auto" />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Reset Password</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {errors && <ErrorAlert errors={errors} />}

          {!token
            ? (
              <p className="my-4 text-gray-900 text-base">
                It seems this link is invalid or has expired. Do you want to&nbsp;
                <Link to="/forgot-password" className="text-indigo-600 hover:text-indigo-500">
                  request a new reset password link?
                </Link>
                .
              </p>
            ) : success ? (
              <p className="my-4 text-gray-900 text-base">
                You&apos;re password has been reset successfully. You can&nbsp;
                <Link to="/login" className="text-indigo-600 hover:text-indigo-500">
                  login to your account here
                </Link>
                .
              </p>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit} aria-busy={loading}>
                <Input
                  id="password"
                  label="Password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={handlePasswordChange}
                  error={passwordError}
                  required
                />
                <Input
                  type="password"
                  id="confirmPassword"
                  label="Confirm Password"
                  name="confirm-password"
                  autoComplete="confirm-password"
                  value={passwordConfirmation}
                  onChange={handlePasswordConfirmationChange}
                  error={passwordConfirmationError}
                  required
                />

                <Button
                  type="submit"
                  className="w-full inline-flex items-center justify-center border border-transparent font-medium px-4 py-2 text-base rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  loading={loading}
                >
                  Reset Password
                </Button>
              </form>
            )}
        </div>

        <div className="mt-4 flex justify-between">
          <Link to="/register" className="text-sm text-indigo-600 hover:text-indigo-500">
            Create an account
          </Link>
          <Link to="/login" className="text-sm text-indigo-600 hover:text-indigo-500">
            Login instead
          </Link>
        </div>
      </div>
    </Page>
  );
}
