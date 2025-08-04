import React from 'react';
import { Loader2 } from 'lucide-react';
import { AnalysisResult } from '../types';

interface ResultsCardProps {
  result: AnalysisResult | null;
  isLoading: boolean;
}

const ResultsCard: React.FC<ResultsCardProps> = ({ result, isLoading }) => {
  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto mt-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-gray-600">Analizando texto...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!result || !result.sentiment) {
    return null;
  }

  // Convertir keywords de cadena a array, manejando casos donde sea null
  const keywordsArray = result.keywords ? result.keywords.split(',').map((keyword: string) => keyword.trim()) : [];

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Resultados del Análisis</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Sentimiento</h3>
            <p className="text-lg font-medium text-gray-900 capitalize">
              {result.sentiment.toLowerCase()}
            </p>
          </div>

          {keywordsArray.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Palabras Clave</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {keywordsArray.map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultsCard;