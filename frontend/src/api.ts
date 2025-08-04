const API_URL = import.meta.env.PROD 
  ? 'https://api-textoia.onrender.com'
  : 'http://localhost:5173/api';

export const enviarTexto = async (text: string): Promise<string> => {
  try {
    const response = await fetch(`${API_URL}/submit`, {
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
    return data.jobId;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error('Error de conexión con el servidor. Por favor, intenta de nuevo.');
    }
    throw error;
  }
};

export const consultarAnalisis = async (jobId: string) => {
  const response = await fetch(`${API_URL}/job/${jobId}`);

  if (!response.ok) {
    throw new Error(`Error al consultar análisis: ${response.status}`);
  }

  const data = await response.json();
  console.log('Respuesta del servidor (consultarAnalisis):', data);
  return data;
};