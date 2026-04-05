// // src/constants/roles.ts
// export const Roles = {
//   USER: "USER",
//   OWNER: "OWNER",
//   ADMIN: "ADMIN",

// } as const;




// src/constants/roles.ts

export const Roles = {
  USER:  "USER",
  OWNER: "OWNER",
  ADMIN: "ADMIN",
} as const;

export type Role = (typeof Roles)[keyof typeof Roles];