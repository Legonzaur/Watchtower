import {type CommandInteraction, SlashCommandBuilder, type AutocompleteInteraction, type ApplicationCommandOptionChoiceData} from 'discord.js';
import {serverlist} from '../../store';
import levenshtein from 'js-levenshtein';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('subscribe')
		.setDescription('Watches the status of a server for you')
		.addStringOption(option =>
			option.setName('servername')
				.setDescription('Server to subscript to')
				.setAutocomplete(true),
		),
	async execute(interaction: CommandInteraction) {
		await interaction.reply('Pong!');
	},
	async autocomplete(interaction: AutocompleteInteraction) {
		const focusedValue = interaction.options.getFocused();
		const servers = Object.values(serverlist);
		const closest = servers.map(server => ({distance: levenshtein(server.name, focusedValue), ...server}));
		closest.sort((a, b) => {
			if (a.distance > b.distance) {
				return 1;
			}

			if (a.distance < b.distance) {
				return -1;
			}

			return 0;
		});
		await interaction.respond(
			closest.slice(0, 10).map(e => ({name: e.name, value: e.name})),
		);
	},
};
