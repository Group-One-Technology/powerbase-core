import { CellMenu } from '@components/tables/TableGrid/CellMenu';
import React, { useState } from 'react';
import { useLayer } from 'react-laag';

export function useRecordMenu({
  table,
  columns,
  records,
  setRecords,
  setConfirmModal,
  setRecordModal,
}) {
  const [showMenu, setShowMenu] = useState(null);

  const onCellContextMenu = React.useCallback((cell, evt) => {
    evt.preventDefault();
    if (showMenu) {
      setShowMenu(null);
      return;
    }

    const [col] = cell;
    const { field } = columns[col];
    if (!field) return;

    setShowMenu({ cell, bounds: evt.bounds });
  }, [columns]);

  const { renderLayer, layerProps } = useLayer({
    isOpen: showMenu != null,
    onOutsideClick: () => setShowMenu(null),
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

  const recordMenu = React.useMemo(() => (showMenu != null
    ? renderLayer(
      <div
        {...layerProps}
        style={layerProps.style}
      >
        <CellMenu
          cell={showMenu.cell}
          table={table}
          records={records}
          setRecords={setRecords}
          setConfirmModal={setConfirmModal}
          setRecordModal={setRecordModal}
          close={() => setShowMenu(null)}
        />
      </div>,
    ) : null
  ), [showMenu, layerProps, renderLayer, records, table]);

  return { onCellContextMenu, recordMenu };
}
