declare module 'xlsx-fixed' {
  export interface WorkSheet {
    [key: string]: unknown
  }
  export interface WorkBook {
    SheetNames: string[]
    Sheets: Record<string, WorkSheet>
  }
  export function read(data: Buffer | string, opts?: { type?: string; cellDates?: boolean }): WorkBook
  export const utils: {
    sheet_to_json<T>(sheet: WorkSheet, opts?: { raw?: boolean; defval?: string; blankrows?: boolean }): T[]
  }
}
