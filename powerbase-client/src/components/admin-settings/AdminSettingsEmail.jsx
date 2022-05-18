import React, { useEffect, useState } from 'react';
import cn from 'classnames';
import * as Tabs from '@radix-ui/react-tabs';

import { SMTPSettingsProvider, useSMTPSettings } from '@models/SMTPSettings';
import { useValidState } from '@lib/hooks/useValidState';
import { REQUIRED_VALIDATOR } from '@lib/validators/REQUIRED_VALIDATOR';
import { DOMAIN_VALIDATOR } from '@lib/validators/DOMAIN_VALIDATOR';
import { EMAIL_VALIDATOR } from '@lib/validators/EMAIL_VALIDATOR';
import { INTEGER_STRING_VALIDATOR } from '@lib/validators/INTEGER_STRING_VALIDATOR';
import { useData } from '@lib/hooks/useData';

import { ErrorAlert } from '@components/ui/ErrorAlert';
import { Input } from '@components/ui/Input';
import { Button } from '@components/ui/Button';
import { Checkbox } from '@components/ui/Checkbox';
import { setupSettings } from '@lib/api/settings';
import { TestEmailButton } from './email/TestEmailButton';

function BaseAdminSettingsEmail() {
  const { data: smtpSettings } = useSMTPSettings();

  const [address, setAddress, { error: addressError }] = useValidState('', REQUIRED_VALIDATOR);
  const [port, setPort, { error: portError }] = useValidState('', INTEGER_STRING_VALIDATOR);
  const [domain, setDomain, { error: domainError }] = useValidState('', DOMAIN_VALIDATOR);
  const [email, setEmail, { error: emailError }] = useValidState('', EMAIL_VALIDATOR);
  const [password, setPassword, { error: passwordError }] = useValidState('', REQUIRED_VALIDATOR);
  const [username, setUsername, { error: usernameError }] = useValidState('', REQUIRED_VALIDATOR);
  const [useTLS, setUseTLS] = useState(true);

  const { status, error, dispatch } = useData();

  const reset = () => {
    if (smtpSettings == null || smtpSettings?.length === 0) return;

    setAddress(smtpSettings.address);
    setPort(smtpSettings.port);
    setDomain(smtpSettings.domain);
    setEmail(smtpSettings.email);
    setUsername(smtpSettings.username);
    setPassword(smtpSettings.password);
    setUseTLS(smtpSettings.useTls.toString() === 't');
  };

  useEffect(() => {
    reset();
  }, [smtpSettings]);

  const clear = () => {
    setAddress('', false);
    setPort('', false);
    setEmail('', false);
    setDomain('', false);
    setUsername('', false);
    setPassword('', false);
    setUseTLS(true);
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    dispatch.pending();

    const hasErrors = (!address.length && addressError.error)
      || (!port.length && portError.error)
      || (!domain.length && domainError.error)
      || (!email.length && emailError.error)
      || (!username.length && usernameError.error)
      || (!password.length && passwordError.error);

    if (!hasErrors) {
      try {
        await setupSettings({
          address,
          port: parseInt(port, 10),
          domain,
          email,
          password,
          username,
          useTLS,
        });
        dispatch.resolved('', 'Successfully updated the SMTP settings.');
      } catch (err) {
        dispatch.rejected(err.response.data.exception || err.response.data.error, true);
      }
    }
  };

  return (
    <Tabs.Content value="Email">
      <div className="py-6 px-12">
        <div className="my-4 max-w-lg">
          <h2 className="text-xl leading-6 font-bold text-gray-90">
            SMTP Settings
          </h2>
          <p className="my-2 text-gray-700 text-sm">
            Configure the settings used for sending emails.
          </p>
          {error && <ErrorAlert errors={error} />}
          <form className="mt-6 space-y-4 w-full" onSubmit={handleSubmit} aria-busy={status === 'pending'}>
            <Input
              type="text"
              id="address"
              label="SMTP Host"
              name="address"
              placeholder="e.g. smtp.yourmailservice.com"
              value={address}
              onChange={(evt) => setAddress(evt.target.value)}
              error={addressError}
              caption="Address of the SMTP server that handles your emails."
              required
            />
            <Input
              type="text"
              id="port"
              label="SMTP Port"
              name="port"
              placeholder="e.g. 587"
              value={port}
              onChange={(evt) => setPort(evt.target.value)}
              error={portError}
              caption="Port of the SMTP server uses for outgoing emails."
              required
            />
            <Input
              type="text"
              id="domain"
              label="Domain"
              name="domain"
              placeholder="e.g. yourdomain.com"
              value={domain}
              onChange={(evt) => setDomain(evt.target.value)}
              error={domainError}
              required
            />
            <Input
              type="text"
              id="from-email"
              label="From Email"
              name="from-email"
              placeholder="e.g. johndoe@yourdomain.com"
              value={email}
              onChange={(evt) => setEmail(evt.target.value)}
              error={emailError}
              required
              caption="Email address you want to use as the sender of Powerbase emails."
            />
            <Input
              type="text"
              id="username"
              label="SMTP Username"
              name="username"
              value={username}
              onChange={(evt) => setUsername(evt.target.value)}
              error={usernameError}
              required
            />
            <Input
              type="password"
              id="password"
              label="SMTP Password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(evt) => setPassword(evt.target.value)}
              error={passwordError}
              required
            />
            <Checkbox
              id="use-tls"
              label="Use TLS"
              value={useTLS}
              setValue={setUseTLS}
            />

            <div className="flex gap-4">
              <Button
                type="submit"
                className="w-full inline-flex items-center justify-center border border-transparent font-medium px-4 py-2 text-base rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                loading={status === 'pending'}
              >
                Save changes
              </Button>
              <button
                type="button"
                className={cn(
                  'inline-flex items-center justify-center border border-transparent font-medium px-6 py-2 text-base rounded-md shadow-sm',
                  status === 'pending'
                    ? 'bg-gray-300 text-gray-900'
                    : 'text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 border border-gray-300',
                )}
                onClick={clear}
                disabled={status === 'pending'}
              >
                Clear
              </button>
              <button
                type="button"
                className={cn(
                  'inline-flex items-center justify-center border border-transparent font-medium px-6 py-2 text-base rounded-md shadow-sm',
                  status === 'pending'
                    ? 'bg-gray-300 text-gray-900'
                    : 'text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 border border-gray-300',
                )}
                onClick={reset}
                disabled={status === 'pending'}
              >
                Reset
              </button>
            </div>
          </form>
        </div>
        <div className="my-16">
          <h2 className="text-xl leading-6 font-bold text-gray-90">
            Check SMTP Settings
          </h2>
          <p className="my-2 text-gray-700 text-sm">
            Send a test email to see whether the SMTP has been setup correctly.
          </p>
          <TestEmailButton />
        </div>
      </div>
    </Tabs.Content>
  );
}

export function AdminSettingsEmail() {
  return (
    <SMTPSettingsProvider>
      <BaseAdminSettingsEmail />
    </SMTPSettingsProvider>
  );
}
