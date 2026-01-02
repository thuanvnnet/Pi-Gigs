// types/index.d.ts

export {};

declare global {
  interface Window {
    Pi: any; // Khai báo nhanh để TS không báo lỗi
    startGlobalPiPayment: (
      paymentData: any,
      handlers: { approve: (pid: string) => Promise<any>; complete: (pid: string, txid: string) => Promise<any> },
      uiHandlers: { setStatus: (status: string) => void; setLoading: (loading: boolean) => void; onSuccess: () => void }
    ) => Promise<void>;
  }
}