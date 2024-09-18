const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');

async function giveawayRun(interaction, options) {
  const giveawayImage = options.getAttachment('imagi');
  const giveawayTitle = options.getString('prenmiu');
  const giveawayDescription = options.getString('descrichaum') || 'abcdefg manoel gomes teve aqui';
  const giveawayDuration = options.getString('duracaum');
  const giveawayHost = options.getUser('host') || interaction.user;
  const specialRole = options.getRole('cargu_mais_chanssi');
  const specialRoleEntries = options.getInteger('entradas');

  const currentTime = Math.floor(Date.now() / 1000);
  const filePath = './data/giveaway_participants.json';

  if (specialRole && !specialRoleEntries) {
    await interaction.reply({ content: "ce colocou o cargo especiar, mas naum specificu a quãtidardi de entrada. Pliasi, specifique quantidadi d'entradar.", ephemeral: true});
  }

  // Lidar com o reroll
  if (options.getSubcommand() === 'reroll') {
    const giveawayId = options.getString('giveaway_id');

    // Carregar os dados dos participantes do sorteio
    if (!fs.existsSync(filePath)) {
      return interaction.reply({ content: 'Num achei esse sorteiruo.', ephemeral: true });
    }

    const participantsData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // Obter participantes para o giveaway_id específico
    const participantsReal = participantsData[giveawayId]?.participants || [];

    if (participantsReal.length === 0) {
      return interaction.reply({ content: 'Nenhum partincipanti pra refazer.', ephemeral: true });
    }

    // Escolher um novo vencedor aleatoriamente
    const newWinner = participants[Math.floor(Math.random() * participants.length)];
    return interaction.reply({ content: `🎉 O novinhu ganhado é <@${newWinner}>! 🎉`, ephemeral: false });
  }

  if (options.getSubcommand() === 'start') {
    // Calcular a duração do sorteio
    let durationInSeconds = 0;
    const durationValue = parseInt(giveawayDuration.slice(0, -1));
    const durationUnit = giveawayDuration.slice(-1);

    if (durationUnit === 'm') {
      durationInSeconds = durationValue * 60; 
    } else if (durationUnit === 'h') {
      durationInSeconds = durationValue * 60 * 60; 
    } else if (durationUnit === 'd') {
      durationInSeconds = durationValue * 24 * 60 * 60; 
    } else {
      durationInSeconds = durationValue * 60;
    }

    const endTime = currentTime + durationInSeconds; 
    const imageUrl = giveawayImage ? giveawayImage.url : null;

    let description = `${giveawayDescription}\n\nTirmina <t:${endTime}:R>.\n\nHost: ${giveawayHost}`;

    if (specialRole && specialRoleEntries) {
      description += `\n\n<@&${specialRole.id}> tem ${specialRoleEntries}X mais chanssi de ganha!`;
    }
    
    let embed = new EmbedBuilder({
      "title": `**${giveawayTitle}**`,
      "description": description,
      "color": 0x9ab8d1,
      "footer": {
        "text": `Participi clicanu no bortaum abaixu.`,
      }
    });

    if (imageUrl) {
      embed.setImage(imageUrl);
    }

    const joinButton = new ButtonBuilder()
      .setCustomId('joinGiveaway')
      .setLabel('🖊️Entrar')
      .setStyle(ButtonStyle.Success);

    const participantsButton = new ButtonBuilder()
      .setCustomId('participants')
      .setLabel('Participantis')
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(joinButton, participantsButton);

    const message = await interaction.reply({ embeds: [embed], components: [row] });

    let participantsData = {};
    if (fs.existsSync(filePath)) {
      participantsData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }

    const filter = (i) => i.customId === 'joinGiveaway' || i.customId === 'participants';
    const collector = message.createMessageComponentCollector({ filter, time: durationInSeconds * 1000 });

    collector.on('collect', async (i) => {
      const participant = i.user;
      const giveawayId = message.id;

      if (i.customId === 'joinGiveaway') {
        if (!participantsData[giveawayId]) {
          participantsData[giveawayId] = {
            title: giveawayTitle,
            participants: []
          };
        }

        if (!participantsData[giveawayId].participants.includes(participant.id)) {
          participantsData[giveawayId].participants.push(participant.id); 
          fs.writeFileSync(filePath, JSON.stringify(participantsData, null, 2)); 

          await i.reply({ content: 'Tu entrô nu sorteiruo!', ephemeral: true });
        } else {
          participantsData[giveawayId].participants = participantsData[giveawayId].participants.filter(id => id !== participant.id);
          fs.writeFileSync(filePath, JSON.stringify(participantsData, null, 2)); 

          await i.reply({ content: 'Tu sair du sorteiruo!', ephemeral: true });
        }
      } else if (i.customId === 'participants') {
        const isGiveawayEnded = currentTime >= endTime;
        const participants = participantsData[giveawayId]?.participants || [];

        const participantsList = participants.map(id => `<@${id}>`).join('\n') || 'Nenhum participartein inda.';


        await i.reply({ content: messageContent, ephemeral: true });
      }
    });

    collector.on('end', async () => {
      const giveawayId = message.id;
      const participants = participantsData[giveawayId]?.participants || [];
      const winner = participants[Math.floor(Math.random() * participants.length)];

      await interaction.followUp({ content: `O sorteiruo **${giveawayTitle}** cabo! O ganhado foi ${winner ? `<@${winner}>` : 'ninguein! Naum participauram... 😭'}`, ephemeral: false });
    });
  }  
}

module.exports = { giveawayRun };