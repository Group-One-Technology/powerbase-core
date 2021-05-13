import React from 'react';
import { Helmet } from 'react-helmet';
import PropTypes from 'prop-types';
import cn from 'classnames';

import { SITE_DESCRIPTION, SITE_NAME } from '@lib/constants';
import { Navbar } from './Navbar';

export function Page({
  title,
  description,
  className,
  children,
  navbar = <Navbar />,
}) {
  return (
    <div className={cn('min-h-screen bg-gray-100', className)}>
      <Helmet>
        <title>{`${title ? `${title} | ` : ''}${SITE_NAME}`}</title>
        <meta name="description" content={SITE_DESCRIPTION} />
        <link rel="apple-touch-icon" sizes="180x180" href="./public/favicon/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="./public/favicon/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="./public/favicon/favicon-16x16.png" />
        <link rel="manifest" href="./public/favicon/site.webmanifest" />
        <link rel="mask-icon" href="./public/favicon/safari-pinned-tab.svg" color="#2d89ef" />
        <meta name="msapplication-TileColor" content="#2d89ef" />
        <meta name="theme-color" content="#ffffff" />
      </Helmet>
      {navbar}
      {children}
    </div>
  );
}

Page.propTypes = {
  title: PropTypes.string,
  className: PropTypes.string,
  navbar: PropTypes.any,
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element),
  ]).isRequired,
}
