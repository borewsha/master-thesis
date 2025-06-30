// Алгоритм Lee и восстановление пути
import { Grid, GridCoordinate } from '@/entity/grid/types'

export function leeAlgorithm(grid: Grid, start: GridCoordinate, end: GridCoordinate) {
	const rows = grid.length
	const cols = grid[0].length
	const directions = [
		[0, 1], [1, 0], [0, -1], [-1, 0],
		[1, 1], [1, -1], [-1, 1], [-1, -1]
	]
	const queue = [start]
	grid[start[0]][start[1]].weight = 1
	const prev = Array.from({ length: rows }, () => Array(cols).fill(null))
	while (queue.length > 0) {
		const gridCoordinate = queue.shift()
		if (!gridCoordinate) continue
		const [x, y] = gridCoordinate
		for (const [dx, dy] of directions) {
			const newX = x + dx
			const newY = y + dy
			if (
				newX >= 0 && newX < rows &&
				newY >= 0 && newY < cols &&
				grid[newX][newY].weight === 0
			) {
				grid[newX][newY].weight = grid[x][y].weight + 1
				queue.push([newX, newY])
				prev[newX][newY] = [x, y]
				if (newX === end[0] && newY === end[1]) {
					return reconstructPath(prev, start, end)
				}
			}
		}
	}
	return []
}

export function reconstructPath(prev: any[][], start: GridCoordinate, end: GridCoordinate): Array<number[]> {
	const path = []
	let [x, y] = end
	while (x !== start[0] || y !== start[1]) {
		path.push([x, y])
		;[x, y] = prev[x][y]
	}
	path.push(start)
	path.reverse()
	return path
}
