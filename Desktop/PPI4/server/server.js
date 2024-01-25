const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const secret = 'emmappi4'; // Reemplaza esto con tu propio secreto
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'taskmaster22bc@gmail.com',  // Reemplaza con tu correo electrónico
        pass: '00130013Ebg.'         // Reemplaza con tu contraseña
    }
});

const app = express();
const PORT = process.env.PORT || 3001;
app.use(cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



// Configuración de la conexión a la base de datos
const db = mysql.createConnection({
    user: 'root',
    host: 'localhost',
    password: '',
    database: 'ppi4',
});

// Conectar a la base de datos
db.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
    } else {
        console.log('Conexión exitosa a la base de datos');
    }
});
// Inicia el servidor
const server = app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = server;


//Register
app.post('/register', (req, res) => {
    console.log('Received a registration request');
    const sentEmail = req.body.email;
    const sentUserName = req.body.userName;
    const sentPassword = req.body.password;


    const SQL = 'INSERT INTO users(email, username, password) VALUES (?, ?, ?)';
    const values = [sentEmail, sentUserName, sentPassword];

    db.query(SQL, values, (err, results) => {
        if (err) {
            console.error('Error al insertar en la base de datos:', err.message);
            res.status(500).send('Error en la base de datos');
        } else {
            console.log('Usuario insertado correctamente');
            // Después de insertar el usuario, genera un token JWT
            const token = jwt.sign({ sub: results.insertId, username: sentUserName, email: sentEmail }, secret, { expiresIn: '1h' });
            res.json({ token });
        }
    });
});

//Login
app.post('/login', (req, res) => {
    console.log('Received a Login request');
    const sentLoginuserName = req.body.loginuserName;
    const sentLoginpassword = req.body.loginpassword;

    console.log('Received username:', sentLoginuserName);
    console.log('Received password:', sentLoginpassword);

    const SQL = 'SELECT * FROM users WHERE username = ? AND password = ?';
    const values = [sentLoginuserName, sentLoginpassword];

    db.query(SQL, values, (err, results) => {
        if (err) {
            console.error('Error executing SQL:', err);
            res.status(500).send({ error: 'Error en el servidor' });
        } else {
            if (results.length > 0) {
                // Usuario autenticado con éxito
                console.log('Authentication successful');
                const user = results[0];

                // Genera un token JWT con la información del usuario
                const token = jwt.sign({ sub: user.id, username: user.username, email: user.email }, secret, {
                    expiresIn: '1h', // Tiempo de expiración del token
                });

                res.send({ token });
            } else {
                console.log('Authentication failed');
                res.status(401).send({ error: 'Autenticación fallida' });
            }
        }
    });
});






// Endpoint de prueba
app.get('/', (req, res) => {
    res.send('¡Hola, mundo!');
});

// Endpoint para crear una nueva tarea
app.post('/crear-tarea', (req, res) => {
    const { name, description, deadline } = req.body;

    // Obtén el token del encabezado de la solicitud
    const token = req.headers.authorization.split(' ')[1];

    try {
        // Verifica el token para obtener la información del usuario
        const decoded = jwt.verify(token, secret);
        const userId = decoded.sub;

        // Inserta la nueva tarea en la base de datos
        const insertQuery = 'INSERT INTO tasks (name, description, deadline, status, userId) VALUES (?, ?, ?, ?, ?)';
        db.query(insertQuery, [name, description, deadline, 'en progreso', userId], (error, results) => {
            if (error) {
                console.error('Error al crear la tarea:', error);
                res.status(500).json({ error: 'Error interno del servidor' });
                return;
            }

            // Obtén la tarea recién creada
            const taskId = results.insertId;
            const selectQuery = 'SELECT * FROM tasks WHERE id = ?';
            db.query(selectQuery, [taskId], (selectError, selectResults) => {
                if (selectError) {
                    console.error('Error al obtener la tarea creada:', selectError);
                    res.status(500).json({ error: 'Error interno del servidor' });
                    return;
                }

                const createdTask = selectResults[0];
                res.json(createdTask);
            });
        });
    } catch (error) {
        console.error('Error al verificar el token:', error);
        res.status(401).json({ error: 'Token inválido' });
    }
});

