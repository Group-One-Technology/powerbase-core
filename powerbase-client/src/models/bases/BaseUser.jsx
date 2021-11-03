import { useEffect, useState } from 'react';
import constate from 'constate';

import { useBase } from '@models/Base';
import { useAuthUser } from '@models/AuthUser';
import { useBaseGuests } from '@models/BaseGuests';

function useBaseUserModel() {
  const { authUser } = useAuthUser();
  const { data: base } = useBase();
  const { data: guests } = useBaseGuests();

  const [owner, setOwner] = useState(false);
  const [guest, setGuest] = useState();

  const baseUser = owner ? { ...authUser, access: 'owner' } : guest;
  const access = {
    inviteGuests: baseUser?.access === 'owner',
    manageView: ['owner', 'admin', 'editor'].includes(baseUser?.access),
    manageFields: ['owner', 'admin'].includes(baseUser?.access),
  };

  useEffect(() => {
    if (base && authUser && guests) {
      if (base.userId === authUser.id) {
        setOwner(true);
      } else if (guests?.length) {
        setGuest(guests.find((item) => item.userId === authUser.id));
      } else {
        setGuest(null);
      }
    }
  }, [base, guests, authUser]);

  return {
    authUser,
    baseUser,
    owner,
    setOwner,
    guest,
    setGuest,
    access,
  };
}

export const [BaseUserProvider, useBaseUser] = constate(useBaseUserModel);
