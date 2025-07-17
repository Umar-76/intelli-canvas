import { Router } from 'express';

const authRoutes = Router();

authRoutes.post('/login', (req, res) => {
  // Add authentication logic
});

export default authRoutes;