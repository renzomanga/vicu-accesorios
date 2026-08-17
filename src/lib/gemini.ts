import { GoogleGenAI, Type } from '@google/genai'

// Reemplaza a la API de Claude (visión) del plan original: se usa Gemini
// para extraer los datos de las capturas de órdenes de compra en JSON estructurado.

const MODEL = 'gemini-2.5-flash'

const ordenExtraidaSchema = {
  type: Type.OBJECT,
  properties: {
    proveedor: { type: Type.STRING, description: 'Nombre del proveedor tal como figura en la orden' },
    numero_orden: { type: Type.STRING, nullable: true },
    fecha: { type: Type.STRING, description: 'Fecha en formato YYYY-MM-DD, si se puede inferir', nullable: true },
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          nombre: { type: Type.STRING },
          precio_unitario: { type: Type.NUMBER },
          cantidad: { type: Type.NUMBER },
          subtotal_linea: { type: Type.NUMBER, nullable: true },
        },
        required: ['nombre', 'precio_unitario', 'cantidad'],
      },
    },
    subtotal: { type: Type.NUMBER, nullable: true },
    descuento: { type: Type.NUMBER, nullable: true },
    costo_envio: { type: Type.NUMBER, nullable: true },
    total: { type: Type.NUMBER, nullable: true },
  },
  required: ['proveedor', 'items'],
}

export type OrdenExtraidaItem = {
  nombre: string
  precio_unitario: number
  cantidad: number
  subtotal_linea?: number | null
}

export type OrdenExtraida = {
  proveedor: string
  numero_orden?: string | null
  fecha?: string | null
  items: OrdenExtraidaItem[]
  subtotal?: number | null
  descuento?: number | null
  costo_envio?: number | null
  total?: number | null
}

export type ImagenCaptura = {
  base64: string // sin el prefijo data:...;base64,
  mimeType: string
}

const PROMPT = `Sos un asistente que extrae datos de órdenes de compra de insumos de bijouterie/joyería a partir de capturas de pantalla (por ejemplo, de WhatsApp o el sitio de un proveedor como Zagala).

Analizá la(s) imagen(es) adjunta(s), que corresponden a la MISMA orden de compra (puede venir en varias capturas), y devolvé la información estructurada según el schema dado.

Reglas:
- Cada línea de "items" es un insumo distinto con su precio unitario y cantidad.
- Si un monto no aparece en la imagen, dejalo null (no inventes valores).
- Si el proveedor no está explícito, usá el nombre más probable a partir del contexto (ej. "Zagala").

FORMATO DE NÚMEROS — MUY IMPORTANTE:
Los montos en la imagen están escritos en formato argentino: el PUNTO separa miles y la COMA separa decimales (es al revés que en inglés). El punto de miles NUNCA indica decimales.
- "$23.999" en la imagen significa veintitrés mil novecientos noventa y nueve. Debés devolver 23999, NUNCA 23.699 ni 23.999 como si el punto fuera decimal.
- "$1.049" significa mil cuarenta y nueve → devolver 1049.
- "$102.699" significa ciento dos mil seiscientos noventa y nueve → devolver 102699.
- "$1.234,50" significa mil doscientos treinta y cuatro con cincuenta centavos → devolver 1234.5 (ahí sí el valor después de la coma es decimal).
En el JSON de salida, los números van como números planos sin separador de miles, usando punto solo si hay centavos reales (los que en la imagen están después de una coma).`

export async function extraerOrdenDeCapturas(imagenes: ImagenCaptura[]): Promise<OrdenExtraida> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('Falta GEMINI_API_KEY en las variables de entorno')
  }

  const ai = new GoogleGenAI({ apiKey })

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [
      {
        role: 'user',
        parts: [
          { text: PROMPT },
          ...imagenes.map((img) => ({
            inlineData: { data: img.base64, mimeType: img.mimeType },
          })),
        ],
      },
    ],
    config: {
      responseMimeType: 'application/json',
      responseSchema: ordenExtraidaSchema,
    },
  })

  const text = response.text
  if (!text) {
    throw new Error('Gemini no devolvió contenido')
  }

  return JSON.parse(text) as OrdenExtraida
}
