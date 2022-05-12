import React from 'react';
import { useHistory } from 'react-router-dom';

import { useValidState } from '@lib/hooks/useValidState';
import { REQUIRED_VALIDATOR } from '@lib/validators/REQUIRED_VALIDATOR';
import { EMAIL_VALIDATOR } from '@lib/validators/EMAIL_VALIDATOR';
import { PASSWORD_VALIDATOR } from '@lib/validators/PASSWORD_VALIDATOR';
import { GETTING_STARTED_LINK } from '@lib/constants/links';
import { useData } from '@lib/hooks/useData';
import { register } from '@lib/api/auth';
import { useAuthUser } from '@models/AuthUser';

import { ErrorAlert } from '@components/ui/ErrorAlert';
import { Input } from '@components/ui/Input';
import { Button } from '@components/ui/Button';

export function SetupAdminForm() {
  const { mutate: mutateAuthUser } = useAuthUser();

  const [firstName, setFirstName, { error: firstNameError }] = useValidState('', REQUIRED_VALIDATOR);
  const [lastName, setLastName, { error: lastNameError }] = useValidState('', REQUIRED_VALIDATOR);
  const [email, setEmail, { error: emailError }] = useValidState('', EMAIL_VALIDATOR);
  const [password, setPassword, { error: passwordError }] = useValidState('', PASSWORD_VALIDATOR);
  const [confirmPassword, setConfirmPassword, { error: confirmPasswordError }] = useValidState(
    '', PASSWORD_VALIDATOR,
  );

  const { status, error, dispatch } = useData();

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    dispatch.pending();

    if (password && confirmPassword && (password !== confirmPassword)) {
      dispatch.rejected('Password doesn\'t match confirm password.');
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

        await mutateAuthUser();
        dispatch.resolved();
      } catch (err) {
        dispatch.rejected(err.response.data.exception || err.response.data.error);
      }
    }
  };

  return (
    <div className="mx-auto max-w-md min-h-full p-4 flex items-center justify-center">
      <div className="my-4">
        <h1 className="text-2xl leading-6 font-bold text-gray-90">
          Let&apos;s setup your admin account.
        </h1>
        <p className="my-2 text-gray-700 text-sm">
          This is the login you will use to update the admin settings of Powerbase (e.g. SMTP, etc).
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
            loading={status === 'pending'}
          >
            Save and continue
          </Button>
          <p className="my-4 text-gray-700 text-xs">
            If you need any help, you can checkout our&nbsp;
            <a
              href={GETTING_STARTED_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-700 hover:text-indigo-600 focus:text-indigo-600"
            >
              getting started
            </a>
            &nbsp;guide.
          </p>
        </form>
      </div>
    </div>
  );
}
