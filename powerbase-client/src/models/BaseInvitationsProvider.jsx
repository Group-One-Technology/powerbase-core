import constate from 'constate';
import useSWR from 'swr';

import { getBaseInvitations } from '@lib/api/databases';
import { useAuthUser } from './AuthUser';

function useBaseInvitationsModel() {
  const { authUser } = useAuthUser();

  const response = useSWR(
    authUser ? '/base_invitations' : null,
    getBaseInvitations,
  );

  return {
    ...response,
  };
}

export const [BaseInvitationsProvider, useBaseInvitations] = constate(useBaseInvitationsModel);
