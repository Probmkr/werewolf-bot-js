import { Message, Client, Collection, Events } from "discord.js";
import dotenv from "dotenv";
import { readdirSync } from "fs";
import path from "path";

dotenv.config();

const prefix = "wf!";

class CommandClient extends Client {
  public commands: Collection<unknown, unknown>;
}

const client = new CommandClient({
  intents: ["Guilds", "GuildMembers", "GuildMessages"],
});

client.commands = new Collection();

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
  const command = require(filePath);
  // Set a new item in the Collection with the key as the command name and the value as the exported module
  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(
      `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
    );
  }
}

client.on("messageCreate", async (message: Message) => {
  if (message.author.bot) return;
  const msgContent = message.content;
  if (msgContent.startsWith(prefix)) {
    const splited = msgContent.replace(prefix, "").split(" ");
    const command = splited[0];
    const args = splited.slice(1);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  // @ts-ignore
  const command = interaction.client.commands.get(interaction.commandName);

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
