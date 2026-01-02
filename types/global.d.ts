// global.d.ts
export {};

declare global {
  interface Window {
    Pi: any; // Khai báo Pi để TS không báo lỗi
  }
}