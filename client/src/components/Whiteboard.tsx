import React, { useRef, useEffect } from 'react';
import Konva from 'konva';
import { Stage, Layer } from 'react-konva';
import { useBoardStore } from '../store/boardStore';
import StickyNote from './elements/StickyNote';
import TextBox from './elements/TextBox';
import Shape from './elements/Shape';
import FreehandDrawing from './elements/FreehandDrawing';

const Whiteboard: React.FC = () => {
  const stageRef = useRef<Konva.Stage>(null);
  const { elements, selectedTool, addElement, updateElement } = useBoardStore();

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target !== stageRef.current) return;

    const { x, y } = stageRef.current?.getPointerPosition() || { x: 0, y: 0 };
    
    const newElement = {
      id: Date.now().toString(),
      type: selectedTool,
      position: { x, y },
      size: { width: 200, height: 150 },
      content: '',
      style: { color: '#ffff88', fontSize: 16 }
    };

    addElement(newElement);
  };

  return (
    <Stage
      ref={stageRef}
      width={window.innerWidth}
      height={window.innerHeight}
      onClick={handleStageClick}
      className="bg-gray-100"
    >
      <Layer>
        {Object.values(elements).map(element => {
          switch (element.type) {
            case 'sticky-note':
              return <StickyNote key={element.id} element={element} />;
            case 'text':
              return <TextBox key={element.id} element={element} />;
            case 'rectangle':
            case 'circle':
            case 'arrow':
              return <Shape key={element.id} element={element} />;
            case 'drawing':
              return <FreehandDrawing key={element.id} element={element} />;
            default:
              return null;
          }
        })}
      </Layer>
    </Stage>
  );
};

export default Whiteboard;