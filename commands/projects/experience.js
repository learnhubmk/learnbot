const {SlashCommandBuilder} = require('discord.js');
const frameLangs = require("../../data/frameLangs.json");
const messages = require("../../data/messages.json");
const {addExperience, getExperience} = require("../../database/functions");

const addExperiences = async (interaction) => {
    let frameLang = interaction.options.getString("skill");
    let experience = interaction.options.getNumber("years");
    await addExperience(interaction.user.id, interaction.user.displayName, frameLang, experience)
        .then(async () => {
            await listExperiences(interaction);
        }).catch(async () => {
            await listExperiences(interaction); //todo should give different message but alas, cba
        })
}

const listExperiences = async (interaction) => {
    await getExperience(interaction.user.id)
        .then(async (experience) => {
            await interaction.reply({content: messages.commands.success, ephemeral: true});
            await interaction.user.send(
                messages.experience.current
                + experience.map(exp =>
                    messages.experience.experience
                        .replace("%experience%", exp.skill)
                        .replace("%years%", exp.years)
                ).join("")
            );
        })
};
module.exports = {
    data: new SlashCommandBuilder()
        .setName('experience')
        .setDescription('Tell me more about your experience!')
        .addSubcommand(subcommand =>
            subcommand
                .setName("select")
                .setDescription("Pick from the listed options!")
                .addStringOption(option =>
                    option.setName('skill')
                        .setDescription("list of most popular languages and frameworks")
                        .setRequired(true)
                        .addChoices(frameLangs.languages
                            .concat(frameLangs.frameworks)
                            .concat(frameLangs.databases)
                            .map(frameLang => {
                                return {"name": frameLang, "value": frameLang}
                            }))
                )
                .addNumberOption(option =>
                    option.setName("years")
                        .setDescription("years of experience")
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("other")
                .setDescription("Pick your own options!")
                .addStringOption(option =>
                    option.setName('skill')
                        .setDescription("any skill you like")
                        .setRequired(true)
                )
                .addNumberOption(option =>
                    option.setName("years")
                        .setDescription("years of experience")
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("list")
                .setDescription("Lists all your experiences!")
        ),
    async execute(interaction) {
        let subcommand = interaction.options.getSubcommand();
        switch (subcommand) {
            case "other":
            case "select": {
                await addExperiences(interaction);
                break;
            }
            case "list": {
                await listExperiences(interaction);
                break;
            }
        }
    },
};