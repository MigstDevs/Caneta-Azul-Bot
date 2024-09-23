const express = require("express");
const { Client, GatewayIntentBits, ActivityType } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const fs = require("fs");
const { giveawayRun } = require("./commands/giveaway.js");

const app = express();
const clientId = process.env.clientId;
const token = process.env.token;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

app.listen(1104, () => {
  console.log(
    "Eu sou o Manoel Gomes! CANETA AZUL...",
  );
});

app.get("/", (req, res) => {
  res.send(
    "Eu sou o Manoel Gomes! CANETA AZUL...",
  );
});

const rest = new REST({ version: "10" }).setToken(token);

client.on("ready", async () => {
  console.log(`Olá! Eu tô online!`);

  client.user.setPresence({
    activities: [
      {
        name:  `caneta azullll, azul canetaaaa`,
        type: ActivityType.Watching,
      },
    ],
    status: "online",
  });

  const commands = [
    {
      name: "sorteio",
      description: "Gerencie os sorteios.",
      options: [
        {
          type: 1,
          name: "fazer",
          description: "Caneta azul vai escrever um sorteio procê.",
          options: [
            {
              name: "duracaum",
              description: "Qual é a duracaum do sorteiruo? (1m, 1h, 1d)",
              type: 3,
              required: true,
            },
            {
              name: "prenmiu",
              description: "O prenmiu do sorteiruo. (Vai aparecê no título)",
              type: 3,
              required: true,
            },
            {
              name: "host",
              description: "Qual pessoa eh o dono host desse sorteiu lindu?",
              type: 6,
              required: false,
            },
            {
              name: "cargu_mais_chanssi",
              description: "Qual vá ser o cargu especiar que terar mais entradas (mais chanssi de ganhá)?",
              type: 8,
              required: false,
            },
            {
              name: "entradas",
              description: "Quantas entradas tu vá querê amigu pro cargu cum mais chanssi?",
              type: 4,
              required: false,
            },
            {
              name: "imagi",
              description: "A imagi que vai aparecer nu sorteiruo.",
              type: 11,
              required: false,
            },
            {
              name: "descrichaum",
              description: "A descrichaum do sorteiruo.",
              type: 3,
              required: false,
            },
          ],
        },
        {
          type: 1,
          name: "refazer",
          description: "Escolhi 1 novo gãhadou prum sorteiruo existinti.",
          options: [
            {
              name: "giveaway_id",
              description: "ID da mensagi do sorteiruo.",
              type: 3,
              required: true,
            },
          ],
        },
      ],
    },
  ];

  try {
    console.log("Comecei a atualizar os comandos barra.");

    await rest.put(Routes.applicationCommands(clientId), {
      body: commands,
    });

    console.log("Terminei de atualizar os comandos barra.");
  } catch (error) {
    console.error(error);
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName, options } = interaction;
  switch (commandName) {
    case "sorteio":
      giveawayRun(interaction, options);
      break;
  }
});

client.login(token);