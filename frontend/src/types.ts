export interface AnalysisResult {
  text: string;
  sentiment: 'positivo' | 'negativo' | 'neutro';
  keywords: string[];
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
}

export interface ApiResponse {
  jobId: string;
}

export interface JobStatusResponse extends AnalysisResult {
  jobId: string;
}