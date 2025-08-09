declare module 'quill-better-table' {
  import { Module } from 'quill';
  
  interface BetterTableModule extends Module {
    insertTable(rows: number, cols: number): void;
  }
  
  const QuillBetterTable: any;
  export default QuillBetterTable;
}