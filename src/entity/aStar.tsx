import { Point } from '@/figures.slice'

export function aStarMaxWeight(
	matrix: Point[][],
	start: Point,
	end: Point
): Point[] | null {
	// Проверка на пустую матрицу
	if (matrix.length === 0 || matrix[0].length === 0) return null

	// Вспомогательные функции
	const getDistance = (a: Point, b: Point): number => {
		// Евклидово расстояние между точками
		const dLat = a.lat - b.lat
		const dLng = a.lng - b.lng
		return Math.sqrt(dLat * dLat + dLng * dLng)
	}

	const pointsEqual = (a: Point, b: Point): boolean => {
		return a.lat === b.lat && a.lng === b.lng
	}

	const findPointInMatrix = (p: Point): { row: number; col: number } | null => {
		for (let row = 0; row < matrix.length; row++) {
			for (let col = 0; col < matrix[row].length; col++) {
				if (pointsEqual(matrix[row][col], p)) {
					return { row, col }
				}
			}
		}
		return null
	}

	const getNeighbors = (current: Point): Point[] => {
		const pos = findPointInMatrix(current)
		if (!pos) return []

		const { row, col } = pos
		const neighbors: Point[] = []
		const directions = [
			{ dr: -1, dc: 0 }, // вверх
			{ dr: 0, dc: 1 }, // вправо
			{ dr: 1, dc: 0 }, // вниз
			{ dr: 0, dc: -1 } // влево
			// Можно добавить диагонали
		]

		for (const dir of directions) {
			const newRow = row + dir.dr
			const newCol = col + dir.dc

			if (
				newRow >= 0 &&
				newRow < matrix.length &&
				newCol >= 0 &&
				newCol < matrix[0].length
			) {
				neighbors.push(matrix[newRow][newCol])
			}
		}

		return neighbors
	}

	// Инициализация
	const openSet: Node[] = []
	const closedSet: Node[] = []

	const startNode: Node = {
		point: start,
		f: start.weight, // Начинаем с веса стартовой точки
		g: start.weight, // Сумма весов пути
		h: getDistance(start, end),
		parent: null
	}
	openSet.push(startNode)

	while (openSet.length > 0) {
		// Сортируем по убыванию f (ищем максимальный вес)
		openSet.sort((a, b) => b.f - a.f)
		const current = openSet.shift()!

		// Проверка достижения цели
		if (pointsEqual(current.point, end)) {
			// Восстанавливаем путь
			const path: Point[] = []
			let node: Node | null = current
			while (node) {
				path.unshift(node.point)
				node = node.parent
			}
			return path
		}

		closedSet.push(current)

		// Обработка соседей
		const neighbors = getNeighbors(current.point)
		for (const neighbor of neighbors) {
			// Пропускаем уже обработанные точки
			if (closedSet.some(n => pointsEqual(n.point, neighbor))) continue

			// Новая "стоимость" - сумма весов пути
			const tentativeG = current.g + neighbor.weight
			const existingNode = openSet.find(n => pointsEqual(n.point, neighbor))

			if (!existingNode || tentativeG > existingNode.g) {
				const neighborNode: Node = {
					point: neighbor,
					f: 0,
					g: tentativeG,
					h: getDistance(neighbor, end),
					parent: current
				}
				// f = g + h (но g теперь учитывает веса)
				neighborNode.f = neighborNode.g + neighborNode.h

				if (!existingNode) {
					openSet.push(neighborNode)
				}
			}
		}
	}

	// Путь не найден
	return null
}
