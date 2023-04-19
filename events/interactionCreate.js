const { InteractionType } = require("discord.js");
const Discord = require("discord.js");
const db = require("croxydb")
const fs = require("fs");
const config = require("../config.js");
module.exports = async (client, interaction) => {
  if (!interaction.guild) return;
  if (interaction.user.bot) return;

  if (interaction.type === InteractionType.ApplicationCommand) {
    fs.readdir("./commands", (err, files) => {
      if (err) throw err;
      files.forEach(async (f) => {
        let props = require(`../commands/${f}`);
        if (interaction.commandName.toLowerCase() === props.name.toLowerCase()) {
          try {
            return props.run(client, interaction);
          } catch (e) {
            return interaction.reply({ content: `ERROR\n\n\`\`\`${e.message}\`\`\``, ephemeral: true }).catch(e => { })
          }
        }
      });
    });
  }

  //user info
  if (interaction.type === InteractionType.MessageComponent) {
    if (interaction.customId === "aways") {
      let aways = config.aways || [];

      let data = db.get(`thanks.${interaction.guild.id}.${interaction.user.id}`) || [];
      let embed = new Discord.EmbedBuilder()
      embed.setTitle(`${interaction.user.username} Ödül Listesi`)
      embed.setColor("Random")
      embed.setThumbnail(interaction.user.displayAvatarURL())
        .setTimestamp()
      for (let i = 0; i < aways.length; i++) {
        embed.addFields({ name: `${i + 1}. Ödül`, value: `<@&${aways[i].role}>\n${data.length >= aways[i].thanks_size ? "✔️" : "❌ | " + Number(aways[i].thanks_size - data?.length) + " Kaldı"}`, inline: true })
      }
      interaction.reply({ embeds: [embed], ephemeral: true })
    }
  }

}