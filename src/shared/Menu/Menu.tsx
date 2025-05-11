import React from 'react'

interface MenuProps {
	items: MenuItem[]
}

const Menu = ({ items }: MenuProps) => {
	return (
		<ul>
			{items.map(({ name, path }) => (
				<li key={path}>{name}</li>
			))}
		</ul>
	)
}

export default Menu
