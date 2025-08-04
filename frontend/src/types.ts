export interface AnalysisResult {
  jobId: string; // Añadido para alinear con JobStatusResponse
  text: string;
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | null; // Alineado con el backend
  keywords: string | null; // Cambiado de string[] a string | null
  status: 'COMPLETADO' | 'PENDIENTE' | 'FALLIDO'; // Alineado con los logs
}

export interface ApiResponse {
  jobId: string;
}

// JobStatusResponse no necesita extender AnalysisResult, ya que es idéntico
export type JobStatusResponse = AnalysisResult;