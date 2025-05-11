import { Polyline } from 'react-leaflet'
import React from 'react'

const Way = ({ points, color, opacity = 0.5 }) => {
	return <Polyline pathOptions={{ color, opacity }} positions={points} />
}

export default Way
