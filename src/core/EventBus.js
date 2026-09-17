/**
 * EventBus — pub/sub ringan untuk komunikasi antar sistem.
 */

class EventBusClass {
  constructor() {
    this._listeners = new Map();
  }

  on(event, fn, context = null) {
    if (!this._listeners.has(event)) this._listeners.set(event, []);
    this._listeners.get(event).push({ fn, context });
    return () => this.off(event, fn, context);
  }

  off(event, fn, context = null) {
    const list = this._listeners.get(event);
    if (!list) return;
    this._listeners.set(
      event,
      list.filter((entry) => entry.fn !== fn || entry.context !== context)
    );
  }

  emit(event, ...args) {
    const list = this._listeners.get(event);
    if (!list) return;
    for (const { fn, context } of list) {
      fn.apply(context, args);
    }
  }

  once(event, fn, context = null) {
    const wrapper = (...args) => {
      this.off(event, wrapper, context);
      fn.apply(context, args);
    };
    return this.on(event, wrapper, context);
  }

  removeAll() {
    this._listeners.clear();
  }
}

export const EventBus = new EventBusClass();