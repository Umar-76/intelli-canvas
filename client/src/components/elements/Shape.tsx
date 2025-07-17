import React, { useRef } from 'react';
import { Rect, Circle, Arrow, Group } from 'react-konva';
import type { Element } from '../../types/Whiteboard';
import { useBoardStore } from '../../store/boardStore';

const Shape: React.FC<{ element: Element }> = ({ element }) => {
  const { updateElement } = useBoardStore();
  const shapeRef = useRef<any>(null);

  const commonProps = {
    ref: shapeRef,
    x: 0,
    y: 0,
    fill: element.style?.fill || '#dddddd',
    stroke: element.style?.stroke || '#000000',
    strokeWidth: element.style?.strokeWidth || 1,
    draggable: true,
    onDragEnd: (e: any) => {
      updateElement(element.id, {
        position: { 
          x: element.position.x + e.target.x(), 
          y: element.position.y + e.target.y() 
        }
      });
      e.target.position({ x: 0, y: 0 });
    },
    onTransformEnd: () => {
      const node = shapeRef.current;
      updateElement(element.id, {
        size: {
          width: node.width() * node.scaleX(),
          height: node.height() * node.scaleY()
        }
      });
      node.scaleX(1);
      node.scaleY(1);
    }
  };

  return (
    <Group
      x={element.position.x}
      y={element.position.y}
    >
      {element.type === 'rectangle' && (
        <Rect
          {...commonProps}
          width={element.size?.width || 100}
          height={element.size?.height || 60}
        />
      )}
      {element.type === 'circle' && (
        <Circle
          {...commonProps}
          radius={element.size?.width ? element.size.width / 2 : 50}
        />
      )}
      {element.type === 'arrow' && (
        <Arrow
          {...commonProps}
          points={[0, 0, element.size?.width || 100, element.size?.height || 50]}
          pointerLength={10}
          pointerWidth={10}
        />
      )}
    </Group>
  );
};

export default Shape;