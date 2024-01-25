const request = require('supertest');
const app = require('../server');  // Asegúrate de tener la ruta correcta al archivo del servidor

describe('Eliminar, Editar y Completar Tarea', () => {
    test('debería eliminar una tarea y devolver un mensaje de éxito', async () => {
        // Asegúrate de tener una tarea válida en la base de datos antes de ejecutar esta prueba
        const taskIdToDelete = 71;  // Reemplaza con el ID de una tarea existente

        const response = await request(app)
            .delete(`/eliminar-tarea/${taskIdToDelete}`);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('message', 'Tarea eliminada correctamente');
    });

    test('debería editar una tarea y devolver un mensaje de éxito', async () => {
        // Asegúrate de tener una tarea válida en la base de datos antes de ejecutar esta prueba
        const taskIdToEdit = 72;  // Reemplaza con el ID de una tarea existente
        const updatedTaskData = {
            name: 'Nuevo nombre',
            description: 'Nueva descripción',
            deadline: '2024-02-29',
        };

        const response = await request(app)
            .put(`/editar-tarea/${taskIdToEdit}`)
            .send(updatedTaskData);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('message', 'Tarea editada correctamente');
    });

    test('debería marcar una tarea como completada y devolver un mensaje de éxito', async () => {
        // Asegúrate de tener una tarea válida en la base de datos antes de ejecutar esta prueba
        const taskIdToComplete = 73;  // Reemplaza con el ID de una tarea existente

        const response = await request(app)
            .put(`/completar-tarea/${taskIdToComplete}`);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('message', 'Tarea completada correctamente');
    });
});
