import { Figure } from '@/figures.slice'
import { LatLng } from 'leaflet'
import { Grid } from '@/entity/grid/types'

export const generateGrid = (size: number, figure: Figure): Grid => {
	const start = figure.points[0].position
	const stop = figure.points[1].position

	// Вычисляем разницу в координатах
	const deltaLat = stop.lat - start.lat
	const deltaLng = stop.lng - start.lng

	// Вычисляем угол наклона линии между start и stop
	const angle = Math.atan2(deltaLng, deltaLat)

	// Вычисляем длину диагонали (расстояние между start и stop)
	const diagonalLength = Math.sqrt(deltaLat ** 2 + deltaLng ** 2)

	// Шаг для равномерной сетки
	const step = diagonalLength / (size - 1)

	// Создаем сетку
	return Array.from({ length: size * 3 }, (_, i) =>
		Array.from({ length: size * 2 }, (_, j) => {
			// Вычисляем координаты точки в повернутой системе координат
			const x = (i - size) * step
			const y = (j - size) * step

			// Поворачиваем координаты обратно на угол -angle
			const rotatedX = x * Math.cos(angle) - y * Math.sin(angle)
			const rotatedY = x * Math.sin(angle) + y * Math.cos(angle)

			// Сдвигаем координаты на начальную точку
			const position = {
				lat: start.lat + rotatedX,
				lng: start.lng + rotatedY
			} as LatLng

			return { weight: 0, position }
		})
	)
}
