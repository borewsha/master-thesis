import { LatLng } from 'leaflet'

export interface GridNode {
	weight: number
	position: LatLng
}

export type GridCoordinate = [number, number]

export type Grid = GridNode[][]
