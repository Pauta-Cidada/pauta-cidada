interface PaginatedReturn<T> {
  paginate: boolean;
  page: number;
  perPage: number;
  resource: string;
  total: number;
  data: T[];
}

function paginatedReturn<T>({
  paginate,
  page,
  perPage,
  resource,
  total,
  data,
}: PaginatedReturn<T>) {
  const totalResource =
    'total' + resource.charAt(0).toUpperCase() + resource.slice(1);

  return {
    [resource]: data,
    [totalResource]: total,
    totalPages: paginate ? Math.ceil(total / perPage) : 1,
    currentPage: paginate ? Number(page) : 1,
  };
}

export { paginatedReturn };
