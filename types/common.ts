export interface BaseEntity {
  id: number;
  created_at: string;
}

export interface SelectOption {
  label: string;
  value: string | number;
}