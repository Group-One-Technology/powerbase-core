import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors as useDndSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

export function useSensors() {
  const sensors = useDndSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  return sensors;
}
