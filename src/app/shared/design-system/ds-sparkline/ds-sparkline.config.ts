export interface DsSparklineConfig {
  /** Séries de valeurs numériques à tracer */
  points: number[];
  /** Largeur SVG en pixels. Défaut : 120 */
  width: number;
  /** Hauteur SVG en pixels. Défaut : 32 */
  height: number;
  /** Couleur CSS du trait et du fill. Défaut : 'var(--accent)' */
  color: string;
  /** Affiche la zone de remplissage (10% opacité). Défaut : true */
  fill: boolean;
}

export const DS_SPARKLINE_DEFAULTS: Readonly<Omit<DsSparklineConfig, 'points'>> = {
  width: 120,
  height: 32,
  color: 'var(--accent)',
  fill: true,
};
