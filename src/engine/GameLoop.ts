import { useEffect, useRef } from "react";
import { useGameStore } from "../state/store";

const TICK_RATE = 20;
const TICK_DT = 1 / TICK_RATE; // 0.05s

/**
 * React hook that runs the game loop using requestAnimationFrame.
 * Implements a fixed timestep accumulator pattern to ensure deterministic game logic
 * at 20 ticks per second, regardless of frame rate.
 *
 * The loop automatically starts/stops based on the `isRunning` state from the game store.
 */
export function useGameLoop() {
	const tick = useGameStore((state) => state.tick);
	const isRunning = useGameStore((state) => state.isRunning);
	const lastTimeRef = useRef<number>(0);
	const accumulatorRef = useRef<number>(0);
	const requestRef = useRef<number | undefined>(undefined);

	useEffect(() => {
		const loop = (time: number) => {
			if (lastTimeRef.current !== 0) {
				const deltaTime = (time - lastTimeRef.current) / 1000; // Convert ms to seconds
				accumulatorRef.current += deltaTime;

				// Process ticks
				while (accumulatorRef.current >= TICK_DT) {
					tick(TICK_DT);
					accumulatorRef.current -= TICK_DT;
				}
			}
			lastTimeRef.current = time;
			requestRef.current = requestAnimationFrame(loop);
		};

		if (isRunning) {
			lastTimeRef.current = 0; // Reset time on start
			accumulatorRef.current = 0;
			requestRef.current = requestAnimationFrame(loop);
		} else {
			if (requestRef.current) {
				cancelAnimationFrame(requestRef.current);
			}
			lastTimeRef.current = 0;
			accumulatorRef.current = 0;
		}

		return () => {
			if (requestRef.current) {
				cancelAnimationFrame(requestRef.current);
			}
		};
	}, [isRunning, tick]);
}
