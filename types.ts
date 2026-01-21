export interface PromptResult {
  textPrompt: string;
  jsonPrompt: {
    subject: string;
    medium: string;
    style: string[];
    lighting: string;
    colorPalette: string[];
    composition: string;
    mood: string;
    details: string[];
  };
}

export interface ImageFile {
  file: File;
  previewUrl: string;
  base64: string;
  mimeType: string;
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}