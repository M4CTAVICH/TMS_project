export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationResult {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export const getPaginationParams = (
  page: number = 1,
  limit: number = 20,
  maxLimit: number = 100
): { skip: number; take: number; page: number; limit: number } => {
  const normalizedPage = Math.max(1, page);
  const normalizedLimit = Math.min(Math.max(1, limit), maxLimit);
  const skip = (normalizedPage - 1) * normalizedLimit;

  return {
    skip,
    take: normalizedLimit,
    page: normalizedPage,
    limit: normalizedLimit,
  };
};

export const getPaginationMeta = (
  total: number,
  page: number,
  limit: number
): PaginationResult => {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};