// Endpoint para obtener tareas en progreso
app.get('/tareas-en-progreso', (req, res) => {
    const selectQuery = 'SELECT * FROM tasks WHERE status = ?';
    const status = 'en progreso';

    db.query(selectQuery, [status], (error, results) => {
        if (error) {
            console.error('Error al obtener tareas en progreso:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
            return;
        }

        res.json(results);
    });
});


// Endpoint para eliminar una tarea
app.delete('/eliminar-tarea/:taskId', (req, res) => {
    const taskId = req.params.taskId;

    // Realiza la lógica para eliminar la tarea de la base de datos
    console.log('Recibida solicitud para eliminar la tarea con ID:', taskId);

    db.query('DELETE FROM tasks WHERE id = ?', [taskId], (error, results) => {
        if (error) {
            console.error('Error al eliminar la tarea:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
            return;
        }

        console.log('Tarea eliminada correctamente');
        res.json({ message: 'Tarea eliminada correctamente' });
    });
});


// Endpoint para editar una tarea
app.put('/editar-tarea/:taskId', (req, res) => {
    const taskId = req.params.taskId;
    const { name, description, deadline } = req.body;

    // Realiza la lógica para editar la tarea en la base de datos
    db.query('UPDATE tasks SET name = ?, description = ?, deadline = ? WHERE id = ?', [name, description, deadline, taskId], (error, results) => {
        if (error) {
            console.error('Error al editar la tarea:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
            return;
        }
        res.json({ message: 'Tarea editada correctamente' });
    });
});

// Endpoint para marcar una tarea como completada
app.put('/completar-tarea/:taskId', (req, res) => {
    const taskId = req.params.taskId;

    // Realiza la lógica para marcar la tarea como completada en la base de datos
    db.query('UPDATE tasks SET status = "completada" WHERE id = ?', [taskId], (error, results) => {
        if (error) {
            console.error('Error al completar la tarea:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
            return;
        }
        res.json({ message: 'Tarea completada correctamente' });
    });
});

app.get('/tareas', (req, res) => {
    // Lógica para obtener todas las tareas desde la base de datos
    db.query('SELECT * FROM tasks', (error, results) => {
        if (error) {
            console.error('Error al obtener tareas:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
            return;
        }
        res.json(results);
    });
});

app.get('/tareas-completadas', (req, res) => {
    // Lógica para obtener las tareas completadas en la base de datos
    db.query('SELECT * FROM tasks WHERE status = "completada"', (error, results) => {
        if (error) {
            console.error('Error al obtener tareas completadas:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
            return;
        }
        res.json(results);
    });
});

// Endpoint para restablecer la contraseña
app.post('/forgotpassword', async (req, res) => {
    try {
        const { email } = req.body; // Cambiado de req.email a req.body.email

        console.log('Recibida solicitud de restablecimiento de contraseña para el correo electrónico:', email);

        // Verifica si el correo electrónico existe en la base de datos
        const userQuery = 'SELECT * FROM users WHERE email = ?';

        let results, fields;

        try {
            /*    { results, fields } = await db.query(userQuery, [email]);*/
            console.log(await db.query(userQuery, [email]));
        } catch (error) {
            console.error('Error en la consulta:', error);
            return res.status(500).json({ message: 'Error interno del servidor' });
        }

        console.log('Resultados de la consulta:', results);
        console.log('Campos de la consulta:', fields);

        if (!results || results.length === 0) {
            console.log('Correo electrónico no encontrado o la longitud de los resultados es cero:', email);
            return res.status(404).json({ message: 'Correo electrónico no encontrado' });
        }

        const user = results[0];

        if (!user || !user.id) {
            console.log('El usuario no tiene ID:', email);
            return res.status(404).json({ message: 'Correo electrónico no encontrado' });
        }

        const resetToken = uuidv4();

        // Almacena el token en la base de datos
        const updateTokenQuery = 'UPDATE users SET resetToken = ? WHERE email = ?'; // Cambiado de id a email
        let queryResult;

        try {
            queryResult = await db.query(updateTokenQuery, [resetToken, email]); // Cambiado de user.id a email
        } catch (error) {
            console.error('Error al actualizar el token:', error);
            return res.status(500).json({ message: 'Error interno del servidor' });
        }

        console.log('Resultado de la actualización del token:', queryResult);

        if (queryResult && queryResult.affectedRows === 0) {
            console.log('Error al actualizar el token para el usuario con correo electrónico:', email);
            return res.status(500).json({ message: 'Error interno del servidor' });
        }

        const resetLink = `http://localhost:3000/resetpassword/${resetToken}`;
        const mailOptions = {
            from: 'taskmaster22bc@gmail.com',
            to: email,
            subject: 'Restablecimiento de contraseña',
            text: `Haz clic en el siguiente enlace para restablecer tu contraseña: ${resetLink}`,
        };

        await transporter.sendMail(mailOptions);

        console.log('Correo electrónico enviado con éxito para el correo electrónico:', email);
        res.json({ message: 'Correo electrónico enviado con éxito' });
    } catch (error) {
        console.error('Error al procesar la solicitud de restablecimiento de contraseña:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});



app.post('/forgotpasswordconfirmation', async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        console.log('Recibida solicitud de confirmación de restablecimiento de contraseña para el token:', token);

        // Busca al usuario con el token de restablecimiento en la base de datos
        const userQuery = 'SELECT * FROM users WHERE resetToken = ?';
        const userResults = await db.query(userQuery, [token]);

        if (!userResults || userResults.length === 0) {
            console.log('Token no válido:', token);
            return res.status(404).json({ message: 'Token no válido' });
        }

        const user = userResults[0];

        // Actualiza la contraseña del usuario y elimina el token de restablecimiento
        const updatePasswordQuery = 'UPDATE users SET password = ?, resetToken = NULL WHERE id = ?';
        await db.query(updatePasswordQuery, [newPassword, user.id]);

        console.log('Contraseña restablecida con éxito para el token:', token);
        res.json({ message: 'Contraseña restablecida con éxito' });
    } catch (error) {
        console.error('Error al procesar la confirmación de restablecimiento de contraseña:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});
// Endpoint para obtener el perfil del usuario actual
/*app.get('/perfil', (req, res) => {
    // Obtén el token del encabezado de la solicitud
    const token = req.headers.authorization.split(' ')[1];

    try {
        // Verifica el token para obtener la información del usuario
        const decoded = jwt.verify(token, secret);
        const userId = decoded.sub;

        // Busca al usuario en la base de datos
        const selectQuery = 'SELECT id, username, email FROM users WHERE id = ?';
        db.query(selectQuery, [userId], (error, results) => {
            if (error) {
                console.error('Error al obtener el perfil del usuario:', error);
                res.status(500).json({ error: 'Error interno del servidor' });
                return;
            }

            if (results.length === 0) {
                console.error('Usuario no encontrado');
                res.status(404).json({ error: 'Usuario no encontrado' });
                return;
            }

            const user = results[0];
            res.json(user);
        });
    } catch (error) {
        console.error('Error al verificar el token:', error);
        res.status(401).json({ error: 'Token inválido' });
    }
});*/


