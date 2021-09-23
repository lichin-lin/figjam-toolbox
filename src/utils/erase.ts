/*
 *  Filename: erase.ts
 *  An eraser function designed for use with Standard Vector Graphics.
 *  Author: David Brokaw, with Erik Weitnauer and David Landy
 *  Created: Spring 2014
 *  Last Modified On: 2021/09/12
 *  Last Modified By: Lichin Lin
 */

// This line is for the automated tests with node.js
if (typeof exports != 'undefined') {
  exports.erase = erase;
}

type point = [number, number];
type vector = [number, number];

export function erase(paths: point[][], erasePath: point, eraseRadius: number) {
  eraseRadius = eraseRadius || 20;

  var newPaths = [];
  // pointErase is for use when erasePath is of length 1.
  // In this case the erasing element is a circle, not a capsule.
  var pointErase = function (path) {
    // handle point path
    if (path.length === 1) {
      if (!withinCircle(path[0], erasePath, eraseRadius)) {
        newPaths.push(path);
        return;
      }
    }

    var i = 0;
    var last = 0;
    var newPath;
    while (i < path.length - 1) {
      var p0 = path[i];
      var p1 = path[i + 1];
      var p0_withinCircle = withinCircle(p0, erasePath, eraseRadius);
      var p1_withinCircle = withinCircle(p1, erasePath, eraseRadius);

      // if both points are in the erase area, the first point does not contribute to a new path and can be ignored
      if (p0_withinCircle && p1_withinCircle) {
        i++;
        last = i;
      }

      // If p0 is in the erase area and p1 is not, the first point can be replaced by the point of intersection
      //   between the segment p0->p1 and the border of the erase area. Erasing can continue from there as if the intersection
      //   was the first point in the path.
      else if (p0_withinCircle && !p1_withinCircle) {
        var x = getCircleIntersection(p0, p1, erasePath, eraseRadius);
        if (x) {
          path[i] = x;
          last = i;
        } else {
          i++;
        }
      }

      // If p0 is outside the erase area, and p1 is inside, then all points before and including p0 and the point of intersection
      //   contribute to a new path.  Processing then continues at p1.
      else if (!p0_withinCircle && p1_withinCircle) {
        var x = getCircleIntersection(p1, p0, erasePath, eraseRadius);
        if (x) {
          newPath = path.slice(last, i + 1);
          newPath.push(x);
          newPaths.push(newPath);
        }
        i++;
        last = i;
      } else {
        // Neither p0 or p1 is in the erase area, so there may or may not be a pair of intersections.
        var possIntersects = getCircleIntersections(p0, p1, erasePath, eraseRadius);
        if (possIntersects) {
          // create a new path that goes from the beginning of our current path
          // to the intersection point
          newPath = path.slice(last, i + 1);

          // only add the intersection point if it is not identical to the last
          // point in the path
          if (
            newPath[newPath.length - 1][0] !== possIntersects[0][0] ||
            newPath[newPath.length - 1][1] !== possIntersects[0][1]
          ) {
            newPath.push(possIntersects[0]);
          }

          // we only want paths with length > 1
          if (newPath.length > 1) newPaths.push(newPath);

          // we will put the second intersection point into the current position
          // of our path, but only if it is not identical to the next point in
          // the path (we don't need duplicate points)
          path[i] = possIntersects[1];
          if (path[i + 1] && path[i + 1][0] == possIntersects[1][0] && path[i + 1][1] == possIntersects[1][1]) i++;
          last = i;
        } else {
          i++;
        }
      }
    }
    // the remaining points are assembled into a new path
    if (last !== i) {
      newPath = path.slice(last, path.length);
      if (newPath) {
        newPaths.push(newPath);
      }
    }
  };

  paths.forEach((path) => pointErase(path));
  paths = newPaths as point[][];
  return paths;
}

/**
 *  Note: for all intersection calculations, if a point is on the border of an object,
 *  for example at the distance from the center of a circle equal to the radius,
 *  that point is considered to be `OUTSIDE` that shape.
 */

/**
 * Use this function when it is known that one point is inside the circle and the other is out.
 * Takes ptA: the coordinates of the point inside the circle
 * Takes ptB: the coordinates of the point outside the circle
 * Takes ptC: the center point coordinates of the circle
 * Takes r: the radius of the circle
 * Returns an array: the x and y coordinates of the intersection between the line segment ptA - ptB and the circle.
 */
