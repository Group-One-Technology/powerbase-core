/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from 'react';
import { useHistory, Link } from 'react-router-dom';

import { useAuthUser } from '@models/AuthUser';
import { useValidState } from '@lib/hooks/useValidState';
import { EMAIL_VALIDATOR } from '@lib/validators/EMAIL_VALIDATOR';
import { PASSWORD_VALIDATOR } from '@lib/validators/PASSWORD_VALIDATOR';
import { REQUIRED_VALIDATOR } from '@lib/validators/REQUIRED_VALIDATOR';
import { register } from '@lib/api/auth';
import { useMounted } from '@lib/hooks/useMounted';

import { Page } from '@components/layout/Page';
import { Input } from '@components/ui/Input';
import { Button } from '@components/ui/Button';
import { ErrorAlert } from '@components/ui/ErrorAlert';
import { Logo } from '@components/ui/Logo';

export function RegisterPage() {
  const history = useHistory();
  const { mounted } = useMounted();
  const { authUser } = useAuthUser();

  const [firstName, setFirstName, { error: firstNameError }] = useValidState('', REQUIRED_VALIDATOR);
  const [lastName, setLastName, { error: lastNameError }] = useValidState('', REQUIRED_VALIDATOR);
  const [email, setEmail, { error: emailError }] = useValidState('', EMAIL_VALIDATOR);
  const [password, setPassword, { error: passwordError }] = useValidState('', PASSWORD_VALIDATOR);
  const [confirmPassword, setConfirmPassword, { error: confirmPasswordError }] = useValidState(
    '', PASSWORD_VALIDATOR,
  );

  const [errors, setErrors] = useState();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    setLoading(true);
    setErrors(undefined);

    if (password && confirmPassword && (password !== confirmPassword)) {
      setErrors('Password doesn\'t match confirm password.');
      setLoading(false);
      return;
    }

    const hasErrors = (!firstName.length && firstNameError.error)
      || (!lastName.length && lastNameError.error)
      || (!email.length && emailError.error)
      || (!password.length && passwordError.error);

    if (!hasErrors) {
      try {
        await register({
          firstName,
          lastName,
          email,
          password,
          passwordConfirmation: confirmPassword,
        });
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
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create an Account</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or&nbsp;
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Login to your account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {errors && <ErrorAlert errors={errors} />}
          <form className="space-y-6" onSubmit={handleSubmit} aria-busy={loading}>
            <Input
              type="text"
              id="firstName"
              label="First name"
              name="first-name"
              autoComplete="first-name"
              value={firstName}
              onChange={(evt) => setFirstName(evt.target.value)}
              error={firstNameError}
              required
            />
            <Input
              type="text"
              id="lastName"
              label="Last name"
              name="last-name"
              autoComplete="last-name"
              value={lastName}
              onChange={(evt) => setLastName(evt.target.value)}
              error={lastNameError}
              required
            />
            <Input
              id="email"
              label="Email address"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(evt) => setEmail(evt.target.value)}
              error={emailError}
              required
            />
            <Input
              type="password"
              id="password"
              label="Password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(evt) => setPassword(evt.target.value)}
              error={passwordError}
              required
            />
            <Input
              type="password"
              id="confirmPassword"
              label="Confirm Password"
              name="confirm-password"
              autoComplete="confirm-password"
              value={confirmPassword}
              onChange={(evt) => setConfirmPassword(evt.target.value)}
              error={confirmPasswordError}
              required
            />

            <Button
              type="submit"
              className="w-full inline-flex items-center justify-center border border-transparent font-medium px-4 py-2 text-base rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              loading={loading}
            >
              Sign up
            </Button>
          </form>
        </div>
      </div>
    </Page>
  );
}
