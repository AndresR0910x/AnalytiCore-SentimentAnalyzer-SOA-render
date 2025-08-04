import React, { useState, useEffect } from 'react';
import { Brain, AlertTriangle } from 'lucide-react';
import TextForm from './components/TextForm';
import ResultsCard from './components/ResultsCard';
import { enviarTexto, consultarAnalisis, iniciarAnalisis } from './api';
import { AnalysisResult } from './types';


//Fixed
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center p-4">
          <h2>Algo salió mal.</h2>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Recargar página
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string>('');
  const [currentJobId, setCurrentJobId] = useState<string>(''); // Descomentar esta línea
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  const handleSubmit = async (text: string) => {
    setIsLoading(true);
    setError('');
    setResult(null);
    setCurrentJobId(''); // Limpiar el jobId anterior

    try {
      // Enviar texto para obtener jobId
      const jobId = await enviarTexto(text);
      console.log('JobId recibido:', jobId);
      setCurrentJobId(jobId);

      // Iniciar el análisis en el servicio Java
      await iniciarAnalisis(jobId);

      // Iniciar polling para obtener resultados
      startPolling(jobId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar el texto');
      setIsLoading(false);
    }
  };

  const startPolling = (jobId: string) => {
    const pollJob = async () => {
      try {
        const jobResult = await consultarAnalisis(jobId);
        console.log('Resultado del polling:', jobResult);

        if (jobResult.status === 'COMPLETED') {
          setResult(jobResult);
          setIsLoading(false);
          if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
          }
        } else if (jobResult.status === 'FAILED') {
          setError('El análisis ha fallado. Por favor, intenta de nuevo.');
          setIsLoading(false);
          if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
          }
        }
        // Si está PENDIENTE, continúa el polling
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al consultar el análisis');
        setIsLoading(false);
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
      }
    };

    // Ejecutar inmediatamente
    pollJob();

    // Configurar polling cada 3 segundos
    const interval = setInterval(pollJob, 3000);
    setPollingInterval(interval);
  };

  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TextAnalyzer AI
              </h1>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              He sido desplegado correctamente !
              Por favor funcionaaaa
              Analiza el sentimiento de cualquier texto y descubre palabras clave con inteligencia artificial
            </p>
          </div>

          {/* Form */}
          <TextForm onSubmit={handleSubmit} isLoading={isLoading} />

          {/* Error Message */}
          {error && (
            <div className="w-full max-w-2xl mx-auto mt-8">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-red-800">Error</h3>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Loading or Results */}
          {(isLoading || result) && (
            <ResultsCard result={result} isLoading={isLoading} />
          )}

          {/* Footer Info */}
          <div className="text-center mt-16 text-gray-500 text-sm">
            <p>Análisis powered by AI • Resultados en tiempo real</p>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;