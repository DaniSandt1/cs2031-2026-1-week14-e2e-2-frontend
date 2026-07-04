import axios from 'axios';

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;

    if (data && typeof data.error === 'string') {
      return data.error;
    }

    if (data && typeof data === 'object') {
      const firstEntry = Object.entries(data)[0];

      if (firstEntry && typeof firstEntry[1] === 'string') {
        return `${firstEntry[0]}: ${firstEntry[1]}`;
      }
    }

    if (typeof error.message === 'string' && error.message.length > 0) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }

  return 'Ocurrio un error inesperado. Intenta nuevamente.';
}
