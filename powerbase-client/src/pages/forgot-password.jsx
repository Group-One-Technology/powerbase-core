import React, { useEffect, useState } from 'react';
import cn from 'classnames';
import { Link, useHistory } from 'react-router-dom';

import { useAuthUser } from '@models/AuthUser';
import { useValidState } from '@lib/hooks/useValidState';
import { EMAIL_VALIDATOR } from '@lib/validators/EMAIL_VALIDATOR';
import { useMounted } from '@lib/hooks/useMounted';

import { Page } from '@components/layout/Page';
import { Input } from '@components/ui/Input';
import { forgotPassword } from '@lib/api/auth';
import { Button } from '@components/ui/Button';
import { ErrorAlert } from '@components/ui/ErrorAlert';
import { Logo } from '@components/ui/Logo';

export function ForgotPasswordPage() {
  const history = useHistory();
  const { mounted } = useMounted();
  const { authUser } = useAuthUser();

  const [email, setEmail, { error: emailError }] = useValidState('', EMAIL_VALIDATOR);

  const [errors, setErrors] = useState();
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const onEmailChange = (evt) => setEmail(evt.target.value);

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    setLoading(true);
    setErrors(undefined);

    const hasErrors = (!email.length && emailError.error);

    if (!hasErrors) {
      try {
        await forgotPassword({ email });
        mounted(() => setEmailSent(true));
      } catch (err) {
        setErrors(err.response.data.exception || err.response.data.error);
      }
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
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Forgot Password</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Please enter your email address below to reset your password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {errors && <ErrorAlert errors={errors} />}
          <form className="space-y-6" onSubmit={handleSubmit} aria-busy={loading}>
            <Input
              id="email"
              label="Email address"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={onEmailChange}
              error={emailError}
              required
            />

            <Button
              type="submit"
              className={cn(
                'w-full inline-flex items-center justify-center border border-transparent font-medium px-4 py-2 text-base rounded-md shadow-sm',
                (loading || emailSent)
                  ? 'text-gray-900 bg-gray-400 cursor-not-allowed'
                  : 'text-white bg-indigo-600 cursor-pointer hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
              )}
              loading={loading}
              disabled={emailSent}
            >
              {!emailSent
                ? 'Reset Password'
                : 'Email sent! Please check your email.'}
            </Button>
          </form>
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
