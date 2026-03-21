import { BOSS_HP, BOSS_SIZE, BOSS_SPEED, GRID_WIDTH, TILE_SIZE } from '@/constants';
import { Direction } from '@/types';

export const VENOM = {
  x: (GRID_WIDTH / 2) * TILE_SIZE - BOSS_SIZE / 2,
  y: TILE_SIZE * 2, // Starts at landing spot
  width: BOSS_SIZE,
  height: BOSS_SIZE,
  direction: Direction.DOWN,
  speed: BOSS_SPEED,
  id: 'VENOM',
  type: 'boss',
  isDead: false,

  // это не интерфейс, это буквальный босс в данный момент, при отрисовке - хп берутся именно отсюда.
  // кто скажет что так не делается тому в рот дам, ибо этот интерфейс бы нигде более не использовался бы.
  hp: BOSS_HP,
  maxHp: BOSS_HP,
  // основные параметры
  cooldown: 0,
  introState: 'DORMANT', // Waiting for fog clear спящий мод
};
