import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  getStats,
  getNextPatientId,
  checkDuplicate,
  verifyUserLogin
} from './server/db.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // API Routes
  // 0. User Login
  app.post('/api/login', (req, res) => {
    try {
      const { mobile, password } = req.body;
      if (!mobile || !password) {
        return res.status(400).json({ error: 'Mobile number and password are required.' });
      }
      const user = verifyUserLogin(mobile, password);
      if (!user) {
        return res.status(401).json({ error: 'Invalid mobile number or password.' });
      }
      res.json({ success: true, user });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });
  // 1. Get statistics for Home Dashboard
  app.get('/api/stats', (req, res) => {
    try {
      const stats = getStats();
      res.json(stats);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 2. Suggest Next Unique Patient ID for a Centre
  app.get('/api/patients/next-id', (req, res) => {
    try {
      const centre = (req.query.centre as string) || 'STY Vijayawada';
      const nextId = getNextPatientId(centre);
      res.json({ nextId });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 3. Duplicate check endpoint
  app.get('/api/patients/check-duplicate', (req, res) => {
    try {
      const mobile = (req.query.mobile as string) || '';
      const fullName = (req.query.name as string) || '';
      if (!mobile && !fullName) {
        return res.json({ duplicate: false });
      }
      const duplicate = checkDuplicate(mobile, fullName);
      res.json({ duplicate: !!duplicate, existingPatient: duplicate || null });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 4. Get all patients with search/filter
  app.get('/api/patients', (req, res) => {
    try {
      const { search, centre, status } = req.query;
      const patients = getAllPatients({
        search: search as string,
        centre: centre as string,
        status: status as string
      });
      res.json(patients);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 5. Get single patient by ID
  app.get('/api/patients/:id', (req, res) => {
    try {
      const patient = getPatientById(req.params.id);
      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }
      res.json(patient);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 6. Create new patient
  app.post('/api/patients', (req, res) => {
    try {
      const newPatient = createPatient(req.body);
      res.status(201).json(newPatient);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // 7. Update patient
  app.put('/api/patients/:id', (req, res) => {
    try {
      const updated = updatePatient(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Patient not found' });
      }
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // 8. Delete patient
  app.delete('/api/patients/:id', (req, res) => {
    try {
      const success = deletePatient(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'Patient not found' });
      }
      res.json({ success: true, message: 'Patient record removed' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware in dev or static files in prod
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`STY Patient Management Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
