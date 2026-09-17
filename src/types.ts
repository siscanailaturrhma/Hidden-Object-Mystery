export interface HiddenItem {
  id: string;
  name: string;
  indonesianName: string;
  clue: string;
  category: 'antique' | 'paper' | 'metal' | 'magic' | 'cozy';
  found: boolean;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  color: string;
  meshType: 'key' | 'watch' | 'magnifier' | 'book' | 'potion' | 'crystal' | 'compass' | 'camera' | 'scroll' | 'cup' | 'pipe' | 'gem';
  hiddenInside?: string; // id of container if placed inside an interactable (e.g., 'drawer' or 'chest')
}

export interface InteractiveContainer {
  id: string;
  name: string;
  isOpen: boolean;
  position: [number, number, number];
  type: 'chest' | 'drawer' | 'cupboard';
}

export type RoomEnvironment =
  | 'study'
  | 'alchemy'
  | 'bookstore'
  | 'observatory'
  | 'clocktower'
  | 'greenhouse'
  | 'pirate_cabin'
  | 'art_studio'
  | 'oriental_teahouse'
  | 'vault';

export interface GameLevel {
  id: string;
  title: string;
  subtitle: string;
  difficulty: 'Mudah' | 'Sedang' | 'Tantangan' | 'Sulit' | 'Ekstrem';
  targetItemsCount: number;
  timeLimitSeconds: number; // 0 for unlimited in cozy mode
  themeColor: string;
  environment: RoomEnvironment;
  description: string;
  items: HiddenItem[];
  containers?: InteractiveContainer[];
}

export type GameMode = 'cozy' | 'timed';

export interface GameStats {
  score: number;
  foundCount: number;
  totalCount: number;
  timeElapsed: number;
  hintsUsed: number;
  misclicks: number;
  stars: number;
}
