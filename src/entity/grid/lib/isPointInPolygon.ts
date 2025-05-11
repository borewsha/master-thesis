import { Figure, Point } from '@/figures.slice'

export function isPointInPolygon(point: Point, figure: Figure): boolean {
	const { lat, lng } = point.position
	const polygon = figure.points.map(p => p.position)
	let inside = false

	for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
		const { lat: yi, lng: xi } = polygon[i]
		const { lat: yj, lng: xj } = polygon[j]

		const intersect =
			yi > lat != yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi
		if (intersect) inside = !inside
	}

	return inside
}
