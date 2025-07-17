import React from 'react';
import { useBoardStore } from '../store/boardStore';

const Toolbar: React.FC = () => {
  const { selectedTool, setSelectedTool } = useBoardStore();

  const tools = [
    { id: 'select', name: 'Select' },
    { id: 'sticky-note', name: 'Sticky Note' },
    { id: 'text', name: 'Text' },
    { id: 'rectangle', name: 'Rectangle' },
    { id: 'circle', name: 'Circle' },
    { id: 'drawing', name: 'Pencil' },
    { id: 'eraser', name: 'Eraser' },
  ];

  return (
    <div className="w-16 bg-gray-800 text-white flex flex-col items-center py-4 space-y-4">
      {tools.map((tool) => (
        <button
          key={tool.id}
          className={`p-2 rounded-lg ${selectedTool === tool.id ? 'bg-blue-500' : 'hover:bg-gray-700'}`}
          onClick={() => setSelectedTool(tool.id)}
          title={tool.name}
        >
          {tool.name.charAt(0)}
        </button>
      ))}
    </div>
  );
};

export default Toolbar;