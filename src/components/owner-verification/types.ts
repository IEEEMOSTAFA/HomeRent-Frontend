// ─── Shared Types ─────────────────────────────────────────────────────────────
export type Owner = {
  id: string;
  userId: string;
  verified: boolean;
  phone?: string;
  nidNumber?: string;
  user: { name: string; email: string; avatarUrl?: string };
};

// ─── Lottie Animation Data (inline checkmark) ─────────────────────────────────
export const checkmarkLottie = {
  v: "5.7.4", fr: 30, ip: 0, op: 40, w: 64, h: 64, nm: "check", ddd: 0,
  assets: [],
  layers: [{
    ddd: 0, ind: 1, ty: 4, nm: "check", sr: 1,
    ks: {
      o: { a: 0, k: 100 }, r: { a: 0, k: 0 },
      p: { a: 0, k: [32, 32, 0] }, a: { a: 0, k: [0, 0, 0] },
      s: { a: 1, k: [{ i: { x: [0.5], y: [1.3] }, o: { x: [0.5], y: [0] }, t: 0, s: [0, 0, 100] }, { t: 18, s: [100, 100, 100] }] },
    },
    ao: 0, ip: 0, op: 40, st: 0, bm: 0,
    shapes: [{
      ty: "gr",
      it: [
        { ty: "sh", ks: { a: 0, k: { i: [[0,0],[0,0],[0,0]], o: [[0,0],[0,0],[0,0]], v: [[-12, 0], [-3, 9], [12, -8]], c: false } } },
        { ty: "st", c: { a: 0, k: [0.18, 0.8, 0.44, 1] }, o: { a: 0, k: 100 }, w: { a: 0, k: 3.5 }, lc: 2, lj: 2 },
        { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
      ],
    }],
  }],
};