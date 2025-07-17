export interface Element {
  id: string;
  type: string;
  position: { x: number; y: number };
  size?: { width: number; height: number };
  content?: string;
  style?: {
    color?: string;
    fontSize?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    textColor?: string;
  };
  points?: number[]; // For freehand drawings
}

export type ElementsMap = Record<string, Element>;