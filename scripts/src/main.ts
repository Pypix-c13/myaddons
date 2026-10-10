import { system, StartupEvent, CommandPermissionLevel } from "@minecraft/server";
import { io_basic, io_reward } from "./giving";
import { io_score } from "./score";
import { BOLD, YELLOW, RESET } from "./database";

type Callback = (origin: any, ...args: any[]) => void;

class Register {
    namespace: string;
    name: string;
    description: string;
    level: CommandPermissionLevel;
    callback: Callback;
    cheat: boolean;

    constructor(
        name: string,
        description: string,
        callback: Callback,
        namespace: string = "io",
        level: CommandPermissionLevel = CommandPermissionLevel.Any,
        cheat: boolean = false
    ) {
        this.name = name;
        this.description = description;
        this.callback = callback;
        this.namespace = namespace;
        this.level = level;
        this.cheat = cheat;
    }
}

function io_farm(origin: any, ...args: any[]) {
    const player = origin.sourceEntity;
    player.sendMessage(`[SYSTEM] ${BOLD}${YELLOW} Under Development!${RESET}`);
}

system.beforeEvents.startup.subscribe((event: StartupEvent) => {
    const register = event.customCommandRegistry;

    const cmdlist = [
        new Register(
            "score",
            "create death score system for buy something",
            io_score
        ),
        new Register(
            "basic",
            "give wooden sword, axe and pickaxe. also give 16 bread and 8 oak log",
            io_basic
        ),
        new Register(
            "reward",
            "give 10 obsidian and 1 flint and steel. cost 32 death score",
            io_reward
        ),
        new Register(
            "farm",
            "summon big wood farm or big stone farm. cost 64 death score",
            io_farm
        )
    ];

    for (const list of cmdlist) {
        register.registerCommand({
            name: `${list.namespace}:${list.name}`,
            description: list.description,
            cheatsRequired: list.cheat,
            permissionLevel: list.level
        }, (origin, ...args) => {
            system.run(() => list.callback(origin, ...args));
        });
    }
});