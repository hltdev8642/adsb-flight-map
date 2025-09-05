import Decoder from '$lib/Decoder.js';
import {currentApi} from "../../../../managers/StoreManager.js";


export const GET = async ({ request, url }) => {
	const southLat = url.searchParams.get('southLat');
	const northLat = url.searchParams.get('northLat');
	const westLon = url.searchParams.get('westLon');
	const eastLon = url.searchParams.get('eastLon');
	const headers = url.searchParams.get('headers');

	try {
		console.log('Server: Fetching aircraft data for bounds:', { southLat, northLat, westLon, eastLon });
		console.log('Server: Current API:', currentApi);

		const options = { method: 'GET', headers: JSON.parse(headers) };

		const baseUrl = `https://${currentApi}/re-api`;
		const apiUrl = `${baseUrl}/?binCraft&zstd&box=${southLat},${northLat},${westLon},${eastLon}`;

		console.log('Server: Making request to:', apiUrl);

		const response = await fetch(apiUrl, options);
		console.log('Server: External API response status:', response.status);

		if (response.ok) {
			console.log('Server: Response OK, decoding data...');
			const buffer = await response.arrayBuffer();
			console.log('Server: Buffer size:', buffer.byteLength);

			const data = await Decoder.decode(buffer);
			console.log('Server: Decoded data successfully');
			return successResponse(data);
		} else if (response.status === 429) {
			console.log('Server: Rate limited by external API');
			return rateLimitResponse();
		} else {
			console.log('Server: External API error:', response.status, response.statusText);
			return errorResponse(`External API error: ${response.status} ${response.statusText}`);
		}
	} catch (error) {
		console.error('Server: Error in getByBounds:', error);
		return errorResponse(error.message || error);
	}
};

function jsonResponse(body, status) {
	return new Response(JSON.stringify(body), { status });
}

function successResponse(data) {
	return jsonResponse({ message: 'Fetch by bound successfully executed', data }, 200);
}

function errorResponse(error) {

	return new Response(JSON.stringify({ message: 'An error occurred while fetching by bound', error }), { status: 500 });
}

function rateLimitResponse() {
	return new Response(JSON.stringify({ message: 'Rate limited by external API', error: 'Too many requests' }), { status: 429 });
}
