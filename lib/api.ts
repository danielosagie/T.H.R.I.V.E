import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

export async function generatePersona(formData: Record<string, unknown>) {
  try {
    const response = await axios.post(`${API_BASE_URL}/generate_persona_stream`, formData)
    return response.data
  } catch (error) {
    console.error('Error generating persona:', error)
    throw error
  }
}
