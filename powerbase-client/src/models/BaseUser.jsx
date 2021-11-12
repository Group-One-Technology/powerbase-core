import useSWR from 'swr';
import constate from 'constate';

import { useBase } from '@models/Base';
import { useAuthUser } from '@models/AuthUser';
import { getAuthGuestByDatabase } from '@lib/api/auth';
import { BasePermissions, ACCESS_LEVEL, CUSTOM_PERMISSIONS } from '@lib/constants/permissions';

function useBaseUserModel() {
  const { authUser } = useAuthUser();
  const { data: base } = useBase();

  const response = useSWR(
    (base && authUser) ? `/auth/databases/${base.id}/guest` : null,
    () => getAuthGuestByDatabase({ databaseId: base.id }),
  );

  const can = (permission, resourceId) => {
    const baseUser = response.data;

    if (!baseUser) return false;
    if (base.userId === baseUser.userId) return true;

    const permissions = ACCESS_LEVEL.find((item) => item.name === baseUser.access)?.permisions;
    if (!permissions) return false;

    if (baseUser.access !== 'custom') {
      if (permissions.includes('all')) return true;
      if (permissions.includes(permission)) return true;

      return false;
    }

    if (BasePermissions.BASE.includes(permission)) {
      if (baseUser.permissions[permission]) return true;
      if (baseUser.permissions[permission] == null) {
        const basePermission = CUSTOM_PERMISSIONS.Base.find((item) => item.key === permission);
        if (basePermission) return basePermission.value;
      }
    }

    if (BasePermissions.TABLE.includes(permission)) {
      if (baseUser.permissions.tables[resourceId]?.[permission]) return true;
      if (baseUser.permissions.tables[resourceId]?.[permission] == null) {
        const tablePermission = CUSTOM_PERMISSIONS.Table.find((item) => item.key === permission);
        if (tablePermission) return tablePermission.value;
      }
    }

    if (BasePermissions.FIELD.includes(permission)) {
      if (baseUser.permissions.fields?.[resourceId]?.[permission]) return true;
      if (baseUser.permissions.fields?.[resourceId]?.[permission] == null) {
        const fieldPermission = CUSTOM_PERMISSIONS.Field.find((item) => item.key === permission);
        if (fieldPermission) return fieldPermission.value;
      }
    }

    return false;
  };

  return {
    ...response,
    authUser,
    baseUser: response.data
      ? {
        ...response.data,
        can,
      } : undefined,
    access: response.data?.permissions,
  };
}

export const [BaseUserProvider, useBaseUser] = constate(useBaseUserModel);
