// ====================================================
// visemeMapping.js – map characters/phonemes to viseme
// ====================================================

export function charToViseme(c) {
    c = c.toLowerCase();
    if ("ae".includes(c)) return 0; // "aa"
    if ("iou".includes(c)) return 2; // "ou/ee"
    if ("fv".includes(c)) return 1; // "ih"
    if ("lrsz".includes(c)) return 3; // "ee"
    if ("bmp".includes(c)) return 4; // "oh"
    return 5; // "sil"
}
