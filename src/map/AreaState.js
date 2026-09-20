/**
 * AreaState — jejak area yang sudah dikunjungi pemain (runtime + memory).
 * Save persisten dihubungkan pada fase Save System (Phase 5+).
 */

class AreaStateClass {
  constructor() {
    this._visited = new Set();
    this._current = null;
  }

  get current() {
    return this._current;
  }

  get visited() {
    return [...this._visited];
  }

  has(mapId) {
    return this._visited.has(mapId);
  }

  markCurrent(mapId) {
    this._current = mapId;
  }

  markVisited(mapId) {
    if (this._visited.has(mapId)) return false;
    this._visited.add(mapId);
    return true;
  }

  reset() {
    this._visited.clear();
    this._current = null;
  }
}

export const AreaState = new AreaStateClass();