export interface IAnswers {
  type: string;
  name: string;
  description: string;
  version: string;
  keywords: string;
}

export interface IQuestion {
  type: string;
  message: string;
  name: string;
  default?: string;
  choices?: string[];
  when?: () => void;
}
