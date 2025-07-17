import React, { useEffect, useState } from 'react';
import useSocket  from '../hooks/useSocket';

interface UserPresenceProps {
  boardId: string;
}

interface UserCursor {
  userId: string;
  position: { x: number; y: number };
  color: string;
  name: string;
}

const UserPresence: React.FC<UserPresenceProps> = ({ boardId }) => {
  const { socket } = useSocket();
  const [users, setUsers] = useState<Record<string, UserCursor>>({});

  useEffect(() => {
    if (!socket) return;

    const handleCursorMove = (data: { userId: string; position: { x: number; y: number } }) => {
      setUsers(prev => ({
        ...prev,
        [data.userId]: {
          ...prev[data.userId],
          userId: data.userId,
          position: data.position,
          color: `hsl(${Math.random() * 360}, 70%, 50%)`,
          name: `User${Math.floor(Math.random() * 100)}`
        }
      }));
    };

    socket.on('cursor-moved', handleCursorMove);

    return () => {
      socket.off('cursor-moved', handleCursorMove);
    };
  }, [socket]);

  return (
    <div className="absolute top-0 left-0 pointer-events-none z-10">
      {Object.values(users).map(user => (
        <div
          key={user.userId}
          className="absolute flex items-center"
          style={{
            transform: `translate(${user.position.x}px, ${user.position.y}px)`,
            color: user.color
          }}
        >
          <div className="w-3 h-3 rounded-full bg-current"></div>
          <span className="ml-2 text-xs font-bold bg-white px-1 rounded">
            {user.name}
          </span>
        </div>
      ))}
    </div>
  );
};

export default UserPresence;