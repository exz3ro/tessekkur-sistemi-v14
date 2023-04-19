const db = require("croxydb");
const Discord = require("discord.js");
const config = require("../config.js");
module.exports = {
  name: "teşekkürler",
  description: "Bir üyeye teşekkür etmenizi sağlar.",
  options: [
    {
      type: 6,
      name: "üye",
      description: "Bir üye seç.",
      required: true
    },
    {
      type: 3,
      name: "sebep",
      description: "Neden teşekkür ediyorsunuz?",
      required: true
    }
  ],
  run: async (client, interaction) => {

    let aways = config.aways || [];

    let user = interaction.options.getUser('üye')
    let reason = interaction.options.getString('sebep')

    if (!user) return interaction.reply({ content: "Bir üye seçmelisin.", ephemeral: true })
    if (!reason) return interaction.reply({ content: "Neden teşekkür ediyorsunuz?", ephemeral: true })

    if (user?.id === interaction.user.id) return interaction.reply({ content: "Kendine teşekkür edemezsin. :x:", ephemeral: true })
    //user bot warn 
    if (user?.bot) return interaction.reply({ content: "Botlara teşekkür edemezsin. :x:", ephemeral: true })

    if (reason?.length > 100) return interaction.reply({ content: "Sebep 100 karakterden fazla olamaz.", ephemeral: true })

    //5h timeout
    let data = db.get(`thanks.${interaction.guild.id}.${user.id}`) || [];
    let control = false
    await data.filter(x => x.user === interaction.user.id).forEach(async x => {
      if (Date.now() - x.date < 1000 * 60 * 60 * 4) {
        control = true
      }
    })
    if (control) return interaction.reply({ content: "4 saatte bir teşekkür edebilirsin.", ephemeral: true })


    data.push({
      user: interaction.user.id,
      reason: reason,
      channel: interaction.channel.id,
      date: Date.now()
    })
    db.set(`thanks.${interaction.guild.id}.${user.id}`, data)

    interaction.reply({ content: `${user} adlı üyeye teşekkür edildi. Seninle birlikte ${data.length} kişi teşekkür etti. 🎉` })

    const log = client.channels.cache.get(config.log)
    if (!log) return;

    for (let i = 0; i < aways.length; i++) {
      awardControl(user, interaction.guild, aways[i].thanks_size, aways[i].role)
    }

    const button = new Discord.ActionRowBuilder()
      .addComponents(new Discord.ButtonBuilder()
        .setLabel("Ödüller")
        .setStyle(Discord.ButtonStyle.Success)
        .setEmoji("📋")
        .setCustomId("aways"))

    const embed = new Discord.EmbedBuilder()
    embed.setThumbnail(user.displayAvatarURL({ dynamic: true }))
    embed.setDescription(`${interaction.user} adlı üye sana teşekkür etti.
Teşekkür sebebi: \`${reason}\`
Kanal: <#${interaction.channel.id}>
Toplam \`${data.length}\` teşekkür sayısına ulaştın. :tada:`)
    embed.setTimestamp()
    embed.setColor("Random")
    embed.setFooter({ text: "Teşekkür etmek için /teşekkürler" })
    log.send({ embeds: [embed], components: [button], content: `${user} :tada::tada:` }).then(msg => {
      msg.react("🎉")
    })
  },
};

function awardControl(user, guild, thanks_size, role) {
  let data = db.get(`thanks.${guild.id}.${user.id}`) || [];
  if (data.length >= thanks_size) {
    let role = guild.roles.cache.get(role)
    if (!role) return;
    if (user.roles.cache.has(role.id)) return;
    user.roles.add(role).cacth(e => { })
  }
}