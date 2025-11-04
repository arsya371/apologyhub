export interface Apology {
  id: string;
  content: string;
  toWho: string | null;
  fromWho: string | null;
  ipAddress: string | null;
  createdAt: Date;
  updatedAt: Date;
  views: number;
}

export interface ApologyFormData {
  content: string;
  toWho?: string;
  turnstileToken: string;
}

export interface ApologyFilter {
  search?: string;
  toWho?: string;
  page?: number;
  pageSize?: number;
  sortBy?: "createdAt" | "views";
  sortOrder?: "asc" | "desc";
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
