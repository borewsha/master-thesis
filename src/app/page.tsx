'use client'

import dynamic from 'next/dynamic'
import React, { useEffect, useState } from 'react'
import { Provider } from 'react-redux'
import { store } from '@/store'

const Home = () => {
	const Map = dynamic(() => import('@/shared/Map/Map'), { ssr: false })
	const [location, setLocation] = useState<GeolocationPosition>({
		coords: { latitude: 55.321725, longitude: 11.042428 }
	})

	// useEffect(() => {
	// 	navigator.geolocation.getCurrentPosition(location => {
	// 		console.debug(location)
	// 		setLocation(location)
	// 	})
	// }, [])

	return (
		<Provider store={store}>
			<main style={{ height: '100vh' }}>
				<Map location={location} />
			</main>
		</Provider>
	)
}

export default Home
