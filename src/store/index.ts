type Server = {
	description: string;
	hasPassword: boolean;
	id: string;
	lastHeartbeat: number;
	map: string;
	maxPlayers: number;
	modInfo: {Mods: any[]};
	name: string;
	playerCount: number;
	playlist: string;
	region: string;
};

export let serverlist: Server[] = [];

async function fetchServerData() {
	serverlist = await (await fetch('https://northstar.tf/client/servers')).json() as Server[];
}

void fetchServerData();
setInterval(fetchServerData, 60000);
