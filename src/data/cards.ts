import type { Card } from "../types/game";
import { CARD_DEFINITIONS, STARTER_DECK_IDS } from "./cardDefinitions";

export const INITIAL_DECK: Card[] = STARTER_DECK_IDS.map(
	(id) => CARD_DEFINITIONS[id],
);
