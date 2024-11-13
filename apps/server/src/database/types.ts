export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationInfo;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface SortingParams<T> {
  sortBy?: keyof T;
  sortOrder?: 'ASC' | 'DESC';
}

export type PaginatedRequest<T, F = object> = PaginationParams &
  SortingParams<T> &
  F;
