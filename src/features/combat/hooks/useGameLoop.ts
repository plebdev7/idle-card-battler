import { useEffect, useRef } from "react";
import { useCombatStore } from "../state/combatStore";

export const useGameLoop = () => {
	const tick = useCombatStore((state) => state.tick);
	const lastTimeRef = useRef<number>(0);
	const requestRef = useRef<number | undefined>(undefined);

	useEffect(() => {
		const loop = (time: number) => {
			if (lastTimeRef.current !== 0) {
				const dt = (time - lastTimeRef.current) / 1000; // Convert to seconds
				// Cap dt to prevent huge jumps if tab is backgrounded
				const safeDt = Math.min(dt, 0.1);
				tick(safeDt);
			}
			lastTimeRef.current = time;
			requestRef.current = requestAnimationFrame(loop);
		};

		requestRef.current = requestAnimationFrame(loop);
		return () => {
			if (requestRef.current) {
				cancelAnimationFrame(requestRef.current);
			}
		};
	}, [tick]);
};
