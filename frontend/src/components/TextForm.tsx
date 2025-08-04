import React, { useState } from 'react';
import { Send, AlertCircle } from 'lucide-react';

interface TextFormProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
}

const TextForm: React.FC<TextFormProps> = ({ onSubmit, isLoading }) => {
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text || !text.trim()) {
      setError('Por favor, ingresa un texto para analizar');
      return;
    }

    const trimmedText = text.trim();
    if (trimmedText.length < 5) {
      setError('El texto debe tener al menos 5 caracteres');
      return;
    }

    setError('');
    onSubmit(trimmedText);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    if (error) setError('');
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Análisis de Sentimiento de Texto
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 mb-2">
              Escribe tu texto para analizar:
            </label>
            <textarea
              id="text-input"
              value={text}
              onChange={handleTextChange}
              placeholder="Ingresa aquí el texto que quieres analizar..."
              className={`w-full h-32 px-4 py-3 border-2 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
              }`}
              disabled={isLoading}
            />
            {error && (
              <div className="flex items-center mt-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                {error}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !text.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analizando...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Enviar texto para análisis
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TextForm;