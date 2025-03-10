export enum NoteType {
  SIMPLE = "simple",
  CHECKBOX = "checkbox",
  BUDGET_LIST = "budget_list",
}

export interface Note {
  id: string
  title: string
  type: NoteType
  content?: string
  checkboxItems?: Array<{ text: string; checked: boolean }>
  budgetList?: Array<{ key: string; value: string }>
}

