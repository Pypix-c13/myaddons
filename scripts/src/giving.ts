import { ItemStack, Player, world } from "@minecraft/server";
import {
    BASIC_TAG, BOLD, GREEN,
    RESET, REWARD_TAG, items,
    RED, reward_items, DEATH_TAG,
    DEATH_REWARD
} from "./database"

export const io_basic = (origin: any) => {
    const player = origin.sourceEntity;
    if(player.hasTag(BASIC_TAG)) {
        player.sendMessage(`[SYSTEM] ${BOLD}${RED}You already have basic item!${RESET}`);
        return;
    }

    const container = player.getComponent("minecraft:inventory")?.container;
    if(!container) return;
    for(const item of items) {
        container.addItem(new ItemStack(item.id, item.amount));
    }

    player.addTag(BASIC_TAG);
    player.sendMessage(`[SYSTEM] ${BOLD}${GREEN}You have successfully collected the basic item!${RESET}`);
}

export const io_reward = (origin: any) => {
    const player = origin.sourceEntity as Player;
    if(player.hasTag(REWARD_TAG)) {
        player.sendMessage(`[SYSTEM] ${BOLD}${RED}You already have reward item!${RESET}`);
        return;
    }

    const objective = world.scoreboard.getObjective(DEATH_TAG);
    if (!objective) {
        player.sendMessage(`[SYSTEM] ${BOLD}${RED}Death scoreboard is not initialized yet! Run /io:score first.${RESET}`);
        return;
    }

    const currentScore = objective.getScore(player.scoreboardIdentity!) ?? 0;
    if (currentScore < DEATH_REWARD) {
        player.sendMessage(`[SYSTEM] ${BOLD}${RED}Not enough death score! Required: ${DEATH_REWARD}, Current: ${currentScore}${RESET}`);
        return;
    }

    const container = player.getComponent("minecraft:inventory")?.container;
    if(!container) return;
    const remainingScore = currentScore - DEATH_REWARD;

    objective.setScore(player.scoreboardIdentity!, remainingScore);
    for(const item of reward_items) {
        container.addItem(new ItemStack(item.id, item.amount));
    }

    player.addTag(REWARD_TAG);
    player.sendMessage(`[SYSTEM] ${BOLD}${GREEN}Successfully claimed reward! Cost: ${DEATH_REWARD} | Remaining Death Score: ${remainingScore}${RESET}`);
}