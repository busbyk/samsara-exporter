const SAMSARA_BASE_URL = 'https://api.samsara.com';

async function gatherResponse(response: Response) {
	const { headers } = response;
	const contentType = headers.get('content-type') || '';
	if (contentType.includes('application/json')) {
		return { contentType, result: await response.json() };
	}
	return { contentType, result: await response.text() };
}

export async function fetchSamsara(url: string, apiKey: string): Promise<any> {
	try {
		const headers = {
			Authorization: `Bearer ${apiKey}`,
			'Content-Type': 'application/json',
		};

		const response = await fetch(url, { headers });

		if (!response.ok) {
			throw new Error(`${response.status} | ${response.statusText}`);
		}

		const { result } = await gatherResponse(response);

		return result;
	} catch (error) {
		throw new Error(`Failed to fetch from Samsara: ${error}`);
	}
}

function metersToMiles(meters: number): number {
	return meters / 1609.344;
}

export async function getAllAssets(apiKey: string) {
	try {
		const listVehiclesResult = await fetchSamsara(`${SAMSARA_BASE_URL}/fleet/vehicles`, apiKey);
		const vehicles = listVehiclesResult.data;

		const vehiclesStatsResult = await fetchSamsara(`${SAMSARA_BASE_URL}/fleet/vehicles/stats?types=obdOdometerMeters`, apiKey);
		const vehiclesStats = vehiclesStatsResult.data;

		const vehiclesWithStats = vehicles.map((vehicle: any) => {
			const stats = vehiclesStats.find((stat: any) => stat.id === vehicle.id);
			return {
				...vehicle,
				diagnostics: {
					obdOdometerMeters: stats.obdOdometerMeters,
					obdOdometerMiles: {
						time: stats.obdOdometerMeters.time,
						value: metersToMiles(stats.obdOdometerMeters.value),
					},
				},
			};
		});

		const listTrailersResult = await fetchSamsara(`${SAMSARA_BASE_URL}/fleet/trailers`, apiKey);
		const trailers = listTrailersResult.data;

		const trailersStatsResult = await fetchSamsara(`${SAMSARA_BASE_URL}/beta/fleet/trailers/stats?types=gpsOdometerMeters`, apiKey);
		const trailersStats = trailersStatsResult.data;

		const trailersWithStats = trailers.map((trailer: any) => {
			const stats = trailersStats.find((stat: any) => stat.id === trailer.id);

			if (!stats) {
				return trailer;
			}

			return {
				...trailer,
				diagnostics: {
					gpsOdometerMeters: stats.gpsOdometerMeters,
					gpsOdometerMiles: {
						time: stats.gpsOdometerMeters.time,
						value: metersToMiles(stats.gpsOdometerMeters.value),
					},
				},
			};
		});

		const listEquipmentsResult = await fetchSamsara(`${SAMSARA_BASE_URL}/fleet/equipment`, apiKey);
		const equipment = listEquipmentsResult.data;

		const equipmentStatsResult = await fetchSamsara(`${SAMSARA_BASE_URL}/fleet/equipment/stats?types=gpsOdometerMeters`, apiKey);
		const equipmentStats = equipmentStatsResult.data;

		const equipmentWithStats = equipment.map((equip: any) => {
			const stats = equipmentStats.find((stat: any) => stat.id === equip.id);
			return {
				...equip,
				diagnostics: {
					gpsOdometerMeters: stats.gpsOdometerMeters,
					gpsOdometerMiles: {
						time: stats.gpsOdometerMeters.time,
						value: metersToMiles(stats.gpsOdometerMeters.value),
					},
				},
			};
		});

		return {
			vehicles: vehiclesWithStats,
			trailers: trailersWithStats,
			equipment: equipmentWithStats,
		};
	} catch (err) {
		console.error('Failed to get all assets from Samsara, error: ', err);
		throw err;
	}
}
