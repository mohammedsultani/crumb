// Original cover-art icons for the recipe library. There's no photo backend
// and no image-generation tool in this build, and stock photography can't be
// bundled/redistributed freely — so instead every dish gets a small, original
// line illustration from a shared archetype set, tinted by the recipe's own
// hue. This sits closer to Crumb's hand-drawn, editorial voice than a photo
// grid would anyway.

import React from 'react';
import { Circle, Ellipse, G, Line, Path, Rect, Svg } from 'react-native-svg';
import type { DishArtKind } from './types';

function tint(hue: number, sat: number, light: number, alpha = 1) {
  return `hsla(${hue}, ${sat}%, ${light}%, ${alpha})`;
}

interface Palette {
  food: string; // main saturated food color
  deep: string; // shadow / second tone
  soft: string; // light garnish / highlight tone
  warm: string; // a hue-shifted warm accent (char, spice, herb)
}

function palette(hue: number): Palette {
  return {
    food: tint(hue, 60, 54),
    deep: tint(hue, 55, 38),
    soft: tint(hue + 20, 45, 82),
    warm: tint(hue + 150, 45, 55),
  };
}

export function DishArt({ kind, hue, ink, size = 88 }: { kind: DishArtKind; hue: number; ink: string; size?: number }) {
  const p = palette(hue);
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" style={{ position: 'relative', zIndex: 1 }}>
      {render(kind, p, ink)}
    </Svg>
  );
}

function Grains({ cx, cy, spread, color }: { cx: number; cy: number; spread: number; color: string }) {
  const pts = [
    [-1, -0.3, -18],
    [0.6, 0.4, 22],
    [-0.5, 0.6, 5],
    [1.2, -0.2, -30],
    [-1.3, 0.1, 40],
    [0.2, -0.7, 12],
    [1.6, 0.5, -10],
    [-1.8, -0.5, 18],
  ];
  return (
    <G>
      {pts.map(([dx, dy, rot], i) => (
        <Ellipse
          key={i}
          cx={cx + dx * spread}
          cy={cy + dy * spread}
          rx={2.6}
          ry={1.3}
          fill={color}
          transform={`rotate(${rot} ${cx + dx * spread} ${cy + dy * spread})`}
        />
      ))}
    </G>
  );
}

function Fleck({ cx, cy, r, color }: { cx: number; cy: number; r: number; color: string }) {
  return <Circle cx={cx} cy={cy} r={r} fill={color} />;
}

