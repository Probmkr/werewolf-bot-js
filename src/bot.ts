import {
  Message,
  Client,
  Collection,
  Events,
  SlashCommandBuilder,
  CommandInteraction,
} from "discord.js";
import dotenv from "dotenv";
import { readdirSync } from "node:fs";
import path from "node:path";

dotenv.config();

const prefix = "wf!";

const client = new Client({
  intents: ["Guilds", "GuildMembers", "GuildMessages"],
});

const commands = new Collection<
  string,
  {
    data: Object;
    execute: (interaction: CommandInteraction) => Promise<void>;
  }
>();

client.once("ready", () => {
  console.log("Ready!");
  console.log(client.user.tag);
});

const commandsPath = path.join(__dirname, "commands");
const commandFiles = readdirSync(commandsPath).filter((file) =>
  file.endsWith(".ts")
);

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  // const command = require(filePath);
  import(filePath).then((command) => {
    if ("data" in command && "execute" in command) {
      commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  });
}

client.on(Events.MessageCreate, async (message: Message) => {
  if (message.author.bot) return;
  const msgContent = message.content;
  if (msgContent.startsWith(prefix)) {
    const splited = msgContent.replace(prefix, "").split(" ");
    const command = splited[0];
    const args = splited.slice(1);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  console.log(interaction.isCommand());
  if (!interaction.isCommand()) return;

  // @ts-ignore
  const command = commands.get(interaction.commandName);
  console.log(command);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }
});

client.login(process.env.BOT_TOKEN);
