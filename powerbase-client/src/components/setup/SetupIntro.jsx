import React from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import PropTypes from 'prop-types';

import { GETTING_STARTED_LINK } from '@lib/constants/links';
import { Logo } from '@components/ui/Logo';
import { SetupTabs } from '@lib/constants/setup';

export function SetupIntro({ setCurrentTab }) {
  const nextStep = () => setCurrentTab(SetupTabs.SETUP_SMTP);

  return (
    <Tabs.Content value={SetupTabs.WELCOME} className="my-auto">
      <Logo white className="block h-16 w-auto bg-gray-900 p-4 rounded-md" />
      <h1 className="my-4 text-gray-900 text-2xl">
        Welcome to&nbsp;
        <span className="block text-6xl font-bold uppercase">Powerbase</span>
      </h1>
      <p className="text-gray-700 text-base">
        Looks like everything is all set! Let&apos;s get you setup so you can start managing your data.
      </p>
      <div className="my-4 h-12 w-0.5 bg-gray-500" aria-hidden="true" />
      <button
        type="button"
        className="my-4 flex items-center justify-center border border-transparent font-medium px-4 py-2 text-base rounded-md shadow-sm text-white bg-indigo-700 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        onClick={nextStep}
      >
        Let&apos;s get started
      </button>
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
    </Tabs.Content>
  );
}

SetupIntro.propTypes = {
  setCurrentTab: PropTypes.func.isRequired,
};
