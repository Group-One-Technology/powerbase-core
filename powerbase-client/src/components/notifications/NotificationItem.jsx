import React from 'react';
import PropTypes from 'prop-types';
import Gravatar from 'react-gravatar';
import cn from 'classnames';
import { Link } from 'react-router-dom';

import { formatDate } from '@lib/helpers/formatDate';
import { NOTIFICATIONS } from '@lib/constants/notifications';

function getLink(data) {
  switch (data.dataType) {
    case NOTIFICATIONS.AcceptInvite:
    case NOTIFICATIONS.RejectInvite:
    case NOTIFICATIONS.LeaveBase:
      return `/base/${data.object.id}`;
    default:
      return null;
  }
}

export function NotificationItem({ notification }) {
  const link = getLink(notification);

  const component = (
    <li key={notification.id} className={cn('p-2 flex items-center space-x-2', !notification.hasRead && 'border-l-4 border-indigo-900')}>
      <div className="flex-shrink-0">
        <Gravatar
          email={notification.subject.email}
          className="h-8 w-8 rounded-full"
          alt={`${notification.subject.name}'s profile picture`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-900">
          <strong>{notification.subject.name}</strong> {notification.message} <strong>{notification.object.name}</strong>
        </p>
        <p className="text-xs text-gray-500">
          {formatDate(notification.createdAt, { timeZone: undefined, month: 'long' })}
        </p>
      </div>
    </li>
  );

  if (link) {
    return (
      <Link to={link}>
        {component}
      </Link>
    );
  }

  return component;
}

NotificationItem.propTypes = {
  notification: PropTypes.object.isRequired,
};
