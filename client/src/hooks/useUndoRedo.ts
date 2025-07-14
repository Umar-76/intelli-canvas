// client/src/hooks/useUndoRedo.ts
import { useBoardStore } from '../store/boardStore';

const HISTORY_LIMIT = 100;

export const useUndoRedo = () => {
  const { elements, updateElement } = useBoardStore();
  const history = useRef<{ state: Record<string, Element>; timestamp: number }[]>([]);
  const future = useRef<{ state: Record<string, Element>; timestamp: number }[]>([]);
  const currentState = useRef<Record<string, Element>>({});

  const saveState = () => {
    history.current.push({
      state: currentState.current,
      timestamp: Date.now()
    });
    
    if (history.current.length > HISTORY_LIMIT) {
      history.current.shift();
    }
    
    future.current = [];
  };

  const undo = () => {
    if (history.current.length === 0) return;
    
    const prevState = history.current.pop();
    if (!prevState) return;
    
    future.current.push({
      state: currentState.current,
      timestamp: Date.now()
    });
    
    currentState.current = prevState.state;
    updateElements(currentState.current);
  };

  const redo = () => {
    if (future.current.length === 0) return;
    
    const nextState = future.current.pop();
    if (!nextState) return;
    
    history.current.push({
      state: currentState.current,
      timestamp: Date.now()
    });
    
    currentState.current = nextState.state;
    updateElements(currentState.current);
  };

  return { undo, redo, saveState };
};