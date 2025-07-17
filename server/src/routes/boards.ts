import { Router } from 'express';
import Board from '..\\models\\boards';

const boardRoutes = Router();

boardRoutes.get('/:id', async (req, res) => {
  try {
    const board = await Board.findById(req.params.id).populate('elements');
    res.json(board);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch board' });
  }
});

boardRoutes.post('/', async (req, res) => {
  // Add board creation logic
});

export default boardRoutes;