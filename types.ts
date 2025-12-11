export interface AnalysisResult {
  problemOverview: string;
  detailedBreakdown: string;
  datasetRequirements: string;
  expectedSolution: string;
  genAiUseCases: string;
  realLifeScenario: string;
  flowcharts: string;
  juryQuestions: string;
  pptSummary: string;
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}