function render(kind: DishArtKind, p: Palette, ink: string): React.ReactNode {
  switch (kind) {
    case 'rice':
      return (
        <G>
          <Path d="M16,47 Q18,74 50,76 Q82,74 84,47" fill="none" stroke={ink} strokeWidth={3} strokeLinecap="round" />
          <Ellipse cx={50} cy={46} rx={30} ry={8.5} fill={p.food} />
          <Grains cx={50} cy={45} spread={9} color={p.soft} />
          <Ellipse cx={50} cy={46} rx={32} ry={9.5} fill="none" stroke={ink} strokeWidth={3} />
          <Line x1={62} y1={18} x2={40} y2={44} stroke={ink} strokeWidth={2.4} strokeLinecap="round" />
          <Line x1={67} y1={21} x2={45} y2={47} stroke={ink} strokeWidth={2.4} strokeLinecap="round" />
        </G>
      );

    case 'stirfry':
      return (
        <G>
          <Path d="M14,42 Q50,72 86,42" fill="none" stroke={ink} strokeWidth={3.4} strokeLinecap="round" />
          <Circle cx={11} cy={39} r={3.4} fill="none" stroke={ink} strokeWidth={2.6} />
          <Circle cx={89} cy={39} r={3.4} fill="none" stroke={ink} strokeWidth={2.6} />
          <Path d="M22,40 Q50,60 78,40" fill="none" stroke={ink} strokeWidth={2} strokeDasharray="0" opacity={0.25} />
          <Rect x={34} y={30} width={12} height={9} rx={3} fill={p.food} transform="rotate(-12 40 34)" />
          <Rect x={50} y={26} width={11} height={9} rx={3} fill={p.deep} transform="rotate(10 55 30)" />
          <Rect x={42} y={20} width={10} height={8} rx={3} fill={p.food} transform="rotate(-6 47 24)" />
          <Circle cx={30} cy={26} r={3.6} fill={p.warm} />
          <Circle cx={62} cy={22} r={3} fill={p.warm} />
          <Circle cx={49} cy={16} r={2.4} fill={p.soft} />
        </G>
      );

    case 'curry':
      return (
        <G>
          <Path d="M16,44 Q18,74 50,76 Q82,74 84,44" fill="none" stroke={ink} strokeWidth={3} strokeLinecap="round" />
          <Ellipse cx={50} cy={43} rx={31} ry={9} fill={p.food} />
          <Path
            d="M24,43 Q34,37 44,43 Q54,49 64,43 Q72,38 78,43"
            fill="none"
            stroke={p.deep}
            strokeWidth={2.6}
            strokeLinecap="round"
          />
          <Circle cx={40} cy={40} r={2.6} fill={p.soft} />
          <Circle cx={58} cy={41} r={2} fill={p.soft} />
          <Ellipse cx={50} cy={43} rx={33} ry={9.8} fill="none" stroke={ink} strokeWidth={3} />
        </G>
      );

    case 'noodles':
      return (
        <G>
          <Path d="M16,44 Q18,74 50,76 Q82,74 84,44" fill="none" stroke={ink} strokeWidth={3} strokeLinecap="round" />
          <Ellipse cx={50} cy={43} rx={31} ry={9} fill={p.soft} />
          {[[-14, -1], [-4, 2], [7, -2], [16, 1]].map(([dx, dy], i) => (
            <Path
              key={i}
              d={`M${28 + dx},${44 + dy} Q${38 + dx},${34 + dy} ${48 + dx},${44 + dy} Q${58 + dx},${52 + dy} ${68 + dx},${42 + dy}`}
              fill="none"
              stroke={p.food}
              strokeWidth={2.6}
              strokeLinecap="round"
            />
          ))}
          <Circle cx={38} cy={38} r={2.4} fill={p.warm} />
          <Circle cx={60} cy={40} r={2.4} fill={p.warm} />
          <Ellipse cx={50} cy={43} rx={33} ry={9.8} fill="none" stroke={ink} strokeWidth={3} />
        </G>
      );

    case 'soup':
      return (
        <G>
          <Path d="M18,48 Q20,72 50,74 Q80,72 82,48" fill="none" stroke={ink} strokeWidth={3} strokeLinecap="round" />
          <Ellipse cx={50} cy={47} rx={29} ry={8} fill={p.food} />
          <Path d="M28,47 Q39,43 50,47 Q61,51 72,47" fill="none" stroke={p.deep} strokeWidth={2} strokeLinecap="round" />
          <Ellipse cx={50} cy={47} rx={31} ry={8.8} fill="none" stroke={ink} strokeWidth={3} />
          <Path d="M40,26 Q36,20 41,15" fill="none" stroke={p.warm} strokeWidth={2.2} strokeLinecap="round" opacity={0.7} />
          <Path d="M52,24 Q48,18 53,12" fill="none" stroke={p.warm} strokeWidth={2.2} strokeLinecap="round" opacity={0.7} />
          <Line x1={72} y1={30} x2={80} y2={16} stroke={ink} strokeWidth={2.2} strokeLinecap="round" />
          <Ellipse cx={81} cy={13} rx={3.6} ry={2.4} fill="none" stroke={ink} strokeWidth={2} transform="rotate(-30 81 13)" />
        </G>
      );

    case 'dumplings': {
      const spots = [
        [40, 56, 0],
        [58, 55, 12],
        [50, 44, -8],
        [32, 47, 18],
        [67, 46, -14],
      ];
      return (
        <G>
          <Ellipse cx={50} cy={68} rx={30} ry={6} fill="none" stroke={ink} strokeWidth={2.4} opacity={0.5} />
          {spots.map(([cx, cy, rot], i) => (
            <G key={i} transform={`rotate(${rot} ${cx} ${cy})`}>
              <Path
                d={`M${cx - 12},${cy} Q${cx - 10},${cy - 12} ${cx},${cy - 13} Q${cx + 10},${cy - 12} ${cx + 12},${cy} Q${cx},${cy + 6} ${cx - 12},${cy} Z`}
                fill={i % 2 ? p.food : p.deep}
                stroke={ink}
                strokeWidth={2.2}
              />
              <Path
                d={`M${cx - 8},${cy - 10} Q${cx - 4},${cy - 14} ${cx},${cy - 12} Q${cx + 4},${cy - 14} ${cx + 8},${cy - 10}`}
                fill="none"
                stroke={ink}
                strokeWidth={1.6}
                opacity={0.6}
              />
            </G>
          ))}
        </G>
      );
    }

    case 'kebab':
      return (
        <G>
          <Line x1={16} y1={70} x2={72} y2={18} stroke={ink} strokeWidth={2.6} strokeLinecap="round" />
          <Line x1={28} y1={80} x2={84} y2={28} stroke={ink} strokeWidth={2.6} strokeLinecap="round" />
          {[0, 1, 2, 3].map((i) => (
            <Rect
              key={i}
              x={30 + i * 12}
              y={44 - i * 12}
              width={13}
              height={13}
              rx={3}
              fill={i % 2 ? p.food : p.warm}
              stroke={ink}
              strokeWidth={2}
              transform={`rotate(-38 ${36 + i * 12} ${50 - i * 12})`}
            />
          ))}
        </G>
      );

    case 'samosa':
      return (
        <G>
          <Ellipse cx={50} cy={78} rx={26} ry={5} fill="none" stroke={ink} strokeWidth={2} opacity={0.4} />
          <Path
            d="M50,18 L80,68 Q50,78 20,68 Z"
            fill={p.food}
            stroke={ink}
            strokeWidth={3}
            strokeLinejoin="round"
          />
          {[0, 1, 2, 3, 4].map((i) => {
            const t = i / 4;
            const x = 20 + t * 60;
            return <Circle key={i} cx={x} cy={68 - Math.abs(t - 0.5) * 6} r={2.6} fill="none" stroke={ink} strokeWidth={1.8} />;
          })}
          <Path d="M14,60 Q10,66 15,72 Q9,72 6,66" fill="none" stroke={p.warm} strokeWidth={2} strokeLinecap="round" opacity={0.8} />
        </G>
      );

    case 'pizza':
      return (
        <G>
          <Path
            d="M50,14 L82,74 Q50,84 18,74 Z"
            fill={p.soft}
            stroke={ink}
            strokeWidth={3}
            strokeLinejoin="round"
          />
          <Path d="M50,14 L82,74 Q50,84 18,74 Z" fill="none" />
          <Circle cx={44} cy={44} r={4.4} fill={p.food} />
          <Circle cx={58} cy={54} r={4.4} fill={p.food} />
          <Circle cx={46} cy={62} r={3.6} fill={p.food} />
          <Circle cx={62} cy={38} r={3} fill={p.warm} />
          <Path d="M42,74 Q46,80 50,74" fill="none" stroke={p.deep} strokeWidth={2} strokeLinecap="round" opacity={0.6} />
          <Path d="M28,72 Q30,60 20,74" fill="none" stroke={ink} strokeWidth={2} strokeLinecap="round" opacity={0.3} />
        </G>
      );

    case 'burger':
      return (
        <G>
          <Path d="M22,38 Q22,20 50,20 Q78,20 78,38 Z" fill={p.food} stroke={ink} strokeWidth={3} strokeLinejoin="round" />
          <Circle cx={34} cy={26} r={1.6} fill={ink} opacity={0.35} />
          <Circle cx={50} cy={23} r={1.6} fill={ink} opacity={0.35} />
          <Circle cx={64} cy={27} r={1.6} fill={ink} opacity={0.35} />
          <Path d="M20,40 Q50,46 80,40 L80,46 Q50,52 20,46 Z" fill={p.warm} stroke={ink} strokeWidth={2.4} strokeLinejoin="round" />
          <Rect x={20} y={48} width={60} height={9} rx={4} fill={p.deep} stroke={ink} strokeWidth={2.4} />
          <Path d="M20,59 Q50,65 80,59 L80,63 Q50,71 20,63 Z" fill="none" stroke={ink} strokeWidth={2.4} strokeLinejoin="round" />
          <Path d="M22,64 Q22,76 50,76 Q78,76 78,64 Z" fill={p.food} stroke={ink} strokeWidth={3} strokeLinejoin="round" />
        </G>
      );

    case 'fries':
      return (
        <G>
          <Path d="M28,50 L26,78 Q50,84 74,78 L72,50 Z" fill={p.deep} stroke={ink} strokeWidth={3} strokeLinejoin="round" />
          <Line x1={38} y1={54} x2={40} y2={76} stroke={p.soft} strokeWidth={1.6} opacity={0.5} />
          <Line x1={62} y1={54} x2={60} y2={76} stroke={p.soft} strokeWidth={1.6} opacity={0.5} />
          {[-16, -8, 0, 8, 16, 22].map((dx, i) => (
            <Rect
              key={i}
              x={50 + dx - 3}
              y={16 + (i % 2) * 6}
              width={6}
              height={40 - (i % 2) * 6}
              rx={2.4}
              fill={p.food}
              stroke={ink}
              strokeWidth={2}
              transform={`rotate(${dx / 3} ${50 + dx} 50)`}
            />
          ))}
        </G>
      );

    case 'friedchicken':
      return (
        <G>
          <Path
            d="M40,30 Q28,32 26,46 Q24,60 36,68 Q48,76 58,68 Q66,60 62,48 Q68,44 66,34 Q64,26 54,26 Q50,20 40,30 Z"
            fill={p.food}
            stroke={ink}
            strokeWidth={3}
            strokeLinejoin="round"
          />
          <Rect x={56} y={64} width={9} height={20} rx={4} fill={p.soft} stroke={ink} strokeWidth={2.4} transform="rotate(24 60 70)" />
          <Fleck cx={38} cy={42} r={1.6} color={p.deep} />
          <Fleck cx={48} cy={38} r={1.6} color={p.deep} />
          <Fleck cx={44} cy={52} r={1.6} color={p.deep} />
          <Fleck cx={56} cy={48} r={1.6} color={p.deep} />
          <Fleck cx={36} cy={56} r={1.6} color={p.deep} />
          <Fleck cx={52} cy={58} r={1.6} color={p.deep} />
        </G>
      );

    case 'wrap':
      return (
        <G>
          <Path
            d="M28,26 L64,62 Q70,68 64,74 L58,80 Q52,86 46,80 L10,44 Q4,38 10,32 L16,26 Q22,20 28,26 Z"
            fill={p.soft}
            stroke={ink}
            strokeWidth={3}
            strokeLinejoin="round"
          />
          <Ellipse cx={24} cy={30} rx={10} ry={9} fill={p.food} stroke={ink} strokeWidth={2.6} />
          <Path d="M18,26 Q24,30 22,36" fill="none" stroke={p.warm} strokeWidth={2} strokeLinecap="round" />
          <Path d="M28,24 Q32,30 28,34" fill="none" stroke={p.deep} strokeWidth={2} strokeLinecap="round" />
          <Line x1={44} y1={58} x2={50} y2={64} stroke={ink} strokeWidth={2} strokeLinecap="round" opacity={0.4} />
          <Line x1={50} y1={64} x2={44} y2={70} stroke={ink} strokeWidth={2} strokeLinecap="round" opacity={0.4} />
        </G>
      );

    case 'taco':
      return (
        <G>
          <Path
            d="M14,50 Q50,22 86,50 Q84,64 50,64 Q16,64 14,50 Z"
            fill={p.deep}
            stroke={ink}
            strokeWidth={3}
            strokeLinejoin="round"
          />
          <Path d="M20,48 Q50,30 80,48" fill="none" stroke={ink} strokeWidth={3} strokeLinecap="round" />
          <Circle cx={36} cy={44} r={3.4} fill={p.food} />
          <Circle cx={50} cy={40} r={3.4} fill={p.food} />
          <Circle cx={63} cy={44} r={3.4} fill={p.food} />
          <Path d="M30,40 Q34,32 40,38" fill="none" stroke={p.warm} strokeWidth={2.2} strokeLinecap="round" />
          <Path d="M60,38 Q66,32 70,40" fill="none" stroke={p.warm} strokeWidth={2.2} strokeLinecap="round" />
        </G>
      );

    case 'quesadilla':
      return (
        <G>
          <Path
            d="M50,14 Q84,16 84,50 Q84,80 50,50 Q16,80 16,50 Q16,16 50,14 Z"
            fill={p.food}
            stroke={ink}
            strokeWidth={3}
            strokeLinejoin="round"
          />
          <Line x1={50} y1={14} x2={50} y2={50} stroke={ink} strokeWidth={2} opacity={0.35} />
          <Line x1={16} y1={50} x2={50} y2={50} stroke={ink} strokeWidth={2} opacity={0.35} />
          <Line x1={50} y1={50} x2={84} y2={50} stroke={ink} strokeWidth={2} opacity={0.35} />
          <Circle cx={38} cy={30} r={2.2} fill={p.warm} />
          <Circle cx={62} cy={32} r={2.2} fill={p.warm} />
          <Circle cx={50} cy={64} r={2.2} fill={p.warm} />
        </G>
      );

    case 'pasta':
      return (
        <G>
          <Path d="M16,44 Q18,74 50,76 Q82,74 84,44" fill="none" stroke={ink} strokeWidth={3} strokeLinecap="round" />
          <Ellipse cx={50} cy={43} rx={31} ry={9} fill={p.soft} />
          <Path
            d="M50,43 m-14,0 a14,5 0 1,0 28,0 a10,3.6 0 1,1 -20,0 a6,2.2 0 1,0 12,0"
            fill="none"
            stroke={p.food}
            strokeWidth={2.6}
            strokeLinecap="round"
          />
          <Ellipse cx={50} cy={43} rx={33} ry={9.8} fill="none" stroke={ink} strokeWidth={3} />
          <Line x1={78} y1={30} x2={70} y2={44} stroke={ink} strokeWidth={2.4} strokeLinecap="round" />
          <Line x1={73} y1={30} x2={70} y2={40} stroke={ink} strokeWidth={1.6} strokeLinecap="round" />
          <Line x1={78} y1={30} x2={75} y2={40} stroke={ink} strokeWidth={1.6} strokeLinecap="round" />
        </G>
      );

    case 'nuggets': {
      const blobs = [
        [38, 54, 12, 9, -10],
        [58, 52, 13, 10, 8],
        [48, 40, 11, 9, -4],
        [64, 38, 10, 8, 16],
      ];
      return (
        <G>
          {blobs.map(([cx, cy, rx, ry, rot], i) => (
            <G key={i}>
              <Ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={p.food} stroke={ink} strokeWidth={2.6} transform={`rotate(${rot} ${cx} ${cy})`} />
              <Fleck cx={cx - 3} cy={cy - 2} r={1.3} color={p.deep} />
              <Fleck cx={cx + 3} cy={cy + 2} r={1.3} color={p.deep} />
            </G>
          ))}
        </G>
      );
    }

    case 'hotdog':
      return (
        <G>
          <Path
            d="M14,52 Q14,34 30,32 L70,32 Q86,34 86,52 Q86,68 70,68 L30,68 Q14,68 14,52 Z"
            fill={p.soft}
            stroke={ink}
            strokeWidth={3}
            strokeLinejoin="round"
          />
          <Rect x={20} y={40} width={60} height={20} rx={10} fill={p.food} stroke={ink} strokeWidth={2.6} />
          <Path d="M24,44 Q34,52 44,44 Q54,36 64,44 Q74,52 78,44" fill="none" stroke={p.warm} strokeWidth={2.4} strokeLinecap="round" />
        </G>
      );

    case 'salad':
      return (
        <G>
          <Ellipse cx={50} cy={54} rx={33} ry={16} fill="none" stroke={ink} strokeWidth={3} />
          <Path
            d="M22,50 Q30,36 42,44 Q48,32 56,42 Q66,34 74,48 Q60,42 52,48 Q44,40 38,48 Q30,42 22,50 Z"
            fill={p.food}
            stroke={ink}
            strokeWidth={2.4}
            strokeLinejoin="round"
          />
          <Circle cx={40} cy={50} r={3.4} fill={p.warm} />
          <Circle cx={60} cy={49} r={3} fill={p.warm} />
          <Circle cx={50} cy={56} r={2.6} fill={p.soft} />
        </G>
      );

    case 'dessert':
      return (
        <G>
          <Ellipse cx={50} cy={78} rx={28} ry={5} fill="none" stroke={ink} strokeWidth={2} opacity={0.4} />
          <Path d="M32,76 L36,26 Q50,18 64,26 L68,76 Z" fill={p.soft} stroke={ink} strokeWidth={3} strokeLinejoin="round" />
          <Line x1={34} y1={44} x2={66} y2={44} stroke={p.food} strokeWidth={4} />
          <Line x1={35} y1={60} x2={65} y2={60} stroke={p.deep} strokeWidth={4} />
          <Circle cx={50} cy={22} r={3} fill={p.warm} />
        </G>
      );

    case 'dip':
      return (
        <G>
          <Ellipse cx={50} cy={58} rx={30} ry={18} fill="none" stroke={ink} strokeWidth={3} />
          <Ellipse cx={50} cy={54} rx={24} ry={13} fill={p.food} />
          <Path d="M34,50 Q50,44 66,50" fill="none" stroke={p.deep} strokeWidth={2.2} strokeLinecap="round" opacity={0.7} />
          <Circle cx={44} cy={54} r={2} fill={p.warm} />
          <Circle cx={57} cy={52} r={2} fill={p.warm} />
          <Rect x={58} y={16} width={9} height={30} rx={2} fill={p.soft} stroke={ink} strokeWidth={2.2} transform="rotate(18 62 30)" />
        </G>
      );

    case 'sushi': {
      const rolls = [
        [26, 52],
        [50, 48],
        [74, 54],
      ];
      return (
        <G>
          {rolls.map(([cx, cy], i) => (
            <G key={i}>
              <Circle cx={cx} cy={cy} r={13} fill={p.soft} stroke={ink} strokeWidth={2.6} />
              <Circle cx={cx} cy={cy} r={7} fill={p.food} />
              <Fleck cx={cx - 2} cy={cy - 1} r={1.4} color={p.deep} />
              <Fleck cx={cx + 3} cy={cy + 2} r={1.4} color={p.deep} />
              <Path
                d={`M${cx - 13},${cy - 4} A13,13 0 0,1 ${cx - 13},${cy + 4}`}
                fill="none"
                stroke={p.warm}
                strokeWidth={3}
                strokeLinecap="round"
              />
            </G>
          ))}
        </G>
      );
    }

    default:
      return <Circle cx={50} cy={50} r={30} fill={p.food} stroke={ink} strokeWidth={3} />;
  }
}

