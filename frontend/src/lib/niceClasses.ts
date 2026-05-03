export interface NiceClass {
  number: number
  label: string
}

export const NICE_CLASSES: NiceClass[] = [
  { number: 1,  label: 'Productos químicos' },
  { number: 2,  label: 'Pinturas y barnices' },
  { number: 3,  label: 'Cosméticos y productos de limpieza' },
  { number: 4,  label: 'Lubricantes y combustibles' },
  { number: 5,  label: 'Productos farmacéuticos' },
  { number: 6,  label: 'Metales comunes' },
  { number: 7,  label: 'Maquinaria e instrumentos mecánicos' },
  { number: 8,  label: 'Herramientas manuales' },
  { number: 9,  label: 'Aparatos e instrumentos científicos y electrónicos' },
  { number: 10, label: 'Aparatos e instrumentos médicos' },
  { number: 11, label: 'Aparatos de iluminación, calefacción y refrigeración' },
  { number: 12, label: 'Vehículos y medios de transporte' },
  { number: 13, label: 'Armas de fuego y explosivos' },
  { number: 14, label: 'Metales preciosos y joyería' },
  { number: 15, label: 'Instrumentos musicales' },
  { number: 16, label: 'Papel, cartón y artículos de oficina' },
  { number: 17, label: 'Caucho, goma y plásticos' },
  { number: 18, label: 'Artículos de cuero y bolsas' },
  { number: 19, label: 'Materiales de construcción' },
  { number: 20, label: 'Muebles y artículos del hogar' },
  { number: 21, label: 'Utensilios domésticos y de cocina' },
  { number: 22, label: 'Cuerdas, redes y lonas' },
  { number: 23, label: 'Hilos y fibras textiles' },
  { number: 24, label: 'Tejidos y textiles' },
  { number: 25, label: 'Vestimenta y calzado' },
  { number: 26, label: 'Encajes, bordados y adornos' },
  { number: 27, label: 'Alfombras y revestimientos de suelo' },
  { number: 28, label: 'Juegos, juguetes y artículos deportivos' },
  { number: 29, label: 'Carne, pescado y alimentos procesados' },
  { number: 30, label: 'Café, té, harinas y cereales' },
  { number: 31, label: 'Frutas y verduras frescas' },
  { number: 32, label: 'Cervezas y bebidas no alcohólicas' },
  { number: 33, label: 'Bebidas alcohólicas' },
  { number: 34, label: 'Tabaco y artículos para fumadores' },
  { number: 35, label: 'Publicidad y gestión empresarial' },
  { number: 36, label: 'Seguros y servicios financieros' },
  { number: 37, label: 'Construcción y reparación' },
  { number: 38, label: 'Telecomunicaciones' },
  { number: 39, label: 'Transporte y almacenamiento' },
  { number: 40, label: 'Tratamiento de materiales' },
  { number: 41, label: 'Educación y entretenimiento' },
  { number: 42, label: 'Servicios científicos y tecnológicos' },
  { number: 43, label: 'Servicios de alimentación y alojamiento' },
  { number: 44, label: 'Servicios médicos, veterinarios y de belleza' },
  { number: 45, label: 'Servicios jurídicos y de seguridad' },
]

export function getNiceClassLabel(num: number): string {
  return NICE_CLASSES.find(c => c.number === num)?.label ?? `Clase ${num}`
}
