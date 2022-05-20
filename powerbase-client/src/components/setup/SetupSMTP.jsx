import React, { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import PropTypes from 'prop-types';

import { useValidState } from '@lib/hooks/useValidState';
import { REQUIRED_VALIDATOR } from '@lib/validators/REQUIRED_VALIDATOR';
import { INTEGER_STRING_VALIDATOR } from '@lib/validators/INTEGER_STRING_VALIDATOR';
import { DOMAIN_VALIDATOR } from '@lib/validators/DOMAIN_VALIDATOR';
import { EMAIL_VALIDATOR } from '@lib/validators/EMAIL_VALIDATOR';
import { GETTING_STARTED_LINK } from '@lib/constants/links';
import { useData } from '@lib/hooks/useData';
import { setupSMTPSettings } from '@lib/api/settings';
import { SetupTabs } from '@lib/constants/setup';

import { ErrorAlert } from '@components/ui/ErrorAlert';
import { Input } from '@components/ui/Input';
import { Button } from '@components/ui/Button';
import { Checkbox } from '@components/ui/Checkbox';

export function SetupSMTP({ setCurrentTab }) {
  const [address, setAddress, { error: addressError }] = useValidState('', REQUIRED_VALIDATOR);
  const [port, setPort, { error: portError }] = useValidState('', INTEGER_STRING_VALIDATOR);
  const [domain, setDomain, { error: domainError }] = useValidState('', DOMAIN_VALIDATOR);
  const [email, setEmail, { error: emailError }] = useValidState('', EMAIL_VALIDATOR);
  const [password, setPassword, { error: passwordError }] = useValidState('', REQUIRED_VALIDATOR);
  const [username, setUsername, { error: usernameError }] = useValidState('', REQUIRED_VALIDATOR);
  const [useTLS, setUseTLS] = useState(true);

  const { status, error, dispatch } = useData();

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
        await setupSMTPSettings({
          address,
          port: parseInt(port, 10),
          domain,
          email,
          password,
          username,
          useTLS,
        });
        dispatch.resolved();
        setCurrentTab(SetupTabs.ADMIN_REGISTER);
      } catch (err) {
        dispatch.rejected(err.response.data.exception || err.response.data.error);
      }
    }
  };

  return (
    <Tabs.Content value={SetupTabs.SETUP_SMTP}>
      <div className="mx-auto max-w-md min-h-full p-4 flex items-center justify-center">
        <div className="my-4">
          <h2 className="text-xl leading-6 font-bold text-gray-90">
            Let&apos;s setup the SMTP service.
          </h2>
          <p className="my-2 text-gray-700 text-sm">
            This will be used to send email to powerbase users.
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
              autoComplete="off"
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
              autoComplete="off"
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
              autoComplete="off"
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
              caption="Email address you want to use as the sender of Powerbase emails."
              autoComplete="off"
              required
            />
            <Input
              type="text"
              id="username"
              label="Username"
              name="username"
              value={username}
              onChange={(evt) => setUsername(evt.target.value)}
              error={usernameError}
              autoComplete="off"
              required
            />
            <Input
              type="password"
              id="password"
              label="Password"
              name="password"
              value={password}
              onChange={(evt) => setPassword(evt.target.value)}
              error={passwordError}
              autoComplete="off"
              required
            />
            <Checkbox
              id="use-tls"
              label="Use TLS"
              value={useTLS}
              setValue={setUseTLS}
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
    </Tabs.Content>
  );
}

SetupSMTP.propTypes = {
  setCurrentTab: PropTypes.func.isRequired,
};
