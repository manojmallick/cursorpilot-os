import { ALL_MODES, type Mode } from '@cursorpilot/shared';

/**
 * Rotate through modes based on delta.
 * Positive delta = next mode, negative = previous.
 */
export function rotateMode(current: Mode, delta: number): Mode {
    const idx = ALL_MODES.indexOf(current);
    const next = ((idx + delta) % ALL_MODES.length + ALL_MODES.length) % ALL_MODES.length;
    return ALL_MODES[next];
}
