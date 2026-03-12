const request = require('supertest');
const path = require('path');
const fs = require('fs');
const app = require('../src/server');

// Archivo CSV temporal para usar como fixture de prueba
const FIXTURE_PATH = path.join(__dirname, '_fixture.csv');

beforeAll(() => {
  fs.writeFileSync(FIXTURE_PATH, 'name,age\nAlice,30\nBob,25', 'utf8');
});

afterAll(() => {
  if (fs.existsSync(FIXTURE_PATH)) fs.unlinkSync(FIXTURE_PATH);
});

async function getToken() {
  const res = await request(app)
    .post('/auth/login')
    .send({ email: 'admin@acme.test', password: 'admin' })
    .expect(200);
  return res.body.token;
}

describe('Jobs & Upload endpoints', () => {

  test('POST /upload sin auth → 401', async () => {
    // Enviamos sin archivo para evitar ECONNRESET por body no leído antes del 401
    await request(app)
      .post('/upload')
      .field('targetFormat', 'json')
      .expect(401);
  });

  test('POST /upload sin archivo → 400', async () => {
    const token = await getToken();
    await request(app)
      .post('/upload')
      .set('Authorization', `Bearer ${token}`)
      .field('targetFormat', 'json')
      .expect(400);
  });

  test('POST /upload sin targetFormat → 400', async () => {
    const token = await getToken();
    await request(app)
      .post('/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', FIXTURE_PATH)
      .expect(400);
  });

  test('POST /upload válido → 202 con jobId', async () => {
    const token = await getToken();
    const res = await request(app)
      .post('/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', FIXTURE_PATH)
      .field('targetFormat', 'json')
      .expect(202);

    expect(res.body.jobId).toBeDefined();
    expect(res.body.status).toBe('pending');
  });

  test('GET /jobs sin auth → 401', async () => {
    await request(app).get('/jobs').expect(401);
  });

  test('GET /jobs con auth → array', async () => {
    const token = await getToken();
    const res = await request(app)
      .get('/jobs')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /jobs/:id devuelve job creado', async () => {
    const token = await getToken();

    // Crear job
    const uploadRes = await request(app)
      .post('/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', FIXTURE_PATH)
      .field('targetFormat', 'json')
      .expect(202);

    const { jobId } = uploadRes.body;

    const res = await request(app)
      .get(`/jobs/${jobId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.id).toBe(jobId);
    expect(res.body.targetFormat).toBe('json');
    expect(res.body.inputFormat).toBe('csv');
  });

  test('GET /jobs/:id inexistente → 404', async () => {
    const token = await getToken();
    await request(app)
      .get('/jobs/id-que-no-existe')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });

  test('GET /download/:jobId antes de terminar → 409 o descarga', async () => {
    const token = await getToken();

    const uploadRes = await request(app)
      .post('/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', FIXTURE_PATH)
      .field('targetFormat', 'json')
      .expect(202);

    const { jobId } = uploadRes.body;

    // Esperar a que la conversión asíncrona termine (máx 5s)
    let job;
    for (let i = 0; i < 10; i++) {
      await new Promise(r => setTimeout(r, 500));
      const r = await request(app)
        .get(`/jobs/${jobId}`)
        .set('Authorization', `Bearer ${token}`);
      job = r.body;
      if (job.status !== 'pending') break;
    }

    if (job.status === 'done') {
      // Debe poder descargar
      await request(app)
        .get(`/download/${jobId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    } else {
      // Si aún está pendiente, debe devolver 409
      await request(app)
        .get(`/download/${jobId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(409);
    }
  });

});
