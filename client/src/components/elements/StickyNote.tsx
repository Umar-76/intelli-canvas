import React, { useState } from 'react';
import { Group, Rect, Text } from 'react-konva';
import type { Element } from '../../types/Whiteboard';
import { useBoardStore } from '../../store/boardStore';

const StickyNote: React.FC<{ element: Element }> = ({ element }) => {
  const { updateElement } = useBoardStore();
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(element.content || '');

  return (
    <Group
      x={element.position.x}
      y={element.position.y}
      draggable
      onDragEnd={(e) => {
        updateElement(element.id, {
          position: { x: e.target.x(), y: e.target.y() }
        });
        e.target.position({ x: 0, y: 0 }); // Reset group position
      }}
      onDblClick={() => setIsEditing(true)}
    >
      <Rect
        width={element.size?.width || 200}
        height={element.size?.height || 150}
        fill={element.style?.color || '#ffff88'}
        cornerRadius={5}
        shadowBlur={5}
        onTransformEnd={(e) => {
          const node = e.target;
          updateElement(element.id, {
            size: {
              width: node.width() * node.scaleX(),
              height: node.height() * node.scaleY()
            }
          });
          node.scaleX(1);
          node.scaleY(1);
        }}
      />
      {isEditing ? (
        <textarea
          autoFocus
          style={{
            position: 'absolute',
            left: `${element.position.x + 10}px`,
            top: `${element.position.y + 10}px`,
            width: `${(element.size?.width || 200) - 20}px`,
            height: `${(element.size?.height || 150) - 20}px`,
            fontSize: `${element.style?.fontSize || 16}px`,
            border: 'none',
            background: 'transparent',
            outline: 'none',
            resize: 'none'
          }}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => {
            updateElement(element.id, { content: text });
            setIsEditing(false);
          }}
        />
      ) : (
        <Text
          text={element.content || 'Double click to edit'}
          x={10}
          y={10}
          width={(element.size?.width || 200) - 20}
          height={(element.size?.height || 150) - 20}
          fontSize={element.style?.fontSize || 16}
          fontFamily="Arial"
          fill="#000000"
          align="left"
          verticalAlign="top"
          padding={10}
        />
      )}
    </Group>
  );
};

export default StickyNote;