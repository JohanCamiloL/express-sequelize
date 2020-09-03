const express = require('express');
const Sequelize = require('sequelize');

const app = express();

const sequelize = new Sequelize('acamica_database', 'root', 'CamiloLopez97', {
	host: 'localhost',
	dialect: 'mysql'
});

const SERVER_PORT = 3000;

app.use(express.json());

/**
 * Add a new song.
 */
app.post('/songs', async (req, res, next) => {
	const { nombre, duracion, album, banda, fechaPublicacion } = req.body;

	if (nombre && duracion && album && banda && fechaPublicacion) {
		const query = `
			INSERT INTO canciones (nombre, duracion, album, banda, fecha_publicacion)
			VALUES (:nombre, :duracion, :album, :banda, :fechaPublicacion);
		`;

		try {
			const data = await sequelize.query(query, {
				replacements: {
					nombre,
					duracion,
					album,
					banda,
					fechaPublicacion
				}
			});

			res.status(201).json({ data });
		} catch (error) {
			next(error);
		}
	} else {
		res.status(400).json({ error: 'Invalid body request' });
	}
});

/**
 * Get songs by its name
 */
app.get('/songs/:name', async (req, res, next) => {
	const name = req.params.name;

	const query = `
		SELECT * FROM canciones 
		WHERE nombre = :name;		
	`;

	try {
		const data = await sequelize.query(query, {
			type: sequelize.QueryTypes.SELECT,
			replacements: {
				name
			}
		});

		res.status(200).json({ data });
	} catch (error) {
		next(error);
	}
});

app.put('/songs/:id', async (req, res, next) => {
	const id = req.params.id;
	const { nombre, duracion, album, banda, fechaPublicacion } = req.body;

	const query = `
		UPDATE canciones
		SET nombre = :nombre, duracion = :duracion, album = :album, banda = :banda, fechaPublicacion = :fechaPublicacion
		WHERE id = :id;
	`;

	try {
		const data = await sequelize.query(query, {
			replacements: {
				nombre,
				duracion,
				album,
				banda,
				fechaPublicacion
			}
		});

		res.status(200).json({ data });
	} catch (error) {
		next(error);
	}
});

app.use((error, req, res, next) => {
	if (error) {
		console.log(error);
		res.status(500).json({ error: 'Internal error' });
	} else {
		next();
	}
});

app.listen(SERVER_PORT, () => {
	sequelize.authenticate()
		.then(console.log('Database connection succesfull'))
		.catch((error) => console.log(error.message));

	console.log('Server listening on port 3000');
});
