import { Server } from 'socket.io';
import { RedisClientType } from '@redis/client';
import Board from '../models/boards';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export default function handleSocketEvents(io: Server, redisClient: RedisClientType) {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Authentication middleware
    socket.use(async (packet, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token){ 
          throw new Error('Authentication token missing');
        }
        // Verify JWT token
        const decoded = jwt.verify(token, JWT_SECRET) as unknown as { 
          userId: string; 
          email: string 
        };

        // Attach user data to socket
        socket.data = {
          userId: decoded.userId,
          email: decoded.email,
          name: decoded.email.split('@')[0] // Default name from email
        };
        next();
      } catch (error) {
        console.error('Socket auth error:', error.message);
        next(new Error('Unauthorized'));
      }
    });

    // Join board room
    socket.on('join-board', async (boardId) => {
      try {
        socket.join(boardId);
      
        // Add user to presence tracking
        await redisClient.hSet(`presence:${boardId}`, socket.id, JSON.stringify({
          userId: socket.data.userId,
          name: socket.data.name,
          position: { x: 0, y: 0 },
          lastActive: new Date().toISOString()
        }));

        // Broadcast to room
        io.to(boardId).emit('user-joined', {
          userId: socket.data.userId,
          name: socket.data.name
        });
        // Send current presence data
        const presenceData = await redisClient.hGetAll(`presence:${boardId}`);
        socket.emit('presence-update', Object.values(presenceData).map((str) => JSON.parse(str)));

      } catch (error) {
        console.error('Join board error:', error);
      }
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
    socket.on('cursor-move', async (data: {boardId: string, position: {x: number, y: number}}) => {
      try {
        // Update Redis presence
        await redisClient.hSet(`presence:${data.boardId}`, socket.id, JSON.stringify({
          userId: socket.data.userId,
          name: socket.data.name,
          position: data.position
        }));

        // Broadcast to room
        socket.to(data.boardId).emit('cursor-moved', {
          userId: socket.data.userId,
          position: data.position
        });
      } catch (error) {
        console.error('Cursor move error:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      try {
        console.log('User disconnected:', socket.id);

        // Get all boards this socket was in
        const rooms = Array.from(socket.rooms).filter(room => room !== socket.id);
        
        // Remove from presence tracking in each room
        for (const boardId of rooms) {
          await redisClient.hDel(`presence:${boardId}`, socket.id);
          
          // Notify room
          io.to(boardId).emit('user-left', {
            userId: socket.data.userId
          });
        }
      } catch (error) {
        console.error('Disconnect cleanup error:', error);
      }
    });

     // --- Error Handling ---
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });
};