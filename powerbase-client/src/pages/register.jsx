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
  const { authUser, mutate: refetchAuthUser } = useAuthUser();

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
        await refetchAuthUser();
        history.push('/');
      } catch (err) {
        setErrors(err.response.data.errors);
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

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <div>
                <Link
                  to="#"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Sign in with Facebook</span>
                  <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              </div>

              <div>
                <Link
                  to="#"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Sign in with Twitter</span>
                  <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </Link>
              </div>

              <div>
                <Link
                  to="#"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Sign in with GitHub</span>
                  <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}
