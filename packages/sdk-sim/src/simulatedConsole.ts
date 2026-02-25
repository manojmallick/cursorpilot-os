import { EventEmitter } from 'events';
import type { ActionEvent, Mode } from '@cursorpilot/shared';

/**
 * Simulated Logitech Actions SDK console.
 * Emits ActionEvent objects that the engine can subscribe to.
 */
class SimulatedConsole extends EventEmitter {
    private currentMode: Mode = 'SAFE';

    /** Get the current mode. */
    getMode(): Mode {
        return this.currentMode;
    }

    /** Set the active mode. */
    setMode(mode: Mode): void {
        this.currentMode = mode;
        this.emit('modeChange', mode);
    }

    /** Simulate a ring dial rotation. */
    rotate(delta: number): void {
        const event: ActionEvent = { type: 'rotate', delta };
        this.emit('action', event);
    }

    /** Simulate a button press. */
    press(buttonId: 'A' | 'B'): void {
        const event: ActionEvent = { type: 'press', buttonId };
        this.emit('action', event);
    }

    /** Subscribe to action events. */
    subscribe(handler: (event: ActionEvent) => void): void {
        this.on('action', handler);
    }

    /** Unsubscribe from action events. */
    unsubscribe(handler: (event: ActionEvent) => void): void {
        this.off('action', handler);
    }
}

/** Singleton instance. */
export const simConsole = new SimulatedConsole();
