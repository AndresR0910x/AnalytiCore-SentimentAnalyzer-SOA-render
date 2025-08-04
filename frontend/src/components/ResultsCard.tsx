import React from 'react';
import { CheckCircle, AlertCircle, Clock, Hash, MessageSquare } from 'lucide-react';
import { AnalysisResult } from '../types';

interface ResultsCardProps {
  result: AnalysisResult | null;
  isLoading?: boolean;
}

const getSentimentConfig = (sentiment: string) => {
  switch (sentiment.toLowerCase()) {
    case 'positivo':
      return {
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        icon: CheckCircle,
        label: 'Positivo'
      };
    case 'negativo':
      return {
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        icon: AlertCircle,
        label: 'Negativo'
      };
    default:
      return {
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        icon: MessageSquare,
        label: 'Neutro'
      };
  }
};

const ResultsCard: React.FC<ResultsCardProps> = ({ result, isLoading }) => {
  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto mt-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
          <div className="flex items-center justify-center space-x-3 text-blue-600">
            <div className="w-6 h-6 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
            <span className="text-lg font-medium">Procesando análisis...</span>
          </div>
          <div className="mt-4 text-center text-gray-600">
            <p>Esto puede tomar unos segundos</p>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  const sentimentConfig = getSentimentConfig(result.sentiment);
  const SentimentIcon = sentimentConfig.icon;

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 animate-in slide-in-from-bottom duration-500">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <CheckCircle className="w-6 h-6 text-green-600" />
          Resultados del Análisis
        </h3>

        <div className="space-y-6">
          {/* Estado del trabajo */}
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
            <Clock className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-800">Estado: {result.status}</span>
          </div>

          {/* Texto original */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Texto Analizado:
            </h4>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-gray-800 leading-relaxed">{result.text}</p>
            </div>
          </div>

          {/* Sentimiento */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Análisis de Sentimiento:</h4>
            <div className={`p-4 ${sentimentConfig.bgColor} rounded-xl border border-gray-200 flex items-center gap-3`}>
              <SentimentIcon className={`w-6 h-6 ${sentimentConfig.color}`} />
              <span className={`font-bold text-lg ${sentimentConfig.color}`}>
                {sentimentConfig.label}
              </span>
            </div>
          </div>

          {/* Palabras clave */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Hash className="w-4 h-4" />
              Palabras Clave:
            </h4>
            <div className="flex flex-wrap gap-2">
              {result.keywords.length > 0 ? (
                result.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-3 py-2 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 rounded-full text-sm font-medium border border-purple-200 hover:shadow-md transition-shadow"
                  >
                    {keyword}
                  </span>
                ))
              ) : (
                <span className="text-gray-500 italic">No se encontraron palabras clave</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsCard;