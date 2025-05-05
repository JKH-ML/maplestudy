export function raDecToXYZ(ra: number, dec: number, dist = 1) {
  const raRad = (ra * Math.PI) / 180;
  const decRad = (dec * Math.PI) / 180;
  const x = dist * Math.cos(decRad) * Math.cos(raRad);
  const y = dist * Math.sin(decRad);
  const z = dist * Math.cos(decRad) * Math.sin(raRad);
  return [x, y, z] as const;
}