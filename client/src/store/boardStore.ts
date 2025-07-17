import {create} from 'zustand';
import { persist } from 'zustand/middleware';

type BoardElement = {
  id: string;
  type: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  content: string;
  style: Record<string, any>;
  points: number[]; // For freehand drawings
};

type BoardState = {
  currentBoardId: string | null;
  title: string;
  elements: Record<string, BoardElement>;
  selectedTool: string;
  initializeBoard: (boardData: any) => void;
  addElement: (element: BoardElement) => void;
  updateElement: (id: string, updates: Partial<BoardElement>) => void;
  setElements: (elements: Record<string, BoardElement> | ((prev: Record<string, BoardElement>) => Record<string, BoardElement>)) => void;
  setSelectedTool: (tool: string) => void;
};

export const useBoardStore = create<BoardState>((set) => ({
  currentBoardId: null,
  title: '',
  elements: {},
  selectedTool: 'select',
  initializeBoard: (boardData) => set({
    currentBoardId: boardData._id,
    title: boardData.title,
    elements: boardData.elements.reduce((acc: Record<string, BoardElement>, el: BoardElement) => {
      acc[el.id] = el;
      return acc;
    }, {})
  }),
  addElement: (element) => set((state) => ({
    elements: { ...state.elements, [element.id]: element }
  })),
  updateElement: (id, updates) => set((state) => ({
    elements: { 
      ...state.elements, 
      [id]: { ...state.elements[id], ...updates } 
    }
  })),
  setElements: (elements) => set(state => ({
    elements: typeof elements === 'function' ? elements(state.elements) : elements
  })),
  setSelectedTool: (tool) => set({ selectedTool: tool })
}));