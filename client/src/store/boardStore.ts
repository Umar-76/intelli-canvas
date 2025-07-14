import create from 'zustand';
import { persist } from 'zustand/middleware';

type Element = {
  id: string;
  type: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  content: string;
  style: Record<string, any>;
};

type BoardState = {
  currentBoardId: string | null;
  title: string;
  elements: Record<string, Element>;
  selectedTool: string;
  initializeBoard: (boardData: any) => void;
  addElement: (element: Element) => void;
  updateElement: (id: string, updates: Partial<Element>) => void;
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
    elements: boardData.elements.reduce((acc: Record<string, Element>, el: Element) => {
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
  setSelectedTool: (tool) => set({ selectedTool: tool })
}));