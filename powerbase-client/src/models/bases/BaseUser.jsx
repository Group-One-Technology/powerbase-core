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
    baseUser: owner
      ? {
        ...authUser,
        access: 'owner',
      } : guest,
    owner,
    setOwner,
    guest,
    setGuest,
  };
}

export const [BaseUserProvider, useBaseUser] = constate(useBaseUserModel);
