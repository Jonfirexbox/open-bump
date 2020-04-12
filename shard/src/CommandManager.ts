import parser from "discord-command-parser";
import Discord from "discord.js";
import Command from "./Command";
import AboutCommand from "./commands/AboutCommand";
import BumpCommand from "./commands/BumpCommand";
import HelpCommand from "./commands/HelpCommand";
import NsfwCommand from "./commands/NsfwCommand";
import PreviewCommand from "./commands/PreviewCommand";
import SetChannelCommand from "./commands/SetChannelCommand";
import SetDescriptionCommand from "./commands/SetDescriptionCommand";
import SetInviteCommand from "./commands/SetInviteCommand";
import config from "./config";
import OpenBump from "./OpenBump";
import Utils from "./Utils";

export default class CommandManager {
  private commands: { [name: string]: Command } = {};

  constructor(private instance: OpenBump) {
    this.registerCommands();
  }

  public async run(message: Discord.Message) {
    if (!message.author || message.author.bot || !message.guild) return;

    const prefixes = [
      config.settings.prefix,
      String(this.instance.client.user)
    ];
    const guildDatabase = await Utils.ensureGuild(message.guild);
    if (guildDatabase.features.find(({ feature }) => feature === "PREFIX"))
      if (guildDatabase.prefix) prefixes.push(guildDatabase.prefix);

    const parsed = parser.parse(message, config.settings.prefix, {});
    if (parsed.success) {
      const command = this.getCommand(parsed.command);
      if (!command) return;

      try {
        await command.run(parsed, guildDatabase);
      } catch (error) {
        const embed = Utils.errorToEmbed(error);
        await message.channel.send({ embed });
      }
    }
  }

  private registerCommands() {
    this.registerCommand(new AboutCommand(this.instance));
    this.registerCommand(new BumpCommand(this.instance));
    this.registerCommand(new HelpCommand(this.instance));
    this.registerCommand(new NsfwCommand(this.instance));
    this.registerCommand(new PreviewCommand(this.instance));
    this.registerCommand(new SetChannelCommand(this.instance));
    this.registerCommand(new SetDescriptionCommand(this.instance));
    this.registerCommand(new SetInviteCommand(this.instance));
  }

  private registerCommand(command: Command) {
    this.commands[command.name.toLowerCase()] = command;
  }

  public getCommand(name: string) {
    let command: Command | undefined = this.commands[name.toLowerCase()];
    if (command) return command;
    command = Object.values(this.commands).find((command) =>
      command.aliases?.includes(name.toLowerCase())
    );
    return command;
  }
}