// Guesses an archetype for user-created recipes (no curated `art` field) from
// their title/tags, so the "Yours" shelf and detail page still get a fitting
// illustration instead of a generic placeholder.
const KEYWORD_TO_ART: [RegExp, DishArtKind][] = [
  [/pizza/i, 'pizza'],
  [/burger/i, 'burger'],
  [/fries|chips/i, 'fries'],
  [/fried chicken|nugget/i, 'friedchicken'],
  [/wrap|shawarma|burrito/i, 'wrap'],
  [/taco/i, 'taco'],
  [/quesadilla/i, 'quesadilla'],
  [/pasta|spaghetti|fettuccine|alfredo|penne/i, 'pasta'],
  [/hot dog|hotdog/i, 'hotdog'],
  [/dumpling|jiaozi|gyoza|momo/i, 'dumplings'],
  [/kebab|skewer|seekh|satay/i, 'kebab'],
  [/samosa|pastry|empanada/i, 'samosa'],
  [/soup|broth/i, 'soup'],
  [/noodle|chow mein|lo mein|ramen/i, 'noodles'],
  [/curry|masala|korma|dal|gravy|stew/i, 'curry'],
  [/rice|pulao|biryani|risotto|bibimbap/i, 'rice'],
  [/stir.?fry|wok/i, 'stirfry'],
  [/sushi|maki|roll/i, 'sushi'],
  [/salad/i, 'salad'],
  [/tiramisu|baklava|cake|churro|pastry.*sweet/i, 'dessert'],
  [/hummus|guacamole|dip/i, 'dip'],
];

export function guessDishArt(title: string, tags: string[] = []): DishArtKind {
  const haystack = `${title} ${tags.join(' ')}`;
  for (const [pattern, kind] of KEYWORD_TO_ART) {
    if (pattern.test(haystack)) return kind;
  }
  return 'curry';
}
