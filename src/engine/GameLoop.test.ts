// @vitest-environment happy-dom
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "../state/store";
import { useGameLoop } from "./GameLoop";

// Mock requestAnimationFrame and cancelAnimationFrame
const originalRAF = window.requestAnimationFrame;
const originalCAF = window.cancelAnimationFrame;

describe("useGameLoop", () => {
	let rafCallbacks: Map<number, FrameRequestCallback>;
	let rafIdCounter: number;
	let currentTime: number;

	beforeEach(() => {
		rafCallbacks = new Map();
		rafIdCounter = 0;
		currentTime = 0; // Reset time between tests

		window.requestAnimationFrame = (cb: FrameRequestCallback) => {
			rafIdCounter++;
			rafCallbacks.set(rafIdCounter, cb);
			return rafIdCounter;
		};

		window.cancelAnimationFrame = (id: number) => {
			rafCallbacks.delete(id);
		};

		// Reset store
		useGameStore.setState({
			isRunning: false,
			tickCount: 0,
			time: 0,
			mana: 0,
		});
	});

	afterEach(() => {
		window.requestAnimationFrame = originalRAF;
		window.cancelAnimationFrame = originalCAF;
		rafCallbacks.clear(); // Clear any pending callbacks
	});

	const advanceFrames = (frames: number) => {
		for (let i = 0; i < frames; i++) {
			currentTime += 16;
			const callbacks = Array.from(rafCallbacks.entries());
			const currentIds = callbacks.map(([id]) => id);
			currentIds.forEach((id) => {
				rafCallbacks.delete(id);
			});

			callbacks.forEach(([_, cb]) => {
				cb(currentTime);
			});
		}
	};

	it("should not tick when game is not running", () => {
		const { unmount } = renderHook(() => useGameLoop());

		act(() => {
			advanceFrames(60); // 1 second
		});

		const state = useGameStore.getState();
		expect(state.tickCount).toBe(0);

		unmount();
	});

	it("should tick approximately 20 times per second when running", () => {
		const { unmount } = renderHook(() => useGameLoop());

		act(() => {
			useGameStore.setState({ isRunning: true });
		});

		// Trigger the initial frame to start the loop with initial timestamp
		act(() => {
			const callbacks = Array.from(rafCallbacks.values());
			rafCallbacks.clear();
			currentTime = 16; // Start at first frame
			callbacks.forEach((cb) => {
				cb(currentTime);
			});
		});

		act(() => {
			advanceFrames(60); // ~1 second (60 * 16ms = 960ms)
		});

		const state = useGameStore.getState();
		// Starting at 16ms, then 60 frames = 976ms total
		// 976ms / 50ms = 19.52 ticks.
		// Should be 19-20.
		expect(state.tickCount).toBeGreaterThanOrEqual(19);
		expect(state.tickCount).toBeLessThanOrEqual(20);

		unmount();
	});

	it("should accumulate time and catch up", () => {
		const { unmount } = renderHook(() => useGameLoop());

		act(() => {
			useGameStore.setState({ isRunning: true });
		});

		// Trigger the initial frame
		act(() => {
			const callbacks = Array.from(rafCallbacks.values());
			rafCallbacks.clear();
			currentTime = 16;
			callbacks.forEach((cb) => {
				cb(currentTime);
			});
		});

		// Simulate a lag spike (manual jump in time)
		act(() => {
			// Advance time but don't fire callbacks for a while
			currentTime += 500;
			// Now fire the pending callbacks with the new time
			const callbacks = Array.from(rafCallbacks.values());
			rafCallbacks.clear();
			callbacks.forEach((cb) => {
				cb(currentTime);
			});
		});

		const state = useGameStore.getState();
		// 500ms / 50ms = 10 ticks.
		expect(state.tickCount).toBeGreaterThanOrEqual(9);
		expect(state.tickCount).toBeLessThanOrEqual(11);

		unmount();
	});
});
