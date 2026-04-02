const EMPTY_LABELS = new Set(['', 'sin_deteccion'])

export function formatConfidence(confidence) {
  return typeof confidence === 'number'
    ? `${(confidence * 100).toFixed(1)}%`
    : '--'
}

export function getDisplayLetter(prediction) {
  const label = normalizeLabel(prediction?.label)
  return label || '--'
}

export function getPredictionSummary(prediction) {
  const label = normalizeLabel(prediction?.label)
  return label || 'Sin deteccion'
}

export function getTopCandidates(prediction) {
  if (!Array.isArray(prediction?.top_candidates)) {
    return []
  }

  return prediction.top_candidates
    .filter((candidate) => candidate?.label)
    .map((candidate) => ({
      ...candidate,
      label: normalizeLabel(candidate.label) || candidate.label,
    }))
}

function normalizeLabel(rawLabel) {
  if (typeof rawLabel !== 'string') {
    return ''
  }

  const trimmedLabel = rawLabel.trim()
  if (EMPTY_LABELS.has(trimmedLabel)) {
    return ''
  }

  return trimmedLabel.toUpperCase()
}
