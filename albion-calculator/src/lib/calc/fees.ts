// Tarifas de uso de estaciones (silver que cobra el dueno por 100 de nutricion).
// Formula base (wiki/fuentes comunitarias):
//   Fee = (UsageFee / 1000) * 18 * MaterialAmount * 2^(Tier-4) * 2^Enchant
// Para items de artefacto, la parte de materiales se multiplica por
// (1 + 0.25 * (2^ArtifactTier - 1) / 2^Enchant).
// T1 y T2 no pagan tarifa.

export function refineFeePerUnit(
  usageFee: number,
  tier: number,
  enchant = 0
): number {
  if (tier <= 2) return 0;
  return (usageFee / 1000) * 18 * Math.pow(2, tier - 4) * Math.pow(2, enchant);
}

export function craftFeePerUnit(
  usageFee: number,
  tier: number,
  materialCount: number,
  artifactTier = 0,
  enchant = 0
): number {
  if (tier <= 2) return 0;
  const artifactFactor =
    1 + (0.25 * (Math.pow(2, artifactTier) - 1)) / Math.pow(2, enchant);
  return (
    (usageFee / 1000) *
    18 *
    materialCount *
    artifactFactor *
    Math.pow(2, tier - 4) *
    Math.pow(2, enchant)
  );
}
