import * as guildMemberAdd from "./guildMemberAdd"
import * as guildMemberRemove from "./guildMemberRemove"
import * as interactionCreate from "./interactionCreate"
import * as messageCreate from "./messageCreate"
import * as ready from "./ready"

const events: any = [guildMemberAdd, guildMemberRemove, interactionCreate, messageCreate, ready]

export { events }