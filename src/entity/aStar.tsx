import { Point } from '@/figures.slice'

// A* для судов: минимизация (1-weight) + штраф за поворот, без разворотов
export function aStarMaxWeight(
    matrix: Point[][],
    start: Point,
    end: Point
): Point[] | null {
    if (matrix.length === 0 || matrix[0].length === 0) return null

    const getDistance = (a: Point, b: Point): number => {
        const dLat = a.position.lat - b.position.lat
        const dLng = a.position.lng - b.position.lng
        return Math.sqrt(dLat * dLat + dLng * dLng)
    }

    const pointsEqual = (a: Point, b: Point): boolean => a.id === b.id

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

    // Направления: dr, dc, label
    const directions = [
        { dr: -1, dc: 0, label: 'N' },
        { dr: 0, dc: 1, label: 'E' },
        { dr: 1, dc: 0, label: 'S' },
        { dr: 0, dc: -1, label: 'W' },
        { dr: -1, dc: -1, label: 'NW' },
        { dr: -1, dc: 1, label: 'NE' },
        { dr: 1, dc: -1, label: 'SW' },
        { dr: 1, dc: 1, label: 'SE' }
    ]

    const getNeighbors = (current: Point): { point: Point, dir: string }[] => {
        const pos = findPointInMatrix(current)
        if (!pos) return []
        const { row, col } = pos
        const neighbors: { point: Point, dir: string }[] = []
        for (const d of directions) {
            const newRow = row + d.dr
            const newCol = col + d.dc
            if (
                newRow >= 0 &&
                newRow < matrix.length &&
                newCol >= 0 &&
                newCol < matrix[0].length
            ) {
                neighbors.push({ point: matrix[newRow][newCol], dir: d.label })
            }
        }
        return neighbors
    }

    type Node = {
        point: Point
        f: number
        g: number
        h: number
        parent: Node | null
        dir: string | null // направление, из которого пришли
    }

    const openSet: Node[] = []
    const closedSet = new Set<string>()

    const startNode: Node = {
        point: start,
        f: 0,
        g: 0,
        h: getDistance(start, end),
        parent: null,
        dir: null
    }
    startNode.f = startNode.g + startNode.h
    openSet.push(startNode)

    while (openSet.length > 0) {
        openSet.sort((a, b) => a.f - b.f)
        const current = openSet.shift()!

        if (pointsEqual(current.point, end)) {
            const path: Point[] = []
            let node: Node | null = current
            while (node) {
                path.unshift(node.point)
                node = node.parent
            }
            return path
        }

        if (typeof current.point.id === 'string') {
            closedSet.add(current.point.id)
        }

        const neighbors = getNeighbors(current.point)
        for (const { point: neighbor, dir } of neighbors) {
            if (typeof neighbor.id !== 'string') continue
            if (closedSet.has(neighbor.id)) continue
            const weight = (neighbor as any).weight
            if (typeof weight !== 'number' || weight < 0) continue // препятствие

            // Штраф за поворот
            let turnPenalty = 0
            if (current.dir && current.dir !== dir) {
                // Если направление меняется — штраф
                turnPenalty = 10
                // Если разворот (противоположное направление) — большой штраф
                if (
                    (current.dir === 'N' && dir === 'S') ||
                    (current.dir === 'S' && dir === 'N') ||
                    (current.dir === 'E' && dir === 'W') ||
                    (current.dir === 'W' && dir === 'E') ||
                    (current.dir === 'NE' && dir === 'SW') ||
                    (current.dir === 'SW' && dir === 'NE') ||
                    (current.dir === 'NW' && dir === 'SE') ||
                    (current.dir === 'SE' && dir === 'NW')
                ) {
                    turnPenalty = 1000 // фактически запрещаем развороты
                }
            }

            const cost = 1 - weight + turnPenalty
            const tentativeG = current.g + cost
            const existingNode = openSet.find(n => pointsEqual(n.point, neighbor))

            if (!existingNode || tentativeG < existingNode.g) {
                const neighborNode: Node = {
                    point: neighbor,
                    f: 0,
                    g: tentativeG,
                    h: getDistance(neighbor, end),
                    parent: current,
                    dir: dir
                }
                neighborNode.f = neighborNode.g + neighborNode.h
                if (!existingNode) {
                    openSet.push(neighborNode)
                } else {
                    existingNode.g = tentativeG
                    existingNode.f = neighborNode.f
                    existingNode.parent = current
                    existingNode.dir = dir
                }
            }
        }
    }
    return null
}
