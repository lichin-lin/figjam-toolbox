import {erase} from '../utils/erase';
const parseSVG = require('svg-path-parser');

figma.showUI(__html__, {width: 300, height: 400});

const getElementPos = (element) => {
  return {
    x0: element.absoluteTransform[0][2],
    x1: element.absoluteTransform[0][2] + element.width,
    y0: element.absoluteTransform[1][2],
    y1: element.absoluteTransform[1][2] + element.height,
  };
};

const countElementInArea = (area, stamps) => {
  let result = 0;
  stamps.forEach((stamp) => {
    if (stamp.x1 > area.x0 && stamp.x0 < area.x1 && stamp.y1 > area.y0 && stamp.y0 < area.y1) {
      result += 1;
    }
  });
  return result;
};

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'toggle-eraser') {
    const eraser = figma.currentPage.findChildren((n) => n.name === 'eraser');

    if (eraser.length > 0) {
      eraser?.[0].remove();
    } else {
      const eraserComponent = figma.createEllipse();
      eraserComponent.name = 'eraser';
      eraserComponent.resize(40, 40);
      eraserComponent.fills = [
        {
          type: 'SOLID',
          color: {
            r: 0,
            g: 0,
            b: 0,
          },
          opacity: 0.2,
        },
      ];
      figma.currentPage.selection = [eraserComponent];
      figma.viewport.scrollAndZoomIntoView([eraserComponent]);
    }
  }
};

setInterval(async () => {
  checkEraser();
}, 1000 / 10);

const checkEraser = () => {
  // 1. Check Eraser
  const eraser = figma.currentPage.findChildren((n) => n.name === 'eraser');
  if (eraser.length < 1) return;

  const eraserComponent = eraser?.[0];
  const allStroke = figma.currentPage.findChildren((n) => n.type === 'VECTOR');

  // 2. Check All Doodle one by one if interact with eraser on canvas
  allStroke?.forEach((doodle: VectorNode) => {
    const areaForStroke = getElementPos(doodle);
    const areaForEraser = getElementPos(eraserComponent);
    if (countElementInArea(areaForStroke, [areaForEraser]) === 0) {
      console.log('nothing between them, pass...', doodle.id);
      return;
    }

    const path = doodle.vectorPaths?.[0]?.data;
    if (!path) return;
    // 3. Parse path into svg commands
    const commands = parseSVG(path);

    /**
     * 4. Erase the point on the svg commands, using erase() function
     *    Here we need to map points into absolute position,
     *    so we're able to know if any of the points is interact with eraser;
     */
    const absolutePoints = commands.map((singleParsedSVGCommand) => [
      singleParsedSVGCommand.x + doodle.x,
      singleParsedSVGCommand.y + doodle.y,
    ]);
    const eraserCentrePoint = [
      eraserComponent.x + eraserComponent.width / 2,
      eraserComponent.y + eraserComponent.height / 2,
    ] as [number, number];
    let _absolutePoints = erase([absolutePoints], eraserCentrePoint, eraserComponent.width / 2);
    /**
     * 5. _absolutePoints: since we might let one doodle stroke become two segment,
     *    we need to map through them to render on the canvas.
     */

    _absolutePoints.map((pointOnPath, id) => {
      // 6. we need to, make each point on path from absolute coordinate to it's local relative coordinate.
      const calcPointOnPath = pointOnPath.map((point) => [
        Math.ceil(point[0] - _absolutePoints[id][0][0]),
        Math.ceil(point[1] - _absolutePoints[id][0][1]),
      ]);
      try {
        const newStrokeElm = doodle.clone();
        newStrokeElm.x = _absolutePoints[id][0][0];
        newStrokeElm.y = _absolutePoints[id][0][1];
        newStrokeElm.vectorPaths = [
          {
            windingRule: 'NONE',
            // TODO: simulate how figjam draw doodle.
            data: drawBeautifulLine(calcPointOnPath, bezierCommand),
          },
        ];
      } catch (e) {
        console.log('error when setting...', e);
      }
    });
    // remove old and redraw...(!)
    doodle.remove();
  });
};

const drawBeautifulLine = (points, command) => {
  return points.reduce(
    (acc, point, i, a) =>
      i === 0
        ? // if first point
          `M ${point[0]} ${point[1]}`
        : // else
          `${acc} ${command(point, i, a)}`,
    ''
  );
};
const line = (pointA, pointB) => {
  const lengthX = pointB[0] - pointA[0];
  const lengthY = pointB[1] - pointA[1];
  return {
    length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
    angle: Math.atan2(lengthY, lengthX),
  };
};
const controlPoint = (current, previous, next, reverse) => {
  // When 'current' is the first or last point of the array
  // 'previous' or 'next' don't exist.
  // Replace with 'current'
  const p = previous || current;
  const n = next || current;
  // The smoothing ratio
  const smoothing = 0.2;
  // Properties of the opposed-line
  const o = line(p, n);
  // If is end-control-point, add PI to the angle to go backward
  const angle = o.angle + (reverse ? Math.PI : 0);
  const length = o.length * smoothing;
  // The control point position is relative to the current point
  const x = current[0] + Math.cos(angle) * length;
  const y = current[1] + Math.sin(angle) * length;
  return [x, y];
};
const bezierCommand = (point, i, a) => {
  // start control point
  const [cpsX, cpsY] = controlPoint(a[i - 1], a[i - 2], point, false);
  // end control point
  const [cpeX, cpeY] = controlPoint(point, a[i - 1], a[i + 1], true);
  return `C ${cpsX} ${cpsY} ${cpeX} ${cpeY} ${point[0]} ${point[1]}`;
};
