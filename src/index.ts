interface Env {
	MY_KV: KVNamespace;
	LAST_FETCHED_DATE: KVNamespace;
}
export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const last_time = await env.LAST_FETCHED_DATE.get("eb57608d194a48b0948222e2092cf250")
		const value = await env.MY_KV.get("db5b39fe125640d5b4fbf6ba2b15bc61");
		if (Date.now() > parseInt(String(last_time ?? 0)) + 60000) {
			const url = await getURL("<access_token>")
			await env.LAST_FETCHED_DATE.put("eb57608d194a48b0948222e2092cf250", String(Date.now()))
			console.log("fetch occured")
			if (url !== value) {
				await env.MY_KV.put("db5b39fe125640d5b4fbf6ba2b15bc61", url);
				console.log('value changed');
			}
		}
		return new Response(value);
	},
};
interface response {
	channel_id: string;
	hls: [{
		connection_id: string;
		playlist_url: string;
	}];
}
async function getURL(access_token: string): Promise<string> {
	const res = await fetch("https://live-api.imageflux.jp", {
		method: "POST",
		headers: {
			"Content-Type": "application",
			"X-Sora-Target": "ImageFlux_20200207.ListPlaylistURLs",
			"Authorization": `Bearer ${access_token}`
		},
		body: JSON.stringify({
			"channel_id": "<channel_id>"
		})
	})
	const data = await res.json() as response;
	return data.hls[0].playlist_url;
}