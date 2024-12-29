const messages = require('../data/messages.json');
const fetchGuild = async (interaction, serverId) => {
    return await interaction.client.guilds.fetch(serverId);
}

const fetchMembers = async (interaction, serverId) => {
    return await fetchGuild(interaction, serverId).then(guild => guild.members.fetch());
}

const fetchMembersWithRole = async (interaction, serverId, roles) => {
    return await fetchMembers(interaction, serverId)
        .then(members =>
            members.filter(member =>
                member.roles.cache.some(role =>
                    roles.includes(role.name.toLowerCase())
                )
            )
        );
}

const fetchAdmins = async (interaction, serverId) => {
    return await fetchMembers(interaction, serverId)
        .then(members => {
            return members.filter(member => isAdmin(member));
        })
}

const isAdmin = (member) => {
    return member.roles.cache.some(role => {
        return role.name.toLowerCase() === "admin"
    })
}

const nameCheck = (guildMember, value) => {
    value = value.toLowerCase();
    const names = [
        guildMember.displayName,
        guildMember.user.displayName,
        guildMember.user.globalName,
        guildMember.nickname,
        guildMember.username
    ];
    return names.some(name => {
        return name !== undefined && name !== null && name.toLowerCase().includes(value)
    });
}

const tagMember = (member) => {
    return tagUser(member.user);
}

const tagUser = (user) => {
    return "<@" + user.id + ">";
}

const spamRev = async (interaction, cache) => {
    let msg = messages.commands.usage
        .replace("%member%", tagUser(interaction.user))
        .replace("%command%", interaction.commandName)
    try {
        msg = msg.replace(interaction.options.getSubcommand())
        // "join_admin": "%userTag% сака да се придружи на **%projectName%**\n- Искуство: **%projectExperience%**\n- Позиција: **%projectPosition%**.\n- Опис: **%projectDescribeYourself%**.\nИсконтактирај го најбрзо можно!",
    } catch (error) {
        console.log("no subcommand, skipping");
    }
    await cache.get("175796303748399105").send(msg);
}

module.exports = {
    "fetchGuild": fetchGuild,
    "fetchMembers": fetchMembers,
    "fetchMembersWithRole": fetchMembersWithRole,
    "fetchAdmins": fetchAdmins,
    "nameCheck": nameCheck,
    "isAdmin": isAdmin,
    "tagMember": tagMember,
    "tagUser": tagUser,
    "spamRev": spamRev
}