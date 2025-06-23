import { LatLng } from 'leaflet'

export interface GridNode {
	weight: number
	position: LatLng
	id?: string // добавлен id для совместимости с логикой
}

export type GridCoordinate = [number, number]

export type Grid = GridNode[][]
