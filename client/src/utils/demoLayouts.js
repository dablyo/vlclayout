import { COLOR_PALETTE } from './colors';

export const GEODYM_LAYOUT = {
  id: 'demo-geodym',
  name: '9灯覆盖',
  modules: Array.from({ length: 9 }, (_, i) => {
    const row = Math.floor(i / 3);
    const col = i % 3;
    return {
      id: i + 1,
      x: 500 + (col - 1) * 333,
      z: 500 + (row - 1) * 333,
      height: 200,
      angle: 90,
      color: COLOR_PALETTE[i],
    };
  }),
};

export const QUADGEO_LAYOUT = {
  id: 'demo-quadgeo',
  name: '单灯覆盖',
  modules: [
    {
      id: 1,
      x: 500,
      z: 500,
      height: 200,
      angle: 90,
      color: COLOR_PALETTE[0],
    },
  ],
};