const getCircleIntersection = (ptA: point, ptB: point, ptC: point, r: number): null | point => {
  const [aX, aY] = ptA;
  const [bX, bY] = ptB;
  const [cX, cY] = ptC;

  const vec_ac = [cX - aX, cY - aY];
  const vec_ab = [bX - aX, bY - aY];

  const mag_ab = Math.sqrt(Math.pow(vec_ab[0], 2) + Math.pow(vec_ab[1], 2));
  const u_vec_ab = [vec_ab[0] / mag_ab, vec_ab[1] / mag_ab];
  const ac_proj_ab = vec_ac[0] * u_vec_ab[0] + vec_ac[1] * u_vec_ab[1];

  // rightPoint is the point on the line segment AB closest to C
  const rightPoint: point = [aX + ac_proj_ab * u_vec_ab[0], aY + ac_proj_ab * u_vec_ab[1]];
  const distCToRightPoint = getDistance(ptC, rightPoint);
  const b = distCToRightPoint === 0 ? r : Math.sqrt(Math.pow(r, 2) - Math.pow(distCToRightPoint, 2));
  const intersection: point = [
    aX + ac_proj_ab * u_vec_ab[0] + b * u_vec_ab[0],
    aY + ac_proj_ab * u_vec_ab[1] + b * u_vec_ab[1],
  ];
  if (intersection[0] === aX && intersection[1] === aY) return null;
  return intersection;
};

/**
 * Use this function when it is known that both points A and B are outside the circle.
 * Takes ptA: the coordinates of the point inside the circle
 * Takes ptB: the coordinates of the point outside the circle
 * Takes ptC: the center point coordinates of the circle
 * Takes r: the radius of the circle
 * Returns either and array of two points or null:
 *  An array if the line segment AB does intersect the circle at two points
 *  (single intersections are not allowed).
 *  Null if there were no intersections.
 */
const getCircleIntersections = (ptA: point, ptB: point, ptC: point, r: number): null | point[] => {
  const [aX, aY] = ptA;
  const [bX, bY] = ptB;
  const [cX, cY] = ptC;
  const vec_ac = [cX - aX, cY - aY];
  const vec_ab = [bX - aX, bY - aY];

  const vec_n = [-vec_ab[1], vec_ab[0]];
  const mag_n = Math.sqrt(Math.pow(vec_n[0], 2) + Math.pow(vec_n[1], 2));
  const u_vec_n = [vec_n[0] / mag_n, vec_n[1] / mag_n];

  // mag_d is the shortest distance from C to the line through AB
  const mag_d = vec_ac[0] * u_vec_n[0] + vec_ac[1] * u_vec_n[1];

  // although mag_d may be less than r, this does not exclusively guarantee that the line segment intersects
  const closest = getClosestPointOnSegment(ptA, ptB, ptC);
  const dist = getLength([closest[0] - cX, closest[1] - cY]);
  if (dist >= r) return null;

  // x is the distance from the circumference of the circle to the point on the line segment AB closest to C
  // d is that closest point
  const x = Math.sqrt(Math.pow(r, 2) - Math.pow(mag_d, 2));
  const vec_cd = [cX - mag_d * u_vec_n[0], cY - mag_d * u_vec_n[1]];

  const mag_ab = Math.sqrt(Math.pow(vec_ab[0], 2) + Math.pow(vec_ab[1], 2));
  const u_vec_ab = [vec_ab[0] / mag_ab, vec_ab[1] / mag_ab];

  const intersections: point[] = [
    [vec_cd[0] - u_vec_ab[0] * x, vec_cd[1] - u_vec_ab[1] * x],
    [vec_cd[0] + u_vec_ab[0] * x, vec_cd[1] + u_vec_ab[1] * x],
  ];
  if (intersections[0][0] === aX && intersections[0][1] === aY) return null;
  return intersections;
};

/**
 * The distance between these two points is calculated.
 * Returns a floating-point number.
 */
const getDistance = (a: point, b: point) => {
  const [aX, aY] = a;
  const [bX, bY] = b;
  return Math.sqrt(Math.pow(bX - aX, 2) + Math.pow(bY - aY, 2));
};

/**
 * Takes pt, the point to be tested
 * Takes centre of circle, cp, the center of the circle
 * Takes r, the radius of the circle located at circleCenter
 */
const withinCircle = (p: point, cp: point, r: number) => {
  return getDistance(p, cp) < r;
};

/**
 * Returns the length of a vector (distance from the origin to point P).
 */
const getLength = (P: vector) => Math.sqrt(P[0] * P[0] + P[1] * P[1]);

const EPS = 1e-6;
/**
 * Returns the closest point on the line segment AB to point P.
 * https://monkeyproofsolutions.nl/wordpress/how-to-calculate-the-shortest-distance-between-a-point-and-a-line/
 */
const getClosestPointOnSegment = (A: point, B: point, P: point) => {
  const AB: vector = [B[0] - A[0], B[1] - A[1]],
    len = getLength(AB);
  if (len < EPS) return A;
  const PA = [P[0] - A[0], P[1] - A[1]];
  const k = (AB[0] * PA[0] + AB[1] * PA[1]) / len;
  if (k < 0) return A;
  if (k > len) return B;
  return [A[0] + (AB[0] * k) / len, A[1] + (AB[1] * k) / len];
};
