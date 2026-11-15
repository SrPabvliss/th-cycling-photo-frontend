// Words of the house banners, copied from the design pieces (BT in the demo's ads.js). The
// generated banner files only hold {{markers}} that this object fills; nothing else ever does.
export type PieceFormatKey = 'A' | 'B' | 'C' | 'D' | 'E'
export type PieceMessage = 'marca' | 'organizador'

export const PIECE_COPY = {
  A: {
    marca: {
      label: 'Anúnciate en Titan',
      eyebrow: 'ESPACIO PUBLICITARIO',
      title: 'Tu marca aquí',
      text: 'Llega a quienes corren downhill.',
      cta: 'Anúnciate',
    },
    organizador: {
      label: 'Titan cubre tu carrera',
      eyebrow: 'PARA ORGANIZADORES',
      title: 'Cubrimos tu carrera',
      text: 'Tus corredores compran sus fotos aquí.',
      cta: 'Cotizar cobertura',
    },
  },
  B: {
    marca: {
      label: 'Anúnciate en Titan',
      eyebrow: 'ESPACIO PUBLICITARIO',
      title: 'Tu marca aquí',
      text: 'Aparece donde los ciclistas de downhill buscan y compran sus fotos.',
      cta: 'Anúnciate',
      proof: '14 eventos · 18.302 fotos publicadas',
    },
    organizador: {
      label: 'Titan cubre tu carrera',
      eyebrow: 'PARA ORGANIZADORES',
      title: 'Cubrimos tu carrera',
      text: 'Fotógrafos en la pista y una galería donde tus corredores compran sus fotos.',
      cta: 'Cotizar cobertura',
      proof: '14 eventos cubiertos · 11 años en los Andes',
    },
  },
  C: {
    marca: {
      label: 'Anúnciate en Titan',
      eyebrow: 'ESPACIO PUBLICITARIO',
      title: 'Tu marca aquí',
      text: 'Justo donde cada corredor busca sus fotos.',
      cta: 'Anúnciate',
    },
    organizador: {
      label: 'Titan cubre tu carrera',
      eyebrow: 'ORGANIZADORES',
      title: 'Cubrimos tu carrera',
      text: 'Tus corredores compran sus fotos aquí.',
      cta: 'Cotizar',
    },
  },
  D: {
    marca: {
      label: 'Anúnciate en Titan',
      title: 'Tu marca aquí',
      text: 'Espacio publicitario disponible',
      cta: 'Anúnciate',
    },
    organizador: {
      label: 'Titan cubre tu carrera',
      title: '¿Organizas una carrera?',
      text: 'Para organizadores · la cubrimos',
      cta: 'Cotizar',
    },
  },
  E: {
    marca: {
      eyebrow: 'ESPACIO PUBLICITARIO',
      title: 'Tu marca presenta la temporada',
      titleM: 'Tu marca aquí',
      text: 'Arriba de cada pantalla de Titan, todo el año',
    },
    organizador: {
      eyebrow: 'PARA ORGANIZADORES',
      title: 'Cubrimos tu carrera',
      titleM: 'Cubrimos tu carrera',
      text: 'Fotógrafos en la pista y tus corredores compran aquí',
    },
  },
} as const satisfies Record<PieceFormatKey, Record<PieceMessage, Record<string, string>>>
