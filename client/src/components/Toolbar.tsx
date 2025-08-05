import React from 'react';
import { useBoardStore } from '../store/boardStore';
import { Tooltip } from '@mui/material';     // or your favorite UI lib
import { FiMousePointer, FiType, FiSquare, FiCircle, FiArrowRight, FiEdit, FiTrash2 } from 'react-icons/fi';
import { FaStickyNote } from 'react-icons/fa';
import type { IconType } from 'react-icons';
import './Toolbar.css';

type Tool = {
  name: string;
  Icon: IconType;
};

const TOOLS: Tool[] = [
  { name: 'Select', Icon: FiMousePointer },
  { name: 'Sticky', Icon: FaStickyNote },
  { name: 'Text',   Icon: FiType },
  { name: 'Rect',   Icon: FiSquare },
  { name: 'Circle', Icon: FiCircle },
  { name: 'Arrow',  Icon: FiArrowRight },
  { name: 'Draw',   Icon: FiEdit },
  { name: 'Eraser', Icon: FiTrash2 },
];

const Toolbar: React.FC = () => {
  const { selectedTool, setSelectedTool } = useBoardStore();

  return (
    <div className="toolbar">
      <div className = "tool-group">
        {TOOLS.map(({ name, Icon }) => (
          <Tooltip key={name} title={name} placement="top">
            <button
              className={`tool-button${selectedTool === name ? ' active' : ''}`}
              onClick={() => setSelectedTool(name)}
            >
              <Icon size={20} />
            </button>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};

export default Toolbar;