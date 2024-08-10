export interface Shape {
    id: string;
    type?:string;
    x: number;
    y: number;
    width: number;
    height: number;
    lockedBy?: string; // User ID who locked the shape
  }
  