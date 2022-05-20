import React, { useEffect } from 'react';
import * as Tabs from '@radix-ui/react-tabs';

import { useAuthUser } from '@models/AuthUser';
import { useValidState } from '@lib/hooks/useValidState';
import { useData } from '@lib/hooks/useData';
import { updateUser } from '@lib/api/auth';
import { PASSWORD_VALIDATOR } from '@lib/validators/PASSWORD_VALIDATOR';
import { REQUIRED_VALIDATOR } from '@lib/validators/REQUIRED_VALIDATOR';
import { EMAIL_VALIDATOR } from '@lib/validators/EMAIL_VALIDATOR';

import { ErrorAlert } from '@components/ui/ErrorAlert';
import { Input } from '@components/ui/Input';
import { Button } from '@components/ui/Button';

export function ProfileSettings() {
  const { authUser, mutate: mutateAuthUser } = useAuthUser();

  const [firstName, setFirstName, { error: firstNameError }] = useValidState('', REQUIRED_VALIDATOR);
  const [lastName, setLastName, { error: lastNameError }] = useValidState('', REQUIRED_VALIDATOR);
  const [email, setEmail, { error: emailError }] = useValidState('', EMAIL_VALIDATOR);
  const [password, setPassword, { error: passwordError }] = useValidState('', PASSWORD_VALIDATOR);

  const {
    data, status, error, dispatch,
  } = useData();

  useEffect(() => {
    if (!authUser) return;
    setFirstName(authUser.firstName);
    setLastName(authUser.lastName);
    setEmail(authUser.email);
  }, [authUser]);

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    dispatch.pending();

    const hasErrors = (!firstName.length && firstNameError.error)
      || (!lastName.length && lastNameError.error)
      || (!email.length && emailError.error)
      || (!password.length && passwordError.error);

    if (!hasErrors) {
      try {
        const hasEmailChanged = authUser.email !== email;

        await updateUser({
          firstName,
          lastName,
          email,
          password,
        });

        mutateAuthUser({
          ...authUser,
          firstName,
          lastName,
          email,
        });
        dispatch.resolved(
          hasEmailChanged ? 'A confirm email has been sent to your account.' : '',
          'Successfully updated account details.',
        );
      } catch (err) {
        dispatch.rejected(err.response.data.exception || err.response.data.error);
      }
    }
  };

  return (
    <Tabs.Content value="Profile">
      <div className="max-w-md min-h-full py-4 px-12">
        <div className="my-4">
          <h2 className="text-xl leading-6 font-bold text-gray-90">
            Update Your Account
          </h2>
          <p className="my-2 text-gray-700 text-sm">
            To update your account details, please enter your current password below:
          </p>
          {error && <ErrorAlert errors={error} />}
          <form className="mt-6 space-y-4 w-full" onSubmit={handleSubmit} aria-busy={status === 'pending'}>
            <Input
              type="text"
              id="firstName"
              label="First name"
              name="first-name"
              autoComplete="first-name"
              placeholder="e.g. John"
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
              placeholder="e.g. Doe"
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
              placeholder="e.g. johndoe@example.com"
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
              autoComplete="password"
              value={password}
              onChange={(evt) => setPassword(evt.target.value)}
              error={passwordError}
              required
            />

            <Button
              type="submit"
              className="inline-flex items-center justify-center border border-transparent font-medium px-6 py-2 text-base rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              loading={status === 'pending'}
            >
              Update Account
            </Button>
            {data?.length > 0 && (
              <p className="my-2 text-sm text-green-700">
                {data}
              </p>
            )}
          </form>
        </div>
      </div>
    </Tabs.Content>
  );
}
