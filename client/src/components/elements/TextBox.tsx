import React, { useState, useRef } from 'react';
import { Text } from 'react-konva';
import type { Element } from '../../types/Whiteboard';
import { useBoardStore } from '../../store/boardStore';

const TextBox: React.FC<{ element: Element }> = ({ element }) => {
  const { updateElement } = useBoardStore();
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(element.content || '');
  const textRef = useRef<any>(null);

  return isEditing ? (
    <input
      autoFocus
      style={{
        position: 'absolute',
        left: `${element.position.x}px`,
        top: `${element.position.y}px`,
        fontSize: `${element.style?.fontSize || 16}px`,
        border: 'none',
        background: 'transparent',
        outline: 'none',
        color: element.style?.textColor || '#000000'
      }}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={() => {
        updateElement(element.id, { 
          content: text,
          size: {
            width: textRef.current?.width() || 100,
            height: textRef.current?.height() || 30
          }
        });
        setIsEditing(false);
      }}
    />
  ) : (
    <Text
      ref={textRef}
      x={element.position.x}
      y={element.position.y}
      text={text || 'Click to edit'}
      fontSize={element.style?.fontSize || 16}
      fontFamily="Arial"
      fill={element.style?.textColor || '#000000'}
      draggable
      onDragEnd={(e) => {
        updateElement(element.id, {
          position: { x: e.target.x(), y: e.target.y() }
        });
        e.target.position({ x: 0, y: 0 });
      }}
      onClick={() => setIsEditing(true)}
    />
  );
};

export default TextBox;