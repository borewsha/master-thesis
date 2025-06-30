import { LatLng } from 'leaflet'

export function calculateDistance(point1: LatLng, point2: LatLng): number {
	const R = 6371e3 // Радиус Земли в метрах
	const φ1 = (point1.lat * Math.PI) / 180 // Переводим широту в радианы
	const φ2 = (point2.lat * Math.PI) / 180
	const Δφ = ((point2.lat - point1.lat) * Math.PI) / 180
	const Δλ = ((point2.lng - point1.lng) * Math.PI) / 180

	const a =
		Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
		Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

	return R * c // Расстояние в метрах
}
