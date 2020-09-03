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

/**
 * Update the given song.
 */
app.put('/songs/:id', async (req, res, next) => {
	const id = parseInt(req.params.id);
	let { nombre, duracion, album, banda, fechaPublicacion } = req.body;

	// El select es un arreglo, obtenemos el unico valor que nos retorna un id.
	const song = (await getSongById(id))[0];

	// Validates if a song exists by the given id.
	if (!song) {
		res.status(404).json({ error: `Song with id ${id} doesn't exists` });
		return;
	}

	// Set some null values to its current value.
	nombre = nombre || song.nombre;
	duracion = duracion || song.duracion;
	album = album || song.album;
	banda = banda || song.banda;
	fechaPublicacion = fechaPublicacion || song.fechaPublicacion;

	const query = `
		UPDATE canciones
		SET nombre = :nombre, duracion = :duracion, album = :album, banda = :banda, fecha_publicacion = :fechaPublicacion
		WHERE id = :id;
	`;

	try {
		await executeQuery(query, { nombre, duracion, album, banda, fechaPublicacion, id }, false);

		const newSong = await getSongById(id);

		res.status(200).json({ data: newSong });
	} catch (error) {
		next(error);
	}
});

/**
 * Deletes a song by the given id
 */
app.delete('/songs/:id', async (req, res, next) => {
	const id = parseInt(req.params.id);

	const query = 'DELETE FROM canciones WHERE id = :id';

	try {
		const data = await executeQuery(query, { id }, false);

		res.status(204).json({});
	} catch (error) {
		next(error);
	}
});

/**
 * Get all songs
 */
app.get('/songs', async (req, res, next) => {
	const query = 'SELECT * FROM canciones';

	try {
		const data = await executeQuery(query, {}, true);

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

/**
 * Get a song by the given id.
 * @param {Number} id Song id.
 * @returns {Object} Song object.
 */
const getSongById = async (id) => {
	const query = `
		SELECT * FROM canciones WHERE id = :id;
	`;

	let song;

	try {
		song = await executeQuery(query, { id }, true);
	} catch (error) {
		console.log(error);
	}

	return song;
}

/**
 * Execute the given query with sequelize.
 * @param {String} query SQL Query.
 * @param {Object} replacements Replacements object
 * @param {Boolean} isSelectQuery If query is a select statement or not.
 * @returns {Promise} Sequelize promise.
 */
const executeQuery = async (query, replacements, isSelectQuery) => {

	return await sequelize.query(query, {
		type: (isSelectQuery ? sequelize.QueryTypes.SELECT : undefined),
		replacements
	});
}