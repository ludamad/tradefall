export function sum(elems, f) {
  let val = 0;
  for (const elem of elems) {
    val += f(elem);
  }
  return val;
}

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

export const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

/**
 * https://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range
 * Returns a random number between min (inclusive) and max (exclusive)
 */
export function randRange(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * https://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
export function randIntRange(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function range(n) {
  let ret: number[] = [];
  for (var i = 0; i < n; i++) {
    ret.push(i);
  }
  return ret;
}

export function countAll<T>(objs: T[], obj: T) {
  let sum = 0;
  for (const o of objs) {
    if (o === obj) {
      sum++;
    }
  }
  return sum;
}

export function hash(str: string) {
  let hash = 1;
  if (str.length === 0) {
    return hash;
  }
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  // Dont allow a hash of 0
  return hash || 1;
}

export function random<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randomN<T>(arr: T[], n: number): T[] {
  const ret: T[] = [];
  for (let i = 0; i < Math.min(n, arr.length); i++) {
    let elem = random(arr);
    while (ret.indexOf(elem) >= 0) {
      elem = random(arr);
    }
    ret.push(elem);
  }
  return ret;
}

export function has<T>(arr: T[], elem: T) {
  return arr.indexOf(elem) >= 0;
}

export function any<T>(arr: T[], func: (T) => boolean) {
  for (const elem of arr) {
    if (func(elem)) {
      return true;
    }
  }
  return false;
}

export function hasProperty(obj: any, key: string) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

export function getProperty(obj: any, key: string) {
  return hasProperty(obj, key) ? obj[key] : undefined;
}

export function assign<A, B extends A>(obj1: B, obj2: A): B {
  return Object.assign({}, obj1, obj2);
}

export function append<T>(list: T[], obj: T) {
  return [...list, obj];
}

export function removeOne<T>(list: T[], obj: T): boolean {
  const idx = list.indexOf(obj);
  if (idx >= 0) {
    list.splice(idx, 1);
    return true;
  }
  return false;
}

export function interpolate(a, b, precision) {
  return a + (b - a) * precision;
}

export function anyTrue(list, f) {
  for (let elem of list) {
    if (f(elem)) {
      return true;
    }
  }
  return false;
}

export function nOf(n, elem) {
  const ret: any[] = [];
  for (let i = 0; i < n; i++) {
    ret.push(elem);
  }
  return ret;
}

/**
 * Returns an array with arrays of the given size.
 *
 * @param myArray {Array} array to split
 * @param size {Integer} Size of every group
 */
export function splitArray(myArray, size) {
  const arrayLength = myArray.length;
  const chunks: any[] = [];

  for (let index = 0; index < arrayLength; index += size) {
    const myChunk = myArray.slice(index, index + size);
    chunks.push(myChunk);
  }

  return chunks;
}
