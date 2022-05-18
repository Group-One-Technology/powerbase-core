import React from 'react';
import * as Tabs from '@radix-ui/react-tabs';

import { useValidState } from '@lib/hooks/useValidState';
import { PASSWORD_VALIDATOR } from '@lib/validators/PASSWORD_VALIDATOR';
import { useData } from '@lib/hooks/useData';
import { updatePassword } from '@lib/api/auth';
import { useAuthUser } from '@models/AuthUser';

import { ErrorAlert } from '@components/ui/ErrorAlert';
import { Input } from '@components/ui/Input';
import { Button } from '@components/ui/Button';

export function PasswordSettings() {
  const { mutate: mutateAuthUser } = useAuthUser();

  const [password, setPassword, { error: passwordError }] = useValidState('', PASSWORD_VALIDATOR);
  const [newPassword, setNewPassword, { error: newPasswordError }] = useValidState('', PASSWORD_VALIDATOR);
  const [confirmPassword, setConfirmPassword, { error: confirmPasswordError }] = useValidState(
    '', PASSWORD_VALIDATOR,
  );

  const { status, error, dispatch } = useData();

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    dispatch.pending();

    if (newPassword && confirmPassword && (newPassword !== confirmPassword)) {
      dispatch.rejected('Password doesn\'t match confirm password.');
      return;
    }

    const hasErrors = (!password.length && passwordError.error)
      || (!newPassword.length && newPasswordError.error);

    if (!hasErrors) {
      try {
        await updatePassword({
          currentPassword: password,
          password: newPassword,
          passwordConfirmation: confirmPassword,
        });

        await mutateAuthUser();
        dispatch.resolved('', 'Successfully updated the password.');
      } catch (err) {
        dispatch.rejected(err.response.data.exception || err.response.data.error);
      }
    }
  };

  return (
    <Tabs.Content value="Password">
      <div className="max-w-md min-h-full py-4 px-12">
        <div className="my-4">
          <h2 className="text-xl leading-6 font-bold text-gray-90">
            Change Your Password
          </h2>
          <p className="my-2 text-gray-700 text-sm">
            Enter your current and new password below:
          </p>
          {error && <ErrorAlert errors={error} />}
          <form className="mt-6 space-y-4 w-full" onSubmit={handleSubmit} aria-busy={status === 'pending'}>
            <Input
              type="password"
              id="password"
              label="Current Password"
              name="password"
              autoComplete="password"
              value={password}
              onChange={(evt) => setPassword(evt.target.value)}
              error={passwordError}
              required
            />
            <Input
              type="password"
              id="new-password"
              label="New Password"
              name="new-password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(evt) => setNewPassword(evt.target.value)}
              error={newPasswordError}
              required
            />
            <Input
              type="password"
              id="confirm-new-password"
              label="Confirm New Password"
              name="confirm-new-password"
              autoComplete="confirm-new-password"
              value={confirmPassword}
              onChange={(evt) => setConfirmPassword(evt.target.value)}
              error={confirmPasswordError}
              required
            />

            <Button
              type="submit"
              className="inline-flex items-center justify-center border border-transparent font-medium px-6 py-2 text-base rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              loading={status === 'pending'}
            >
              Update Password
            </Button>
          </form>
        </div>
      </div>
    </Tabs.Content>
  );
}
