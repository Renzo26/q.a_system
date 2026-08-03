import { cn } from "@/lib/utils";

/* Geometria vetorial da marca Hunter Q.A.
   Traçada dos originais em fotos_logos/ (marching squares + Douglas-Peucker)
   e redesenhada em geometria limpa — ver src/assets/brand/. */

const BAR_LEFT = "M0 0H61V377H0Z";
const BAR_RIGHT = "M286 0H346V377H286Z";

/* O check é uma fita dobrada: 4 facetas separadas por vincos. */
const CHECK_FACETS = [
  "M329 97C264.1 153.1 218.8 202.4 163 260C129.5 229.1 101.3 196.6 68 164L102 129C121.2 148.2 135.2 165 160 185C188.7 161.7 218 146.9 246 131L329 97Z",
  "M285 110C248.5 131.4 198.4 150.1 159 184L109 135C135.4 138.8 135.9 158.4 167 158C198.7 149.3 242.9 117.3 285 110Z",
  "M278 146C275.9 161 260.9 175.2 261 183C228.7 206.8 209.8 231.2 170 256C202.5 220.1 239.8 181.7 278 146Z",
  "M70 170C96.9 195.5 129.4 224.6 150 255C128.2 246.1 113.4 219.3 91 215C88.6 207.1 74.3 189.9 70 170Z",
];

const WORDMARK =
  "M0 66L0 0L19 0L19 24L66 24L66 0L84 0L84 66L66 66L66 38L19 38L19 66Z" +
  "M183 0L183 51L180 58L174 64L164 66L118 66L109 64L104 58L101 51L101 0L120 0L120 44L123 51L158 51L164 44L164 0Z" +
  "M283 66L264 66L220 18L218 18L218 66L200 66L200 0L226 0L264 44L264 0L283 0Z" +
  "M375 0L375 15L344 15L344 66L326 66L326 15L297 15L297 0Z" +
  "M388 15L388 0L463 0L463 15Z" +
  "M480 66L480 30L544 30L548 24L548 18L541 15L480 15L480 0L548 0L558 3L563 9L566 18L566 30L558 44L548 44L558 58L561 58L566 66L541 66L536 58L528 51L526 44L499 44L499 66Z" +
  "M463 66L388 66L388 24L452 24L452 38L407 38L407 51L463 51Z";

interface BrandMarkProps {
  className?: string;
  /** Abaixo de ~24px os vincos somem: `solid` desenha só a faceta principal. */
  solid?: boolean;
}

/** Símbolo "H" com o check. As barras usam `currentColor`; o check, o amarelo da marca. */
export function BrandMark({ className, solid = false }: BrandMarkProps) {
  const facets = solid ? CHECK_FACETS.slice(0, 1) : CHECK_FACETS;

  return (
    <svg viewBox="0 0 346 377" fill="none" aria-hidden="true" className={cn("h-6 w-auto", className)}>
      <g fill="currentColor">
        <path d={BAR_LEFT} />
        <path d={BAR_RIGHT} />
      </g>
      <g fill="var(--color-brand)">
        {facets.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </svg>
  );
}

/** Logotipo "HUNTER" vetorizado, em `currentColor`. */
export function BrandWordmark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 567 67" fill="none" aria-hidden="true" className={cn("h-4 w-auto", className)}>
      <path d={WORDMARK} fill="currentColor" fillRule="evenodd" />
    </svg>
  );
}
