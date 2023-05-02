import {type AutocompleteInteraction, type CommandInteraction, type SlashCommandBuilder} from 'discord.js';

export type Command = {
	data: SlashCommandBuilder;
	execute(interaction: CommandInteraction): Promise<void>;
	autocomplete(interaction: AutocompleteInteraction): void;
};
