import { Server } from 'socket.io';
import { RedisClientType } from '@redis/client';
import Board from '../models/boards';

export default function handleSocketEvents(io: Server, redisClient: RedisClientType) {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Authentication middleware
    socket.use((packet, next) => {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Unauthorized'));
      // Verify token logic here (JWT verification)
      next();
    });

    // Join board room
    socket.on('join-board', async (boardId) => {
      socket.join(boardId);
      
      // Add user to presence tracking
      await redisClient.hSet(`presence:${boardId}`, socket.id, JSON.stringify({
        userId: socket.data.userId,
        name: socket.data.name,
        position: { x: 0, y: 0 }
      }));

      // Broadcast to room
      io.to(boardId).emit('user-joined', {
        userId: socket.data.userId,
        name: socket.data.name
      });
    });

    // Element creation
    socket.on('element-create', async (element) => {
      try {
        // Save to database
        let board = await Board.findById(element.boardId);
        if (!board) {
          board = new Board({
          _id: element.boardId,
          title: `New Board ${element.boardId.slice(0, 5)}`, // Auto-generate name
          ownerId: socket.data.userId, // Set creator (from authenticated socket)
          elements: [element], // Add the first element
          collaborators: [socket.data.userId] // Creator is collaborator
          });
        } else {
            // 3. Add element to existing board
            board.elements.push(element);
          }
        
        // Broadcast to room
        await board.save();
        socket.to(element.boardId).emit('element-created', element);
      } catch (error) {
        console.error('Element creation error:', error);
      }
    });

    // Element update
    socket.on('element-update', async (element) => {
      try {
        // Update in database
        await Board.updateOne(
          { _id: element.boardId, 'elements._id': element._id },
          { $set: { 
            'elements.$.position': element.position,
            'elements.$.size': element.size,
            'elements.$.content': element.content,
            'elements.$.style': element.style,
            updatedAt: new Date()
          } }
        );

        // Broadcast to room
        socket.to(element.boardId).emit('element-updated', element);
      } catch (error) {
        console.error('Element update error:', error);
      }
    });

    // Cursor movement
    socket.on('cursor-move', (data) => {
      // Update Redis presence
      redisClient.hSet(`presence:${data.boardId}`, socket.id, JSON.stringify({
        userId: socket.data.userId,
        name: socket.data.name,
        position: data.position
      }));

      // Broadcast to room
      socket.to(data.boardId).emit('cursor-moved', {
        userId: socket.data.userId,
        position: data.position
      });
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log('User disconnected:', socket.id);
      
      // Remove from presence tracking (logic to find board IDs)
      // Broadcast user-left events
    });
  });
};