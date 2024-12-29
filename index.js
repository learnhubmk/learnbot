// functionality we want:
// when someone joins -> send them a boilerplate text with instructions
// /projects -> get active projects being worked on
// /project <projectName> -> get more info on the project & status, from projects forum
// /joinProject <projectName> -> waiting from approval from admin
// /onboard - take next steps in becoming part of the community
// /help - list of commands available
// /language - mk/en - not needed
// /misc <type> event / movies / what have you

// roles - by default, guest - user has to select via command
// /mentor - do you have 5+ experience, confident to undertake a small group, project idea you wanna develop
// /student - do you want to learn and improve your skills?

// frameworks/languages
// /framework <frameworkList> - automatically generate and assign vanity roles


//databaza so storage na user info
const messages = require('./data/messages.json');
const {spamRev} = require("./discord/reusable");

const {Client, Events, GatewayIntentBits, REST, Routes, IntentsBitField} = require('discord.js');
const {compileCommands} = require("./commands");
const channels = require("./data/channels.json");
const {setupDB, mockData} = require("./database/setup");
const token = process.env.DISCORD_TOKEN;
//todo update intents when needed, right now it's just hardcoded for testing purposes
const intents = new IntentsBitField();
const client = new Client({intents: 3});

const commands = compileCommands();
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const command = commands.filter(command => command.data.name.includes(interaction.commandName))[0];
    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await spamRev(interaction, client.users.cache)
            .then(async () => {
                await command.execute(interaction);
            }).catch((error) => {
                console.log("error executing command", command);
            })
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({content: 'There was an error while executing this command!', ephemeral: true});
        } else {
            await interaction.reply({content: 'There was an error while executing this command!', ephemeral: true});
        }
    }
});

client.on(Events.GuildMemberAdd, async guildMember => {
    await guildMember.user.send(messages.welcome.join("\n").replace("%username%", guildMember.user.id));
    await guildMember.user.send(messages.onboarding_steps.join("\n").replace("%channel%", channels.introduce_yourself));
    await guildMember.user.send(messages.frameLangs.intro
        + "\n" + messages.frameLangs.info
        + "\n" + messages.frameLangs.other
        + "\n" + messages.projects.time
    );
})

setupDB()
    .then(() => {
        console.log("db successfully started");
        console.log("starting bot");
        client.login(token);
        console.log("bot successfully started");
    })