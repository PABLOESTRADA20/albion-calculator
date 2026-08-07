// Iconos de items servidos por el Render Service oficial de Albion Online.
// Formato: https://render.albiononline.com/v1/item/{UniqueName}.png
// El parametro ?quality= colorea el marco del icono segun la calidad (1-5).
const ICON_BASE = "https://render.albiononline.com/v1/item";

export function itemIconUrl(itemId: string, quality?: number): string {
  const url = `${ICON_BASE}/${itemId}.png`;
  if (quality && quality > 1) return `${url}?quality=${quality}`;
  return url;
}
