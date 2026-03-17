import { Router } from 'express';
import multer from 'multer';
import { handleQuery, handleGetSchema, handleUpload, handleFollowUp } from '../controllers/queryController.js';

import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// Apply protect middleware to all routes
router.use(protect);

// Multer config for CSV uploads
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

// POST /api/query — natural language → SQL → data → chart
router.post('/query', handleQuery);

// GET /api/schema — return database schema info
router.get('/schema', handleGetSchema);

// POST /api/upload — upload CSV and create table
router.post('/upload', upload.single('file'), handleUpload);

// POST /api/followup — send a follow-up message with conversation history
router.post('/followup', handleFollowUp);

export default router;
