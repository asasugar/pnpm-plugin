export interface IAnswers {
  name: string;
  description: string;
  version: string;
  keywords: string;
}

export interface IQuestion {
  type: string;
  message: string;
  name: string;
  default: string;
  when?: () => void;
}
