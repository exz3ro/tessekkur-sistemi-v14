const db = require("croxydb");
const Discord = require("discord.js");
const config = require("../config.js");
module.exports = {
  name: "teşekkür-bilgi",
  description: "Teşekkürler hakkında bilgi verir.",
  options: [
    {
      type: 6,
      name: "üye",
      description: "Bir üye seç.",
      required: false
    }
  ],
  run: async (client, interaction) => {

    let aways = config.aways || [];

    let user = interaction.options.getUser('üye') || interaction.user;

    let data = db.get(`thanks.${interaction.guild.id}.${user.id}`) || [];

    let embed = new Discord.EmbedBuilder()
    embed.setTitle(`${user.username} Ödül Listesi`)
    embed.setColor("Random")
    embed.setThumbnail(user.displayAvatarURL())
    embed.setTimestamp()
    for (let i = 0; i < aways.length; i++) {
      embed.addFields({ name: `${i + 1}. Ödül`, value: `<@&${aways[i].role}>\n${data.length >= aways[i].thanks_size ? "✔️" : "❌ | " + Number(aways[i].thanks_size - data?.length) + " Kaldı"}`, inline: true })
    }
    interaction.reply({ embeds: [embed] })

  },
};