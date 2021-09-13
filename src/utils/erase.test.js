import {erase} from './erase.ts';

describe('Eraser test cases', () => {
  it('return corrct paths', () => {
    const doodlePath = [
      [
        [-172.54615783691406, -71.63196923620126],
        [-152.54615783691406, -71.63196923620126],
        [-117.54615783691406, -62.6319694519043],
        [-91.54615783691406, -40.6319694519043],
        [-78.54615783691406, -2.6319656372070312],
        [-76.54615783691406, 44.36803436279297],
        [-76.54615783691406, 47.36803436279297],
      ],
    ];
    const erasePath = [[-72, 64]];
    const eraseRadius = 20;
    const expectPaths = [
      [
        [-173, -72],
        [-153, -72],
        [-118, -63],
        [-92, -41],
        [-79, -3],
        [-77, 44],
        [-77, 45],
      ],
    ];
    expect(erase(doodlePath, erasePath, eraseRadius)).toEqual(expectPaths);
  });
});
