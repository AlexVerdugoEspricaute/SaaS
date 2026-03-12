const request = require('supertest');
const app = require('../src/server');

describe('Projects endpoints', () => {
  test('GET /projects returns tenant projects for admin', async () => {
    const loginResp = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@acme.test', password: 'admin' })
      .expect(200);

    const token = loginResp.body.token;

    const resp = await request(app)
      .get('/projects')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(resp.body)).toBe(true);
    expect(resp.body.length).toBeGreaterThanOrEqual(1);
    expect(resp.body[0]).toHaveProperty('name');
  });
});
