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
  try {
    const { title, ownerId } = req.body;

    // Validate required fields
    if (!title || !ownerId) {
      return res.status(400).json({ 
        error: 'Title and ownerId are required' 
      });
    }

    // Create new board
    const newBoard = new Board({
      title,
      ownerId,
      collaborators: [ownerId], // Owner is automatically a collaborator
      elements: []
    });

    // Save to database
    const savedBoard = await newBoard.save();

    // Return the created board
    res.status(201).json(savedBoard);

  } catch (error) {
    console.error('Board creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create board',
      details: error.message 
    });
  }
});

export default boardRoutes;