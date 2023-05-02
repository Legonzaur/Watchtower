import fs from 'fs';
import path from 'path';
import {Client, Events, Collection, GatewayIntentBits} from 'discord.js';
import {token} from '../config';

import {type Command} from './types';

console.log('Bot is starting...');

const client = new Client({
	intents: [GatewayIntentBits.Guilds],
});

client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

// Command files handling
const commands = new Collection<string, Command>();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

void Promise.all(commandFolders.map(async file => {
	const commandsPath = path.join(foldersPath, file);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	const commandObjects = await Promise.all(commandFiles.map(async e => import(path.join(commandsPath, e))));
	for (const command of commandObjects) {
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			commands.set((command as Command).data.name, command as Command);
		} else {
			console.log('[WARNING] One command is missing a required "data" or "execute" property.');
		}
	}
})).then(() => {
	client.on(Events.InteractionCreate, async interaction => {
		if (interaction.isChatInputCommand()) {
			const command = commands.get(interaction.commandName);
			if (!command) {
				console.error(`No command matching ${interaction.commandName} was found.`);
				return;
			}

			try {
				await command.execute(interaction);
			} catch (error) {
				console.error(error);
				if (interaction.replied || interaction.deferred) {
					await interaction.followUp({content: 'There was an error while executing this command!', ephemeral: true});
				} else {
					await interaction.reply({content: 'There was an error while executing this command!', ephemeral: true});
				}
			}
		} else if (interaction.isAutocomplete()) {
			const command = commands.get(interaction.commandName);

			if (!command) {
				console.error(`No command matching ${interaction.commandName} was found.`);
				return;
			}

			try {
				command.autocomplete(interaction);
			} catch (error) {
				console.error(error);
			}
		}
	});

	void client.login(token as string);
});

