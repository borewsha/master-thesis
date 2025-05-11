import React from 'react'

const CustomMarkerView = ({ size = 30, color = 'green' }) => {
	return (
		<div
			style={{
				height: size,
				width: size,
				borderRadius: '50%',
				backgroundColor: 'white',
				border: '2px solid gray',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center'
			}}
		>
			<div
				style={{
					height: size * 0.6,
					width: size * 0.6,
					borderRadius: '50%',
					backgroundColor: color
				}}
			></div>
		</div>
	)
}

export default CustomMarkerView
