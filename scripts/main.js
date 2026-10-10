// main.ts
import { system, CommandPermissionLevel } from "@minecraft/server";

// giving.ts
import { ItemStack, world } from "@minecraft/server";

// database.ts
var BASIC_TAG = "basic_tag";
var REWARD_TAG = "reward_tag";
var DEATH_TAG = "death";
var DEATH_REWARD = 32;
var DEATH_DISPLAY = "Death Bank Account";
var RED = "§c";
var GREEN = "§a";
var YELLOW = "§e";
var BOLD = "§l";
var RESET = "§r";
var items = [
  { id: "minecraft:wooden_sword", amount: 1 },
  { id: "minecraft:wooden_axe", amount: 1 },
  { id: "minecraft:wooden_pickaxe", amount: 1 },
  { id: "minecraft:bread", amount: 16 },
  { id: "minecraft:oak_log", amount: 8 }
];
var reward_items = [
  { id: "minecraft:obsidian", amount: 10 },
  { id: "minecraft:flint_and_steel", amount: 1 }
];

// giving.ts
var io_basic = (origin) => {
  const player = origin.sourceEntity;
  if (player.hasTag(BASIC_TAG)) {
    player.sendMessage(`[SYSTEM] ${BOLD}${RED}You already have basic item!${RESET}`);
    return;
  }
  const container = player.getComponent("minecraft:inventory")?.container;
  if (!container)
    return;
  for (const item of items) {
    container.addItem(new ItemStack(item.id, item.amount));
  }
  player.addTag(BASIC_TAG);
  player.sendMessage(`[SYSTEM] ${BOLD}${GREEN}You have successfully collected the basic item!${RESET}`);
};
var io_reward = (origin) => {
  const player = origin.sourceEntity;
  if (player.hasTag(REWARD_TAG)) {
    player.sendMessage(`[SYSTEM] ${BOLD}${RED}You already have reward item!${RESET}`);
    return;
  }
  const objective = world.scoreboard.getObjective(DEATH_TAG);
  if (!objective) {
    player.sendMessage(`[SYSTEM] ${BOLD}${RED}Death scoreboard is not initialized yet! Run /io:score first.${RESET}`);
    return;
  }
  const currentScore = objective.getScore(player.scoreboardIdentity) ?? 0;
  if (currentScore < DEATH_REWARD) {
    player.sendMessage(`[SYSTEM] ${BOLD}${RED}Not enough death score! Required: ${DEATH_REWARD}, Current: ${currentScore}${RESET}`);
    return;
  }
  const container = player.getComponent("minecraft:inventory")?.container;
  if (!container)
    return;
  const remainingScore = currentScore - DEATH_REWARD;
  objective.setScore(player.scoreboardIdentity, remainingScore);
  for (const item of reward_items) {
    container.addItem(new ItemStack(item.id, item.amount));
  }
  player.addTag(REWARD_TAG);
  player.sendMessage(`[SYSTEM] ${BOLD}${GREEN}Successfully claimed reward! Cost: ${DEATH_REWARD} | Remaining Death Score: ${remainingScore}${RESET}`);
};

// score.ts
import { Player as Player2, world as world2 } from "@minecraft/server";
var io_score = (origin) => {
  let obj = world2.scoreboard.getObjective(DEATH_TAG);
  if (!obj) {
    obj = world2.scoreboard.addObjective(DEATH_TAG, DEATH_DISPLAY);
  }
  world2.afterEvents.entityDie.subscribe((event) => {
    const entity = event.deadEntity;
    if (entity instanceof Player2) {
      let death = world2.scoreboard.getObjective(DEATH_TAG);
      if (!death)
        return;
      const currentScore = death.getScore(entity.scoreboardIdentity) ?? 0;
      death.setScore(entity.scoreboardIdentity, currentScore + 1);
    }
  });
};

// main.ts
class Register {
  namespace;
  name;
  description;
  level;
  callback;
  cheat;
  constructor(name, description, callback, namespace = "io", level = CommandPermissionLevel.Any, cheat = false) {
    this.name = name;
    this.description = description;
    this.callback = callback;
    this.namespace = namespace;
    this.level = level;
    this.cheat = cheat;
  }
}
function io_farm(origin, ...args) {
  const player = origin.sourceEntity;
  player.sendMessage(`[SYSTEM] ${BOLD}${YELLOW} Under Development!${RESET}`);
}
system.beforeEvents.startup.subscribe((event) => {
  const register = event.customCommandRegistry;
  const cmdlist = [
    new Register("score", "create death score system for buy something", io_score),
    new Register("basic", "give wooden sword, axe and pickaxe. also give 16 bread and 8 oak log", io_basic),
    new Register("reward", "give 10 obsidian and 1 flint and steel. cost 32 death score", io_reward),
    new Register("farm", "summon big wood farm or big stone farm. cost 64 death score", io_farm)
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
