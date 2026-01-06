
export type RoomType = 'living' | 'bedroom' | 'kitchen' | 'bathroom' | 'hallway' | 'outdoor' | 'office' | 'dining' | 'other';

export interface Room {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: RoomType;
}

export interface LayoutData {
  rooms: Room[];
  totalWidth: number;
  totalHeight: number;
  description?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  layout?: LayoutData;
}

export interface GeminiResponse {
  message: string;
  layout?: LayoutData;
}
