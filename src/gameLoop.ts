import { useEffect, useRef } from "react";
import { useGameStore } from "./store";

export function useGameLoop() {
	const tick = useGameStore((state) => state.tick);
	const isRunning = useGameStore((state) => state.isRunning);
	const lastTimeRef = useRef<number>(0);
	const requestRef = useRef<number | undefined>(undefined);

	useEffect(() => {
		const loop = (time: number) => {
			if (lastTimeRef.current !== 0) {
				const dt = (time - lastTimeRef.current) / 1000; // Convert ms to seconds
				tick(dt);
			}
			lastTimeRef.current = time;
			requestRef.current = requestAnimationFrame(loop);
		};

		if (isRunning) {
			lastTimeRef.current = 0; // Reset time on start
			requestRef.current = requestAnimationFrame(loop);
		} else {
			if (requestRef.current) {
				cancelAnimationFrame(requestRef.current);
			}
			lastTimeRef.current = 0;
		}

		return () => {
			if (requestRef.current) {
				cancelAnimationFrame(requestRef.current);
			}
		};
	}, [isRunning, tick]);
}
