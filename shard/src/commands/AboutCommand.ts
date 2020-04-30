import { ParsedMessage } from "discord-command-parser";
import Discord from "discord.js";
import Command from "../Command";
import CommandManager from "../CommandManager";
import Guild from "../models/Guild";
import Utils, { GuildMessage } from "../Utils";

export default class AboutCommand extends Command {
  public name = "about";
  public aliases = ["info", "information"];
  public syntax = "about";
  public description = "View information about this bot";
  public category = CommandManager.Categories.GENERAL;

  public async run(
    { message }: ParsedMessage<GuildMessage>,
    _guildDatabase: Guild
  ) {
    const { channel } = message;
    const packageJson = Utils.getPackageJson();

    const items: { [name: string]: string } = {
      "Bot Library": "Discord.js",
      "Library Version": Discord.version,
      "Bot Version": packageJson.version,
      Owner: packageJson.owner,
      Author: packageJson.author,
      "Shard Count": `${this.instance.networkManager.total} shards`
    };

    const embed = {
      color: Utils.Colors.BLUE,
      title: `${this.instance.client.user?.username} | Discord Bump Bot`,
      thumbnail: {
        url: this.instance.client.user?.displayAvatarURL()
      },
      fields: Object.keys(items).map((key) => ({
        name: key,
        value: `\`\`\`${items[key]}\`\`\``,
        inline: true
      })),
      footer: {
        text: Utils.getCommonFooter()
      }
    };
    return void (await channel.send({ embed }));
  }
}
