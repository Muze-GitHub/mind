export interface SelectField {
  variable: string
  label: string
  type: 'select'
  max_length: number
  required: boolean
  options: string[]
}

export interface TextInputField {
  variable: string
  label: string
  type: 'text-input'
  max_length: number
  required: boolean
  options: never[]
}

export type FormField = {
  select?: SelectField
  'text-input'?: TextInputField
}

export type FormInputType = FormField[]
