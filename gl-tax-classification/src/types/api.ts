export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export interface PagedRequest {
  page?: number;
  pageSize?: number;
}
