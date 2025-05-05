export function formatMeso(value: number): string {
  const rounded = Math.round(value * 10000);
  const eok = Math.floor(rounded / 10000);
  const man = rounded % 10000;
  const parts = [];
  if (eok > 0) parts.push(`${eok}억`);
  if (man > 0) parts.push(`${man}만`);
  return parts.length > 0 ? parts.join(" ") + " 메소" : "0 메소";
}
