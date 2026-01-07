/**
 * Tests du endpoint Health Check
 */
const request = require('supertest');
const express = require('express');

describe('Health Check Endpoint', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    // Route health simple pour le test
    app.get('/api/health', (req, res) => {
      res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });
  });

  it('devrait retourner status OK', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.status).toBe('OK');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptime');
  });

  it('devrait retourner un timestamp valide', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);

    const timestamp = new Date(response.body.timestamp);
    expect(timestamp).toBeInstanceOf(Date);
    expect(timestamp.toString()).not.toBe('Invalid Date');
  });

  it('devrait retourner un uptime positif', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);

    expect(typeof response.body.uptime).toBe('number');
    expect(response.body.uptime).toBeGreaterThan(0);
  });
});
