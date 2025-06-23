// Утилиты для работы с grid
import { isPointInPolygon } from '@/entity/grid/lib/isPointInPolygon'
import { Grid } from '@/entity/grid/types'
import { Figure } from '@/figures.slice'
import { Point } from '@/figures.slice'

export const fillGridPoints = (
	grid: Grid,
	size: number,
	figures: Figure[]
): void => {
	for (let i = -size; i < size * 2; i++) {
		for (let j = -size; j < size; j++) {
			const position = grid[i + size][j + size].position
			const ins = figures
				.filter((f1: Figure) => f1.type === 'polygon')
				.map((f1: Figure) => isPointInPolygon({ position }, f1))
			const isInside = ins.some((i: boolean) => i)
			grid[i + size][j + size].weight = isInside ? -1 : 0
		}
	}
}

export function createExpandedGrid(originalGrid: Grid, path: Point[]): Grid {
	if (path.length === 0) return originalGrid
	let minLat = path[0].position.lat
	let maxLat = path[0].position.lat
	let minLng = path[0].position.lng
	let maxLng = path[0].position.lng
	for (const point of path) {
		minLat = Math.min(minLat, point.position.lat)
		maxLat = Math.max(maxLat, point.position.lat)
		minLng = Math.min(minLng, point.position.lng)
		maxLng = Math.max(maxLng, point.position.lng)
	}
	let minRowIndex = originalGrid.length - 1
	let maxRowIndex = 0
	let minColIndex = originalGrid[0].length - 1
	let maxColIndex = 0
	for (let i = 0; i < originalGrid.length; i++) {
		for (let j = 0; j < originalGrid[i].length; j++) {
			const cell = originalGrid[i][j]
			if (
				cell.position.lat >= minLat &&
				cell.position.lat <= maxLat &&
				cell.position.lng >= minLng &&
				cell.position.lng <= maxLng
			) {
				minRowIndex = Math.min(minRowIndex, i)
				maxRowIndex = Math.max(maxRowIndex, i)
				minColIndex = Math.min(minColIndex, j)
				maxColIndex = Math.max(maxColIndex, j)
			}
		}
	}
	const expandedMinRow = Math.max(0, minRowIndex - 1)
	const expandedMaxRow = Math.min(originalGrid.length - 1, maxRowIndex + 1)
	const expandedMinCol = Math.max(0, minColIndex - 1)
	const expandedMaxCol = Math.min(originalGrid[0].length - 1, maxColIndex + 1)
	const newGrid: Grid = []
	for (let i = expandedMinRow; i <= expandedMaxRow; i++) {
		const row = []
		for (let j = expandedMinCol; j <= expandedMaxCol; j++) {
			row.push({ ...originalGrid[i][j] })
		}
		newGrid.push(row)
	}
	return newGrid
}

export function getGridPerimeter(grid: Grid): { lat: number; lng: number }[] {
	if (grid.length === 0 || grid[0].length === 0) return []
	const perimeter: { lat: number; lng: number }[] = []
	const rows = grid.length
	const cols = grid[0].length
	for (let j = 0; j < cols; j++) {
		perimeter.push({ ...grid[0][j].position })
	}
	for (let i = 1; i < rows; i++) {
		perimeter.push({ ...grid[i][cols - 1].position })
	}
	if (rows > 1) {
		for (let j = cols - 2; j >= 0; j--) {
			perimeter.push({ ...grid[rows - 1][j].position })
		}
	}
	if (cols > 1) {
		for (let i = rows - 2; i > 0; i--) {
			perimeter.push({ ...grid[i][0].position })
		}
	}
	return perimeter
}
