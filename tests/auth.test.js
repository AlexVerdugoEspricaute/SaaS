const request = require('supertest');
const app = require('../src/server');

describe('Auth endpoints', () => {
  test('login admin and get /auth/me', async () => {
    const loginResp = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@acme.test', password: 'admin' })
      .expect(200);

    expect(loginResp.body.token).toBeDefined();
    const token = loginResp.body.token;

    const meResp = await request(app)
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(meResp.body.email).toBe('admin@acme.test');
    expect(meResp.body.role).toBe('ADMIN');
  });
});
