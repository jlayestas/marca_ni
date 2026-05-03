import { jsPDF } from 'jspdf'
import { autoTable } from 'jspdf-autotable'
import { getNiceClassLabel } from './niceClasses'
import type { SearchResult } from '@/types/trademark'

const NAVY  = '#1B2A4A'
const GOLD  = '#C8960C'
const LIGHT = '#F5F5F5'

function similarityLabel(score: number): string {
  if (score >= 0.9) return 'Exacta'
  if (score >= 0.7) return 'Alta'
  if (score >= 0.5) return 'Parcial'
  return 'Relacionada'
}

function statusLabel(status: string): string {
  if (status === 'En Tramite') return 'En Trámite'
  return status
}

interface ActiveFilters {
  status?: string
  niceClass?: number | null
  owner?: string
  dateFrom?: string
  dateTo?: string
}

interface ExportOptions {
  query: string
  results: SearchResult[]
  activeFilters: ActiveFilters
}

export function exportSearchPdf({ query, results, activeFilters }: ExportOptions) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 14

  // ── Header bar ────────────────────────────────────────────────────────────
  doc.setFillColor(NAVY)
  doc.rect(0, 0, pageW, 20, 'F')

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor('#FFFFFF')
  doc.text('Marcas NI', margin, 13)

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor('#C8960C')
  doc.text('Registro de Marcas · Nicaragua', margin + 30, 13)

  doc.setTextColor('#FFFFFF')
  doc.setFontSize(8)
  doc.text(
    `Generado: ${new Date().toLocaleDateString('es-NI', { year: 'numeric', month: 'long', day: 'numeric' })}`,
    pageW - margin,
    13,
    { align: 'right' }
  )

  // ── Report title ──────────────────────────────────────────────────────────
  let y = 30
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(NAVY)
  doc.text('Informe de Búsqueda de Marcas', margin, y)

  y += 7
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor('#555555')
  doc.text(`Búsqueda: "${query}"`, margin, y)

  // ── Active filters summary ─────────────────────────────────────────────────
  const filterParts: string[] = []
  if (activeFilters.status && activeFilters.status !== 'Todas') filterParts.push(`Estado: ${statusLabel(activeFilters.status)}`)
  if (activeFilters.niceClass) filterParts.push(`Clase NICE: ${activeFilters.niceClass} — ${getNiceClassLabel(activeFilters.niceClass)}`)
  if (activeFilters.owner) filterParts.push(`Titular: ${activeFilters.owner}`)
  if (activeFilters.dateFrom) filterParts.push(`Desde: ${activeFilters.dateFrom}`)
  if (activeFilters.dateTo) filterParts.push(`Hasta: ${activeFilters.dateTo}`)

  if (filterParts.length > 0) {
    y += 5
    doc.setFontSize(8)
    doc.setTextColor('#888888')
    doc.text(`Filtros: ${filterParts.join('  ·  ')}`, margin, y)
  }

  y += 5
  doc.setDrawColor('#E5E7EB')
  doc.setLineWidth(0.3)
  doc.line(margin, y, pageW - margin, y)
  y += 6

  // ── Results count ─────────────────────────────────────────────────────────
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(NAVY)
  doc.text(`${results.length} resultado${results.length !== 1 ? 's' : ''} encontrado${results.length !== 1 ? 's' : ''}`, margin, y)
  y += 4

  // ── Table ─────────────────────────────────────────────────────────────────
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Marca', 'Denominativa', 'Estado', 'Clase NICE', 'Titular', 'Similitud']],
    body: results.map(r => [
      r.nombre_marca,
      r.marca_denominativa,
      statusLabel(r.status),
      r.nice_class ? `Clase ${r.nice_class}` : '—',
      r.dueno,
      `${Math.round(r.similarity_score * 100)}% ${similarityLabel(r.similarity_score)}`,
    ]),
    headStyles: {
      fillColor: NAVY,
      textColor: '#FFFFFF',
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: '#333333',
    },
    alternateRowStyles: {
      fillColor: LIGHT,
    },
    columnStyles: {
      0: { cellWidth: 34, fontStyle: 'bold' },
      1: { cellWidth: 34 },
      2: { cellWidth: 22 },
      3: { cellWidth: 28 },
      4: { cellWidth: 40 },
      5: { cellWidth: 24, halign: 'center' },
    },
    // colour the similarity cell by match strength
    didParseCell(data) {
      if (data.section === 'body' && data.column.index === 5) {
        const score = results[data.row.index]?.similarity_score ?? 0
        if (score >= 0.9)      data.cell.styles.textColor = '#DC2626'
        else if (score >= 0.7) data.cell.styles.textColor = '#EA580C'
        else if (score >= 0.5) data.cell.styles.textColor = '#CA8A04'
        else                   data.cell.styles.textColor = '#6B7280'
      }
    },
    // page numbers in footer
    didDrawPage(data) {
      const total = (doc as unknown as { internal: { getNumberOfPages(): number } }).internal.getNumberOfPages()
      doc.setFontSize(7)
      doc.setTextColor('#AAAAAA')
      doc.text(
        `Página ${data.pageNumber} de ${total}`,
        pageW / 2,
        pageH - 8,
        { align: 'center' }
      )
      doc.text(
        'Este informe es orientativo y no constituye asesoría legal.',
        pageW / 2,
        pageH - 4,
        { align: 'center' }
      )
    },
  })

  // ── Gold accent line at bottom of first page ───────────────────────────
  const fileName = `marcas-ni_${query.replace(/\s+/g, '-').toLowerCase()}_${new Date().toISOString().slice(0, 10)}.pdf`
  doc.save(fileName)
}
