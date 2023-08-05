import {
  APIApplicationCommandInteraction,
  CommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("ボットにピンを飛ばす");
export const execute = async (interaction: CommandInteraction) => {
  await interaction.reply("pong");
};
