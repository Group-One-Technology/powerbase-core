import React, { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';

import { useAuthUser } from '@models/AuthUser';
import { useValidState } from '@lib/hooks/useValidState';
import { EMAIL_VALIDATOR } from '@lib/validators/EMAIL_VALIDATOR';
import { PASSWORD_VALIDATOR } from '@lib/validators/PASSWORD_VALIDATOR';
import { useMounted } from '@lib/hooks/useMounted';

import { Page } from '@components/layout/Page';
import { Input } from '@components/ui/Input';
import { resendConfirmEmail } from '@lib/api/auth';
import { Button } from '@components/ui/Button';
import { ErrorAlert } from '@components/ui/ErrorAlert';
import { Logo } from '@components/ui/Logo';

export function ReconfirmEmailPage() {
  const history = useHistory();
  const { mounted } = useMounted();
  const { authUser } = useAuthUser();

  const [email, setEmail, { error: emailError }] = useValidState('', EMAIL_VALIDATOR);
  const [password, setPassword, { error: passwordError }] = useValidState('', PASSWORD_VALIDATOR);

  const [errors, setErrors] = useState();
  const [loading, setLoading] = useState(false);

  const onEmailChange = (evt) => setEmail(evt.target.value);
  const onPasswordChange = (evt) => setPassword(evt.target.value);

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    setLoading(true);
    setErrors(undefined);

    const hasErrors = (!email.length && emailError.error)
      || (!password.length && passwordError.error);

    if (!hasErrors) {
      try {
        await resendConfirmEmail({ email, password });
        history.push('/confirm-email');
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
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Confirm Your Email</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Upon registration, you&apos;ll receive a confirmation email. If you didn&apos;t get one, unverified users can request a new one below:
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
            <Input
              id="password"
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={onPasswordChange}
              error={passwordError}
              required
            />

            <Button
              type="submit"
              className="w-full inline-flex items-center justify-center border border-transparent font-medium px-4 py-2 text-base rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              loading={loading}
            >
              Resend Confirmation Email
            </Button>
          </form>
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
