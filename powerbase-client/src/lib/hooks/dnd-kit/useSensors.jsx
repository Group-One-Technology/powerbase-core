import {
  KeyboardSensor,
  MouseSensor,
  useSensor,
  useSensors as useDndSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

export function useSensors(options) {
  const sensors = useDndSensors(
    useSensor(MouseSensor, options?.mouse),
    (options?.keyboard ?? true)
      ? useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
        ...(options?.keyboard || {}),
      })
      : null,
  );

  return sensors;
}
