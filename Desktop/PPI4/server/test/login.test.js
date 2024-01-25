const request = require('supertest');
const app = require('../server');

describe('Autenticación de usuarios', () => {
    afterAll(async () => {
        // Cierra el servidor después de las pruebas
        await app.close();
    });

    test('debería autenticar a un usuario válido y devolver un token', async () => {
        const response = await request(app)
            .post('/login')
            .send({
                loginuserName: 'test',
                loginpassword: 'test',
            });

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('token');
    });

    test('debería devolver un error si la autenticación falla', async () => {
        const response = await request(app)
            .post('/login')
            .send({
                loginuserName: 'usuarioIncorrecto',
                loginpassword: 'contraseñaIncorrecta',
            });

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('error');
    }, 10000);  // Ajusta el tiempo de espera a 10 segundos
});
