/**
 * Link do menu que corresponde à página atual: o de endereço mais comprido que seja o endereço exato ou o seu pai.
 * Assim «Visão geral» (/tuition) não fica destacada ao mesmo tempo que «Propinas» (/tuition/payments).
 */
export function activeNavUrl(pathname: string, urls: string[]): string | undefined {
  let best: string | undefined;
  for (const url of urls) {
    if (!url || url === "#") continue;
    if (pathname === url || (url !== "/" && pathname.startsWith(`${url}/`))) {
      if (!best || url.length > best.length) best = url;
    }
  }
  return best;
}
