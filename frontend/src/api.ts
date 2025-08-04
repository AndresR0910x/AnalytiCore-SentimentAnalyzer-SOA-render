const API_SUBMISSION_URL = 'https://api-submission-service.onrender.com';

const API_ANALYSIS_URL = 'https://api-analysis-service-v1.onrender.com'; // Ajusta el puerto local si el análisis corre en otro servicio

export const enviarTexto = async (text: string): Promise<string> => {
  try {
    const response = await fetch(`${API_SUBMISSION_URL}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`);
    }

    const data = await response.json();
    console.log('Respuesta del servidor (enviarTexto):', data);
    if (!data.jobId) {
      throw new Error('No se recibió un jobId válido');
    }
    return data.jobId;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error('Error de conexión con el servidor. Por favor, intenta de nuevo.');
    }
    throw error;
  }
};

export const consultarAnalisis = async (jobId: string) => {
  const response = await fetch(`${API_SUBMISSION_URL}/job/${jobId}`);

  if (!response.ok) {
    throw new Error(`Error al consultar análisis: ${response.status}`);
  }

  const data = await response.json();
  console.log('Respuesta del servidor (consultarAnalisis):', data);
  return data;
};

// Nueva función para iniciar el análisis en el servicio Java
export const iniciarAnalisis = async (jobId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_ANALYSIS_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ jobId }),
    });

    if (!response.ok) {
      throw new Error(`Error al iniciar análisis: ${response.status}`);
    }

    const data = await response.json();
    console.log('Respuesta del servidor (iniciarAnalisis):', data);
    if (data.error) {
      throw new Error(data.error);
    }
  } catch (error) {
    throw error;
  }
};