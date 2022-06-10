import React, { useReducer, useState } from 'react';
import { useLayer } from 'react-laag';

import { useBaseUser } from '@models/BaseUser';
import { useSaveStatus } from '@models/SaveStatus';
import { useViewFieldState } from '@models/view/ViewFieldState';
import { PERMISSIONS } from '@lib/constants/permissions';
import { updateFieldAlias } from '@lib/api/fields';
import { captureError } from '@lib/helpers/captureError';
import { FieldMenu } from '@components/fields/FieldMenu';

export function useHeaderMenu({ table, columns, setConfirmModal }) {
  const { fields, setFields, mutateViewFields } = useViewFieldState();
  const { baseUser } = useBaseUser();
  const { saving, catchError, saved } = useSaveStatus();

  const [showMenu, setShowMenu] = useState(null);
  const [firstMounted, mounted] = useReducer(() => false, true);
  const [alias, setAlias] = useState('');

  const onHeaderMenuClick = React.useCallback((col, bounds) => {
    const { field } = columns[col];
    if (!field) return;

    const canManageField = baseUser?.can(PERMISSIONS.ManageField, field);
    if (!canManageField) return;

    setAlias(field.alias || field.name);
    setShowMenu({ field, bounds });
  }, [baseUser, columns]);

  const _handleOutsideClick = async () => {
    // prevents the menu to close on initial click
    if (firstMounted) {
      mounted();
      return;
    }

    if (showMenu == null) return;
    const { field } = showMenu;
    const canManageField = baseUser?.can(PERMISSIONS.ManageField, field);

    if (!canManageField || alias === field.alias) {
      setShowMenu(null);
      return;
    }

    saving();

    const updatedFields = fields.map((item) => ({
      ...item,
      alias: item.id === field.id
        ? alias
        : item.alias,
    }));

    setFields(updatedFields);
    setShowMenu(null);

    try {
      await updateFieldAlias({ id: field.fieldId, alias });
      await mutateViewFields(updatedFields);
      saved();
    } catch (err) {
      captureError(err);
      catchError(err);
    }
  };

  const { renderLayer, layerProps } = useLayer({
    isOpen: showMenu != null,
    onOutsideClick: _handleOutsideClick,
    triggerOffset: 4,
    trigger: {
      getBounds: () => ({
        bottom: (showMenu?.bounds.y ?? 0) + (showMenu?.bounds.height ?? 0),
        height: showMenu?.bounds.height ?? 0,
        left: showMenu?.bounds.x ?? 0,
        right: (showMenu?.bounds.x ?? 0) + (showMenu?.bounds.width ?? 0),
        top: showMenu?.bounds.y ?? 0,
        width: showMenu?.bounds.width ?? 0,
      }),
    },
    placement: 'bottom-start',
    possiblePlacements: ['bottom-start', 'bottom-end'],
    auto: true,
  });

  const headerMenu = React.useMemo(() => (showMenu != null
    ? renderLayer(
      <div
        {...layerProps}
        style={layerProps.style}
      >
        <FieldMenu
          table={table}
          field={showMenu.field}
          alias={alias}
          setAlias={setAlias}
          close={() => setShowMenu(null)}
          setConfirmModal={setConfirmModal}
        />
      </div>,
    ) : null
  ), [showMenu, layerProps, renderLayer]);

  return {
    onHeaderMenuClick,
    headerMenu,
  };
}
