import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Whiteboard from '../components/Whiteboard';
import Toolbar from '../components/Toolbar';
import UserPresence from '../components/UserPresence';
import { useBoardStore } from '../store/boardStore';
import useSocket from '../hooks/useSocket';
import { toast } from 'react-toastify';

const BoardPage: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const { initializeBoard, elements, setElements } = useBoardStore();
  const { socket, connected } = useSocket();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!boardId) return;

    const setupBoard = async () => {
      try {
        let actualBoardId = boardId;
        let boardData;

        console.log('Setting up board with ID:', boardId);
        console.log('Socket connected:', connected);
        console.log('actualBoardId: ', actualBoardId);

        // If the route is /board/new, create a new board first
        if (boardId === 'new') {
          const token = localStorage.getItem('token');
          // You may want to get the userId from your auth context or decode the token
          const userId = JSON.parse(atob(token!.split('.')[1])).userId; // quick decode, use a safer method in production

          const createResponse = await fetch('http://localhost:5000/api/boards', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ title: 'Untitled Board', ownerId: userId }),
          });

          if (!createResponse.ok) {
            throw new Error('Failed to create board');
          }

          boardData = await createResponse.json();
          actualBoardId = boardData._id;
          console.log('Created new board:', boardData);
          console.log('New board ID:', actualBoardId);

          // Redirect to the new board's URL
          navigate(`/board/${actualBoardId}`, { replace: true });
        } else {
          // 1. Fetch board data
          const boardResponse = await fetch(`http://localhost:5000/api/boards/${boardId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });

          if (!boardResponse.ok) {
            throw new Error('Failed to load board');
          }

          boardData = await boardResponse.json();
          console.log('Fetched board data:', boardData);
        }
        if(boardData){
          initializeBoard(boardData);
        }else{
          console.error('Board data is undefined');
          toast.error('Failed to load board data');
          return;
        }
        // 2. Setup socket listeners
        if (socket) {
          socket.emit('join-board', actualBoardId);

          socket.on('element-created', (element) => {
            setElements(prev => ({ ...prev, [element.id]: element }));
          });

          socket.on('element-updated', (element) => {
            setElements(prev => ({ ...prev, [element.id]: element }));
          });
        }
      } catch (error) {
        console.error('Board setup error:', error);
        toast.error('Failed to initialize board');
      } finally {
        setLoading(false);
      }
    };

    setupBoard();

    return () => {
      if (socket) {
        socket.off('element-created');
        socket.off('element-updated');
        socket.emit('leave-board', boardId);
      }
    };
  }, [boardId, socket, setElements, initializeBoard, navigate]);

  if (!boardId) {
    return <div className="text-center mt-10">Board ID is required</div>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Initializing board...</p>
        </div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️ Connection Issues</div>
          <p>Reconnecting to server...</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Toolbar />
      <div className="flex-1 relative">
        <Whiteboard />
        <UserPresence boardId={boardId} />
      </div>
    </div>
  );
};

export default BoardPage;