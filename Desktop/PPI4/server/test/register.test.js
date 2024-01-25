const request = require('supertest');
const app = require('../server');

describe('Registro de usuarios', () => {
    afterAll(async () => {
        // Cierra el servidor después de las pruebas
        await app.close();
    });

    test('debería insertar un usuario y devolver un token', async () => {
        const response = await request(app)
            .post('/register')
            .send({
                email: 'test@example.com',
                userName: 'testUser',
                password: 'testPassword'
            });

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('token');
    });

    test('debería devolver un error si no se proporcionan datos', async () => {
        const response = await request(app)
            .post('/register')
            .send({});

        expect(response.statusCode).toBe(500);
    });
});
