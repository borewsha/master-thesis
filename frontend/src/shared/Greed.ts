class Grid {
	public width: number = 0
	public height: number = 0
	public grid: number[][] = []

	constructor(width: number, height: number) {
		this.width = width
		this.height = height
		this.grid = Array.from({ length: height }, () => Array(width).fill(0))
	}

	setObstacle(x, y) {
		if (this.isValid(x, y)) {
			this.grid[y][x] = -1
		}
	}

	isValid(x, y) {
		return x >= 0 && x < this.width && y >= 0 && y < this.height
	}
}

export default Grid
