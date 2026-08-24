export function getSectionId(tierId: string, sectionIndex: number) {
  return `${tierId}-${String(sectionIndex + 1).padStart(2, '0')}`;
}
