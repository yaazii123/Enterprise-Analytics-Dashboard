export interface ApiError {
  status: number;
  message: string;
  code?: string;
}

export interface Paginated<T> {
  rows: T[];
  total: number;
}
