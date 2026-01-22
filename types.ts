
export enum DAPPath {
  STYLE_TRANSFER = 'STYLE_TRANSFER',
  SUBJECT_SWAP = 'SUBJECT_SWAP',
  PURE_RESTORATION = 'PURE_RESTORATION'
}

export enum BackgroundColor {
  AUTO = 'AUTO',
  BLACK = 'BLACK',
  WHITE = 'WHITE'
}

export enum TextOption {
  NONE = 'NONE',
  ENABLED = 'ENABLED'
}

export interface VisualAnchor {
  x: number; // Normalized 0-1
  y: number; // Normalized 0-1
  label: string;
}

export interface DisentanglementResult {
  subject: string;
  action: string;
  style: string;
  lighting: string;
  color: string;
  composition: string;
  environment: string;
  texture: string;
}

export interface TransformationResult {
  id: string;
  imageUrl: string;
  prompt: string;
  timestamp: number;
  tags?: string[];
  description?: string;
}

export interface AppState {
  sourceImage: string | null;
  isAnalyzing: boolean;
  isTransforming: boolean;
  analysis: DisentanglementResult | null;
  selectedPath: DAPPath;
  selectedBgColor: BackgroundColor;
  selectedTextOption: TextOption;
  selectedAspectRatio: string;
  gridConfig: { rows: number; cols: number };
  pivotInput: string;
  pivotImages: string[];
  result: TransformationResult | null;
  errorMessage: string | null;
  gallery: TransformationResult[];
}
