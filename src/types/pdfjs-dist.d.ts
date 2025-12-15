declare module 'pdfjs-dist' {
  export const version: string;
  export const GlobalWorkerOptions: { workerSrc: string };
  export function getDocument(src: any): any;
}

declare module 'pdfjs-dist/build/pdf.worker?url' {
  const workerSrc: string;
  export default workerSrc;
}
