import { Player, world } from "@minecraft/server"
import { DEATH_DISPLAY, DEATH_REWARD, DEATH_TAG } from "./database";

export const io_score = (origin: any) => {
    let obj = world.scoreboard.getObjective(DEATH_TAG);
    if(!obj) {
        obj = world.scoreboard.addObjective(DEATH_TAG, DEATH_DISPLAY);
    }

    world.afterEvents.entityDie.subscribe((event) => {
        const entity = event.deadEntity;
        if(entity instanceof Player) {
            let death = world.scoreboard.getObjective(DEATH_TAG);
            if(!death) return;

            const currentScore = death.getScore(entity.scoreboardIdentity!) ?? 0;
            death.setScore(entity.scoreboardIdentity!, currentScore + 1);
        }
    });
};