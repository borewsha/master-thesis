import React, { useState } from 'react'
import { Marker } from 'react-leaflet'
import L from 'leaflet'
import ReactDOMServer from 'react-dom/server'
import CustomMarkerView from '@/shared/Map/CustomMarkerView'

const CustomMarker = ({
	size = 30,
	initialPosition,
	color,
	onRemove,
	onDrag,
	draggable = true
}) => {
	const [position, setPosition] = useState(initialPosition)

	const handleContextMenu = () => {
		if (onRemove) {
			onRemove()
		}
	}

	return (
		position && (
			<Marker
				draggable={draggable}
				position={position}
				icon={L.divIcon({
					className: '',
					iconSize: [size, size],
					iconAnchor: [size / 2, size / 2],
					html: ReactDOMServer.renderToString(
						<CustomMarkerView size={size} color={color} />
					)
				})}
				eventHandlers={{
					contextmenu: handleContextMenu,
					dragend: onDrag,
					click: () => {}
				}}
			/>
		)
	)
}

export default CustomMarker
