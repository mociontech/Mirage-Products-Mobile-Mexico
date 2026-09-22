import photoLife12 from "../assets/images/products/photo-life12.webp";
import photoXlife from "../assets/images/products/photo-xlife.webp";
import photoMacc1211n from "../assets/images/products/photo-macc1211n.webp";
import photoMacc2421n from "../assets/images/products/photo-macc2421n.webp";
import photoFlexinverter from "../assets/images/products/photo-flexinverter.webp";
import photoX32 from "../assets/images/products/photo-x32.webp";
import photoM22Colombia from "../assets/images/products/photo-m22colombia.webp";
import photoX5Onoff from "../assets/images/products/photo-x5onoff.webp";
import photoX5Inverter from "../assets/images/products/photo-x5inverter.webp";
import photoInverterx from "../assets/images/products/photo-inverterx.webp";
import photoNeo from "../assets/images/products/photo-neo.webp";
import photoGeneric from "../assets/images/products/photo-generic.webp";

import logoLife12 from "../assets/images/products/logo-life12.svg";
import logoXlife from "../assets/images/products/logo-xlife.svg";
import logoMacc1211n from "../assets/images/products/logo-macc1211n.svg";
import logoMacc2421n from "../assets/images/products/logo-macc2421n.svg";
import logoFlexinverter from "../assets/images/products/logo-flexinverter.svg";
import logoX32 from "../assets/images/products/logo-x32.svg";
import logoM22Colombia from "../assets/images/products/logo-m22colombia.png";
import logoX5Onoff from "../assets/images/products/logo-x5onoff.svg";
import logoX5Inverter from "../assets/images/products/logo-x5inverter.svg";
import logoInverterx from "../assets/images/products/logo-inverterx.svg";
import logoNeo from "../assets/images/products/logo-neo.svg";
import logoGeneric from "../assets/images/products/logo-generic.png";

import pitchLife12 from "../assets/images/pitch/pitch-life12.webp";
import pitchXlife from "../assets/images/pitch/pitch-xlife.webp";
import pitchMacc1211n from "../assets/images/pitch/pitch-macc1211n.webp";
import pitchMacc2421n from "../assets/images/pitch/pitch-macc2421n.webp";
import pitchFlexinverter from "../assets/images/pitch/pitch-flexinverter.webp";
import pitchX32 from "../assets/images/pitch/pitch-x32.webp";
import pitchMagnum22 from "../assets/images/pitch/pitch-magnum22.webp";
import pitchX5Convencional from "../assets/images/pitch/pitch-x5convencional.webp";
import pitchX5Inverter from "../assets/images/pitch/pitch-x5inverter.webp";
import pitchInverterx from "../assets/images/pitch/pitch-inverterx.webp";
import pitchNeo from "../assets/images/pitch/pitch-neo.webp";
import pitchMagnum18 from "../assets/images/pitch/pitch-magnum18.webp";

/**
 * Catalogo de producto - version Mexico, mismo contenido/nombres que
 * Mirage-Products-Mexico (apps/client/src/content/products.ts, campos
 * tileImage/tileLogo alla, renombrados aqui a photoImage/logoImage para
 * usar la misma interfaz Product que la version Colombia) - los assets se
 * copiaron 1:1 de ahi. pitchImage (el banner vertical completo) se usa a
 * pantalla completa en Detail.
 */
export interface Product {
  id: string;
  name: string;
  photoImage: string;
  logoImage: string;
  pitchImage: string;
}

export const products: Product[] = [
  { id: "life-12-plus", name: "Life 12+", photoImage: photoLife12, logoImage: logoLife12, pitchImage: pitchLife12 },
  { id: "x-life", name: "XLife", photoImage: photoXlife, logoImage: logoXlife, pitchImage: pitchXlife },
  {
    id: "aire-ventana-1-ton",
    name: "Blu Efficient (1 tonelada)",
    photoImage: photoMacc1211n,
    logoImage: logoMacc1211n,
    pitchImage: pitchMacc1211n,
  },
  {
    id: "aire-ventana-2-ton",
    name: "Blu Efficient (2 toneladas)",
    photoImage: photoMacc2421n,
    logoImage: logoMacc2421n,
    pitchImage: pitchMacc2421n,
  },
  {
    id: "flex-inverter",
    name: "Flex Inverter",
    photoImage: photoFlexinverter,
    logoImage: logoFlexinverter,
    pitchImage: pitchFlexinverter,
  },
  { id: "inverter-x32", name: "X32", photoImage: photoX32, logoImage: logoX32, pitchImage: pitchX32 },
  {
    id: "magnum-22",
    name: "Magnum Inverter 22",
    photoImage: photoM22Colombia,
    logoImage: logoM22Colombia,
    pitchImage: pitchMagnum22,
  },
  {
    id: "x5-convencional",
    name: "X5",
    photoImage: photoX5Onoff,
    logoImage: logoX5Onoff,
    pitchImage: pitchX5Convencional,
  },
  {
    id: "xs-inverter",
    name: "X5 Inverter",
    photoImage: photoX5Inverter,
    logoImage: logoX5Inverter,
    pitchImage: pitchX5Inverter,
  },
  {
    id: "inverter-x",
    name: "Inverter X",
    photoImage: photoInverterx,
    logoImage: logoInverterx,
    pitchImage: pitchInverterx,
  },
  { id: "neo-inverter", name: "Neo Inverter", photoImage: photoNeo, logoImage: logoNeo, pitchImage: pitchNeo },
  {
    id: "magnum-18",
    name: "Magnum Inverter 18",
    photoImage: photoGeneric,
    logoImage: logoGeneric,
    pitchImage: pitchMagnum18,
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}
