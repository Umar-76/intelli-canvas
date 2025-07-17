import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Whiteboard from '../components/Whiteboard';
import Toolbar from '../components/Toolbar';
import UserPresence from '../components/UserPresence';
import { useBoardStore } from '../store/boardStore';
import useSocket  from '../hooks/useSocket';

const BoardPage: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const { initializeBoard, elements, setElements } = useBoardStore();
  const { socket, connected } = useSocket();

  if (!boardId) {
    return <div className="text-center mt-10">Board ID is required</div>;
  }
  useEffect(() => {
    if (!boardId || !socket || !connected) return;

    // Join board room
    socket.emit('join-board', boardId);

    // Load initial board state
    const fetchBoard = async () => {
      const response = await fetch(`/api/boards/${boardId}`);
      const boardData = await response.json();
      initializeBoard(boardData);
    };

    fetchBoard();

    // Socket event listeners
    socket.on('element-created', (element) => {
      setElements(prev => ({ ...prev, [element.id]: element }));
    });

    socket.on('element-updated', (element) => {
      setElements(prev => ({ ...prev, [element.id]: element }));
    });

    return () => {
      socket.off('element-created');
      socket.off('element-updated');
      socket.emit('leave-board', boardId);
    };
  }, [boardId, socket, connected]);

  if (!connected) return <div>Connecting to server...</div>;

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