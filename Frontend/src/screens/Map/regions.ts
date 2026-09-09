import type { RegionId } from '../../types/ids';

export const MAP_UNITS = 301;
export type Point = readonly [number, number];
export type MapRegion = {
  id: RegionId;
  name: string;
  scenarioName: string;
  destination: 'Scenario' | 'ComingSoonRegion';
  outline: readonly Point[];
  clipPath: string;
  hitPath: string;
  bounds: { x: number; y: number; width: number; height: number };
  anchor: Point;
  motion: { lift: number; scale: number; tilt: number };
};

export function polygonPath(points: readonly Point[]) {
  return `M${points.map(([x, y]) => `${x},${y}`).join('L')}Z`;
}

// Shared borders follow the middle of the pale cuts in the original print.
// Reversing the SAME points avoids gaps or overlapping strips between regions.
const northEast: Point[] = [
  [188, 46],
  [182, 59],
  [177, 67],
  [171, 74],
  [170, 82],
  [171, 90],
  [167, 100],
  [169, 105],
  [161, 112],
];
const northCenter: Point[] = [
  [63, 110],
  [72, 102],
  [80, 100],
  [101, 101],
  [112, 97],
  [121, 104],
  [138, 104],
  [144, 108],
  [161, 112],
];
const eastCenter: Point[] = [
  [161, 112],
  [167, 119],
  [173, 121],
  [177, 117],
  [182, 116],
  [186, 122],
  [194, 125],
  [194, 128],
  [189, 133],
  [189, 138],
  [192, 144],
];
const eastSoutheast: Point[] = [
  [192, 144],
  [201, 142],
  [205, 143],
  [207, 149],
  [213, 151],
  [220, 150],
  [229, 147],
  [237, 148],
  [246, 153],
  [254, 158],
  [260, 165],
];
const centerSoutheast: Point[] = [
  [192, 144],
  [188, 152],
  [188, 157],
  [181, 162],
  [180, 170],
  [176, 175],
  [168, 180],
  [163, 185],
  [162, 190],
  [157, 196],
  [149, 201],
  [139, 208],
];
const southeastSouth: Point[] = [
  [139, 237],
  [147, 235],
  [156, 237],
  [164, 242],
  [169, 242],
  [179, 248],
  [182, 254],
  [189, 259],
];
const reversed = (points: Point[]) => [...points].reverse();

function defineRegion(
  id: RegionId,
  name: string,
  scenarioName: string,
  outline: Point[],
  anchor: Point
): MapRegion {
  const xs = outline.map(([x]) => x);
  const ys = outline.map(([, y]) => y);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return {
    id,
    name,
    scenarioName,
    outline,
    anchor,
    destination: id === 'nordeste' ? 'Scenario' : 'ComingSoonRegion',
    clipPath: polygonPath(outline),
    hitPath: polygonPath(outline),
    bounds: { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y },
    motion: { lift: 8, scale: 1.035, tilt: -2 },
  };
}

export const MAP_REGIONS: readonly MapRegion[] = [
  defineRegion(
    'norte',
    'Norte',
    'Curipira',
    [
      ...northEast,
      ...reversed(northCenter).slice(1),
      [53, 111],
      [43, 119],
      [25, 120],
      [24, 113],
      [12, 112],
      [10, 104],
      [5, 95],
      [11, 84],
      [17, 78],
      [31, 74],
      [34, 69],
      [34, 45],
      [30, 42],
      [32, 35],
      [32, 25],
      [44, 26],
      [51, 23],
      [52, 31],
      [59, 35],
      [69, 31],
      [76, 24],
      [68, 23],
      [68, 10],
      [79, 13],
      [85, 12],
      [93, 9],
      [105, 4],
      [116, 8],
      [112, 17],
      [114, 31],
      [121, 33],
      [138, 26],
      [150, 28],
      [158, 29],
      [164, 17],
      [169, 13],
      [173, 25],
      [181, 35],
      [179, 41],
      [175, 45],
      [188, 46],
    ],
    [105, 76]
  ),
  defineRegion(
    'nordeste',
    'Nordeste',
    'Cabra Cabriola',
    [
      ...northEast,
      ...eastCenter.slice(1),
      ...eastSoutheast.slice(1),
      [262, 149],
      [272, 138],
      [284, 125],
      [293, 117],
      [295, 102],
      [298, 83],
      [291, 70],
      [284, 73],
      [282, 61],
      [270, 59],
      [282, 47],
      [282, 30],
      [273, 19],
      [258, 14],
      [240, 16],
      [228, 27],
      [226, 43],
      [224, 45],
      [214, 42],
      [204, 44],
      [196, 50],
      [188, 46],
    ],
    [227, 103]
  ),
  defineRegion(
    'centro_oeste',
    'Centro-Oeste',
    'Boitatá',
    [
      ...northCenter,
      ...eastCenter.slice(1),
      ...centerSoutheast.slice(1),
      [130, 211],
      [126, 202],
      [114, 202],
      [114, 188],
      [116, 176],
      [103, 173],
      [102, 155],
      [88, 154],
      [86, 143],
      [79, 137],
      [69, 134],
      [63, 130],
      [61, 115],
    ],
    [133, 157]
  ),
  defineRegion(
    'sudeste',
    'Sudeste',
    'Mula sem cabeça',
    [
      ...eastSoutheast,
      [262, 176],
      [258, 184],
      [254, 188],
      [249, 199],
      [242, 207],
      [240, 217],
      [235, 220],
      [236, 229],
      [232, 234],
      [219, 233],
      [208, 239],
      [199, 240],
      [192, 246],
      [188, 247],
      [187, 258],
      [189, 259],
      ...reversed(southeastSouth).slice(1),
      [143, 225],
      [138, 223],
      [138, 214],
      ...reversed(centerSoutheast),
    ],
    [206, 195]
  ),
  defineRegion(
    'sul',
    'Sul',
    'Negrinho do Pastoreio',
    [
      ...southeastSouth,
      [185, 266],
      [179, 273],
      [174, 280],
      [165, 285],
      [162, 292],
      [155, 297],
      [148, 297],
      [151, 285],
      [145, 279],
      [138, 276],
      [133, 272],
      [129, 272],
      [123, 266],
      [116, 266],
      [116, 260],
      [124, 252],
      [131, 244],
    ],
    [156, 262]
  ),
];

export function findRegion(id: RegionId | null) {
  return MAP_REGIONS.find((region) => region.id === id);
}

export function pointIsInsidePolygon([x, y]: Point, polygon: readonly Point[]) {
  let inside = false;

  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index++) {
    const [currentX, currentY] = polygon[index];
    const [previousX, previousY] = polygon[previous];
    const crossesHorizontalRay =
      currentY > y !== previousY > y &&
      x < ((previousX - currentX) * (y - currentY)) / (previousY - currentY) + currentX;

    if (crossesHorizontalRay) inside = !inside;
  }

  return inside;
}

export function findRegionAtPoint(point: Point) {
  return MAP_REGIONS.find((region) => pointIsInsidePolygon(point, region.outline));
}
