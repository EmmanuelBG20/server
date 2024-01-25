const request = require('supertest');
const app = require('../server');  // Asegúrate de tener la ruta correcta al archivo del servidor

describe('Crear Tarea', () => {
    // Declara authToken fuera de los bloques de prueba
    const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjQsInVzZXJuYW1lIjoidGVzdCIsImVtYWlsIjoidGVzdCIsImlhdCI6MTcwNjEyMzU3NCwiZXhwIjoxNzA2MTI3MTc0fQ.peG0Sx7haxf8QYrzhdRfzXmSk9-9VXk4Tmb1Sj26IxA';

    test('debería crear una nueva tarea y devolver la tarea creada', async () => {
        const taskData = {
            name: 'Nueva Tarea',
            description: 'Descripción de la nueva tarea',
            deadline: '2024-01-31',  // Fecha de vencimiento en el formato correcto
        };

        const response = await request(app)
            .post('/crear-tarea')
            .set('Authorization', `Bearer ${authToken}`)
            .send(taskData);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toBe(taskData.name);
        expect(response.body.description).toBe(taskData.description);
        // Ajusta la comparación de la fecha para que coincida con el formato esperado
        expect(new Date(response.body.deadline).toISOString().split('T')[0]).toBe(taskData.deadline);
        expect(response.body.status).toBe('en progreso');
        // Puedes agregar más expectativas según la estructura de tu respuesta

        // Puedes almacenar la tarea creada para usarla en pruebas futuras si es necesario
        const createdTask = response.body;
        // Puedes almacenar el ID de la tarea creada, por ejemplo, si necesitas realizar pruebas de edición o eliminación
        const createdTaskId = createdTask.id;
    });

    test('debería devolver un error si no se proporcionan datos válidos', async () => {
        // Utiliza authToken aquí también
        const response = await request(app)
            .post('/crear-tarea')
            .set('Authorization', `Bearer ${authToken}`)
            .send({});

        expect(response.statusCode).toBe(500);  // O el código de estado que uses para errores en tu aplicación
        // Puedes ajustar las expectativas según cómo manejes los errores en tu aplicación
    });
});
