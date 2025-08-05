import React, { useEffect, useRef } from 'react';
import { Line } from 'react-konva';
import type { Element } from '../../types/Whiteboard';
import { useBoardStore } from '../../store/boardStore';

const FreehandDrawing: React.FC<{ element: Element }> = ({ element }) => {
  const { updateElement } = useBoardStore();
  const lineRef = useRef<any>(null);
  const isDrawing = useRef(false);

  // Handle drawing updates
  useEffect(() => {
    if (lineRef.current && element.points) {
      lineRef.current.points(element.points);
    }
  }, [element.points]);

  return (
    <Line
      ref={lineRef}
      points={element.points || []}
      stroke={element.style?.stroke || '#000000'}
      strokeWidth={element.style?.strokeWidth || 3}
      lineCap="round"
      lineJoin="round"
      tension={0}
      globalCompositeOperation={
        element.type === 'Eraser' ? 'destination-out' : 'source-over'
      }
      onMouseDown={(e) => {
        isDrawing.current = true;
        const pos = e.target.getStage()?.getPointerPosition();
        if (pos) {
          updateElement(element.id, {
            points: [...(element.points || []), pos.x, pos.y]
          });
        }
      }}
      onMouseMove={(e) => {
        if (!isDrawing.current) return;
        const pos = e.target.getStage()?.getPointerPosition();
        if (pos) {
          updateElement(element.id, {
            points: [...(element.points || []), pos.x, pos.y]
          });
        }
      }}
      onMouseUp={() => {
        isDrawing.current = false;
      }}
      onMouseLeave={() => {
        isDrawing.current = false;
      }}
    />
  );
};

export default FreehandDrawing;