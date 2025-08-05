import React, { useRef, useEffect } from 'react';
import Konva from 'konva';
import { Stage, Layer, Line } from 'react-konva';
import { useBoardStore } from '../store/boardStore';
import StickyNote from './elements/StickyNote';
import TextBox from './elements/TextBox';
import Shape from './elements/Shape';
import FreehandDrawing from './elements/FreehandDrawing';

const Whiteboard: React.FC = () => {
  const stageRef = useRef<Konva.Stage>(null);
  const { elements, selectedTool, addElement, updateElement } = useBoardStore();
  const isDrawing = useRef(false);
  const GRID_SIZE = 40;
  const currentDrawingId = useRef<string | null>(null);
  const renderGrid = () => {
  const lines = [];
  const width = window.innerWidth;
  const height = window.innerHeight;

  for (let i = 0; i < width / GRID_SIZE; i++) {
    lines.push(
      <Line
        key={`v-${i}`}
        points={[i * GRID_SIZE, 0, i * GRID_SIZE, height]}
        stroke="#e0e0e0"
        strokeWidth={1}
        listening={false}
      />
    );
  }
  for (let j = 0; j < height / GRID_SIZE; j++) {
    lines.push(
      <Line
        key={`h-${j}`}
        points={[0, j * GRID_SIZE, width, j * GRID_SIZE]}
        stroke="#e0e0e0"
        strokeWidth={1}
        listening={false}
      />
    );
  }
  return lines;
};
  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target !== stageRef.current || selectedTool === 'drawing' || selectedTool === 'eraser') return;

    const { x, y } = stageRef.current?.getPointerPosition() || { x: 0, y: 0 };
    
    const newElement = {
      id: Date.now().toString(),
      type: selectedTool,
      position: { x, y },
      points: [x, y],
      size: { width: 200, height: 150 },
      content: '',
      style: { color: '#ffff88', fontSize: 16, stroke: '#000000', strokeWidth: 3 }
    };

    addElement(newElement);
  };

  const handleDrawingStart = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (selectedTool !== 'Draw' && selectedTool !== 'Eraser') return;
    
    isDrawing.current = true;
    const { x, y } = stageRef.current?.getPointerPosition() || { x: 0, y: 0 };
    
    const newElement = {
      id: Date.now().toString(),
      type: selectedTool,
      position: { x: 0, y: 0 },
      points: [x, y],
      size: { width: 0, height: 0 },
      content: '',
      style: {
        stroke: selectedTool === 'Eraser' ? '#ffffff' : '#000000',
        strokeWidth: selectedTool === 'Eraser' ? 20 : 3
      }
    };

    currentDrawingId.current = newElement.id;
    addElement(newElement);
  };

  const handleDrawingMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing.current || !currentDrawingId.current) return;
    
    const { x, y } = stageRef.current?.getPointerPosition() || { x: 0, y: 0 };
    const element = elements[currentDrawingId.current];
    
    if (element) {
      updateElement(currentDrawingId.current, {
        points: [...(element.points || []), x, y]
      });
    }
  };

  const handleDrawingEnd = () => {
    isDrawing.current = false;
    currentDrawingId.current = null;
  };


  return (
    <Stage
      ref={stageRef}
      width={window.innerWidth}
      height={window.innerHeight}
      onClick={handleStageClick}
      onMouseDown={handleDrawingStart}
      onMouseMove={handleDrawingMove}
      onMouseUp={handleDrawingEnd}
      onMouseLeave={handleDrawingEnd}
      className="bg-gray-100"
    >
      <Layer>{renderGrid()}</Layer>
      <Layer>
        {Object.values(elements).map(element => {
          switch (element.type) {
            case 'Sticky':
              return <StickyNote key={element.id} element={element} />;
            case 'Text':
              return <TextBox key={element.id} element={element} />;
            case 'Rect':
            case 'Circle':
            case 'Arrow':
              return <Shape key={element.id} element={element} />;
            case 'Draw':
            case 'Eraser':
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