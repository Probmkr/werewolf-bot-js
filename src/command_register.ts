import { REST, Routes } from "discord.js";
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

dotenv.config();

const clientId = process.env.BOT_ID;
const token = process.env.BOT_TOKEN;

const commands = [];
const commandsFolder = path.join(__dirname, "commands");
const commandsPaths = fs.readdirSync(commandsFolder);
for (const commandsPath of commandsPaths) {
  const commandFiles = fs
    .readdirSync(path.join(commandsFolder, commandsPath))
    .filter((file) => file.endsWith(".ts"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsFolder, commandsPath, file);
    import(filePath)
      .then((command) => {
        if ("data" in command && "execute" in command) {
          commands.push(command.data.toJSON());
        } else {
          console.log(
            `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
          );
        }
      })
      .then(() => {
        // Construct and prepare an instance of the REST module
        const rest = new REST().setToken(token);

        // and deploy your commands!
        (async () => {
          try {
            console.log(
              `Started refreshing ${commands.length} application (/) commands.`
            );

            // The put method is used to fully refresh all commands in the guild with the current set
            const data = (await rest.put(Routes.applicationCommands(clientId), {
              body: commands,
            })) as [];

            console.log(
              `Successfully reloaded ${data.length} application (/) commands.`
            );
          } catch (error) {
            // And of course, make sure you catch and log any errors!
            console.error(error);
          }
        })();
      });
  }
}
