'use server'

import { extraerOrdenDeCapturas, type OrdenExtraida } from '@/lib/gemini'

export async function extraerCapturasAction(formData: FormData): Promise<OrdenExtraida> {
  const files = formData.getAll('imagenes').filter((f): f is File => f instanceof File && f.size > 0)
  if (files.length === 0) {
    throw new Error('Subí al menos una imagen')
  }

  const imagenes = await Promise.all(
    files.map(async (file) => {
      const buffer = Buffer.from(await file.arrayBuffer())
      return { base64: buffer.toString('base64'), mimeType: file.type || 'image/jpeg' }
    })
  )

  return extraerOrdenDeCapturas(imagenes)
}
