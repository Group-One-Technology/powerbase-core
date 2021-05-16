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
