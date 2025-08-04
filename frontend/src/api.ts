// api.ts - Configuración mejorada con manejo de CORS

// Configuración de URLs base
const API_URLS = {
  submission: 'https://api-submission-service.onrender.com',
  analysis: 'https://api-analysis-service-v1.onrender.com'
};

// Configuración común para las peticiones
const commonHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// Configuración común para fetch
const fetchConfig = {
  mode: 'cors' as RequestMode,
  credentials: 'include' as RequestCredentials,
  headers: commonHeaders,
};

export const enviarTexto = async (text: string): Promise<string> => {
  try {
    console.log('Enviando texto a:', `${API_URLS.submission}/submit`);
    
    const response = await fetch(`${API_URLS.submission}/submit`, {
      ...fetchConfig,
      method: 'POST',
      body: JSON.stringify({ text }),
    });

    console.log('Estado de respuesta:', response.status);
    console.log('Headers de respuesta:', response.headers);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error del servidor:', errorText);
      throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Respuesta del servidor (enviarTexto):', data);
    
    if (!data.jobId) {
      throw new Error('No se recibió un jobId válido');
    }
    
    return data.jobId;
  } catch (error) {
    console.error('Error en enviarTexto:', error);
    
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error('Error de conexión con el servidor. Verifica que el servicio esté funcionando.');
    }
    
    if (error instanceof Error && error.message.includes('CORS')) {
      throw new Error('Error de CORS. El servidor no permite conexiones desde este dominio.');
    }
    
    throw error;
  }
};

export const consultarAnalisis = async (jobId: string) => {
  try {
    console.log('Consultando análisis para jobId:', jobId);
    
    const response = await fetch(`${API_URLS.submission}/job/${jobId}`, {
      ...fetchConfig,
      method: 'GET',
    });

    console.log('Estado de respuesta consultarAnalisis:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error al consultar análisis:', errorText);
      throw new Error(`Error al consultar análisis: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Respuesta del servidor (consultarAnalisis):', data);
    return data;
  } catch (error) {
    console.error('Error en consultarAnalisis:', error);
    throw error;
  }
};

export const iniciarAnalisis = async (jobId: string): Promise<void> => {
  try {
    console.log('Iniciando análisis para jobId:', jobId);
    
    const response = await fetch(`${API_URLS.analysis}/analyze`, {
      ...fetchConfig,
      method: 'POST',
      body: JSON.stringify({ jobId }),
    });

    console.log('Estado de respuesta iniciarAnalisis:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error al iniciar análisis:', errorText);
      throw new Error(`Error al iniciar análisis: ${response.status} - ${errorText}`);
    }

    const responseText = await response.text();
    console.log('Respuesta del servidor (iniciarAnalisis):', responseText);
    
    // Intentar parsear como JSON si es posible
    try {
      const data = JSON.parse(responseText);
      if (data.error) {
        throw new Error(data.error);
      }
    } catch (parseError) {
      // Si no es JSON válido, usar el texto como respuesta válida
      console.log('Respuesta no es JSON, usando texto:', responseText);
    }
  } catch (error) {
    console.error('Error en iniciarAnalisis:', error);
    throw error;
  }
};

// Función auxiliar para verificar conectividad
export const verificarConectividad = async (): Promise<{
  submission: boolean;
  analysis: boolean;
}> => {
  const resultados = {
    submission: false,
    analysis: false,
  };

  try {
    const responseSubmission = await fetch(`${API_URLS.submission}/health`, {
      ...fetchConfig,
      method: 'GET',
    });
    resultados.submission = responseSubmission.ok;
  } catch (error) {
    console.error('Error conectando con submission service:', error);
    resultados.submission = false;
  }

  try {
    const responseAnalysis = await fetch(`${API_URLS.analysis}/health`, {
      ...fetchConfig,
      method: 'GET',
    });
    resultados.analysis = responseAnalysis.ok;
  } catch (error) {
    console.error('Error conectando con analysis service:', error);
    resultados.analysis = false;
  }

  return resultados;
};