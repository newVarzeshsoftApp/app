export interface IntroductionMethod {
  id: number;
  title?: string;
  [key: string]: any;
}

export interface IntroductionMethodResponse {
  total?: number;
  content?: IntroductionMethod[];
  [key: string]: any;
}
