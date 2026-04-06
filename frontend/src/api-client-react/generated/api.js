import { useMutation, useQuery } from "@tanstack/react-query";
import { customFetch } from "../custom-fetch";
const getHealthCheckUrl = () => {
  return `/api/healthz`;
};
const healthCheck = async (options) => {
  return customFetch(getHealthCheckUrl(), {
    ...options,
    method: "GET"
  });
};
const getHealthCheckQueryKey = () => {
  return [`/api/healthz`];
};
const getHealthCheckQueryOptions = (options) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getHealthCheckQueryKey();
  const queryFn = ({
    signal
  }) => healthCheck({ signal, ...requestOptions });
  return { queryKey, queryFn, ...queryOptions };
};
function useHealthCheck(options) {
  const queryOptions = getHealthCheckQueryOptions(options);
  const query = useQuery(queryOptions);
  return { ...query, queryKey: queryOptions.queryKey };
}
const getRegisterUrl = () => {
  return `/api/auth/register`;
};
const register = async (registerBody, options) => {
  return customFetch(getRegisterUrl(), {
    ...options,
    method: "POST",
    headers: { "Content-Type": "application/json", ...options?.headers },
    body: JSON.stringify(registerBody)
  });
};
const getRegisterMutationOptions = (options) => {
  const mutationKey = ["register"];
  const { mutation: mutationOptions, request: requestOptions } = options ? options.mutation && "mutationKey" in options.mutation && options.mutation.mutationKey ? options : { ...options, mutation: { ...options.mutation, mutationKey } } : { mutation: { mutationKey }, request: void 0 };
  const mutationFn = (props) => {
    const { data } = props ?? {};
    return register(data, requestOptions);
  };
  return { mutationFn, ...mutationOptions };
};
const useRegister = (options) => {
  return useMutation(getRegisterMutationOptions(options));
};
const getLoginUrl = () => {
  return `/api/auth/login`;
};
const login = async (loginBody, options) => {
  return customFetch(getLoginUrl(), {
    ...options,
    method: "POST",
    headers: { "Content-Type": "application/json", ...options?.headers },
    body: JSON.stringify(loginBody)
  });
};
const getLoginMutationOptions = (options) => {
  const mutationKey = ["login"];
  const { mutation: mutationOptions, request: requestOptions } = options ? options.mutation && "mutationKey" in options.mutation && options.mutation.mutationKey ? options : { ...options, mutation: { ...options.mutation, mutationKey } } : { mutation: { mutationKey }, request: void 0 };
  const mutationFn = (props) => {
    const { data } = props ?? {};
    return login(data, requestOptions);
  };
  return { mutationFn, ...mutationOptions };
};
const useLogin = (options) => {
  return useMutation(getLoginMutationOptions(options));
};
const getGetMeUrl = () => {
  return `/api/auth/me`;
};
const getMe = async (options) => {
  return customFetch(getGetMeUrl(), {
    ...options,
    method: "GET"
  });
};
const getGetMeQueryKey = () => {
  return [`/api/auth/me`];
};
const getGetMeQueryOptions = (options) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getGetMeQueryKey();
  const queryFn = ({
    signal
  }) => getMe({ signal, ...requestOptions });
  return { queryKey, queryFn, ...queryOptions };
};
function useGetMe(options) {
  const queryOptions = getGetMeQueryOptions(options);
  const query = useQuery(queryOptions);
  return { ...query, queryKey: queryOptions.queryKey };
}
const getGetTasksUrl = (params) => {
  const normalizedParams = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== void 0) {
      normalizedParams.append(key, value === null ? "null" : value.toString());
    }
  });
  const stringifiedParams = normalizedParams.toString();
  return stringifiedParams.length > 0 ? `/api/tasks?${stringifiedParams}` : `/api/tasks`;
};
const getTasks = async (params, options) => {
  return customFetch(getGetTasksUrl(params), {
    ...options,
    method: "GET"
  });
};
const getGetTasksQueryKey = (params) => {
  return [`/api/tasks`, ...params ? [params] : []];
};
const getGetTasksQueryOptions = (params, options) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getGetTasksQueryKey(params);
  const queryFn = ({
    signal
  }) => getTasks(params, { signal, ...requestOptions });
  return { queryKey, queryFn, ...queryOptions };
};
function useGetTasks(params, options) {
  const queryOptions = getGetTasksQueryOptions(params, options);
  const query = useQuery(queryOptions);
  return { ...query, queryKey: queryOptions.queryKey };
}
const getCreateTaskUrl = () => {
  return `/api/tasks`;
};
const createTask = async (createTaskBody, options) => {
  return customFetch(getCreateTaskUrl(), {
    ...options,
    method: "POST",
    headers: { "Content-Type": "application/json", ...options?.headers },
    body: JSON.stringify(createTaskBody)
  });
};
const getCreateTaskMutationOptions = (options) => {
  const mutationKey = ["createTask"];
  const { mutation: mutationOptions, request: requestOptions } = options ? options.mutation && "mutationKey" in options.mutation && options.mutation.mutationKey ? options : { ...options, mutation: { ...options.mutation, mutationKey } } : { mutation: { mutationKey }, request: void 0 };
  const mutationFn = (props) => {
    const { data } = props ?? {};
    return createTask(data, requestOptions);
  };
  return { mutationFn, ...mutationOptions };
};
const useCreateTask = (options) => {
  return useMutation(getCreateTaskMutationOptions(options));
};
const getGetTaskUrl = (id) => {
  return `/api/tasks/${id}`;
};
const getTask = async (id, options) => {
  return customFetch(getGetTaskUrl(id), {
    ...options,
    method: "GET"
  });
};
const getGetTaskQueryKey = (id) => {
  return [`/api/tasks/${id}`];
};
const getGetTaskQueryOptions = (id, options) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getGetTaskQueryKey(id);
  const queryFn = ({
    signal
  }) => getTask(id, { signal, ...requestOptions });
  return {
    queryKey,
    queryFn,
    enabled: !!id,
    ...queryOptions
  };
};
function useGetTask(id, options) {
  const queryOptions = getGetTaskQueryOptions(id, options);
  const query = useQuery(queryOptions);
  return { ...query, queryKey: queryOptions.queryKey };
}
const getUpdateTaskUrl = (id) => {
  return `/api/tasks/${id}`;
};
const updateTask = async (id, updateTaskBody, options) => {
  return customFetch(getUpdateTaskUrl(id), {
    ...options,
    method: "PUT",
    headers: { "Content-Type": "application/json", ...options?.headers },
    body: JSON.stringify(updateTaskBody)
  });
};
const getUpdateTaskMutationOptions = (options) => {
  const mutationKey = ["updateTask"];
  const { mutation: mutationOptions, request: requestOptions } = options ? options.mutation && "mutationKey" in options.mutation && options.mutation.mutationKey ? options : { ...options, mutation: { ...options.mutation, mutationKey } } : { mutation: { mutationKey }, request: void 0 };
  const mutationFn = (props) => {
    const { id, data } = props ?? {};
    return updateTask(id, data, requestOptions);
  };
  return { mutationFn, ...mutationOptions };
};
const useUpdateTask = (options) => {
  return useMutation(getUpdateTaskMutationOptions(options));
};
const getDeleteTaskUrl = (id) => {
  return `/api/tasks/${id}`;
};
const deleteTask = async (id, options) => {
  return customFetch(getDeleteTaskUrl(id), {
    ...options,
    method: "DELETE"
  });
};
const getDeleteTaskMutationOptions = (options) => {
  const mutationKey = ["deleteTask"];
  const { mutation: mutationOptions, request: requestOptions } = options ? options.mutation && "mutationKey" in options.mutation && options.mutation.mutationKey ? options : { ...options, mutation: { ...options.mutation, mutationKey } } : { mutation: { mutationKey }, request: void 0 };
  const mutationFn = (props) => {
    const { id } = props ?? {};
    return deleteTask(id, requestOptions);
  };
  return { mutationFn, ...mutationOptions };
};
const useDeleteTask = (options) => {
  return useMutation(getDeleteTaskMutationOptions(options));
};
const getToggleTaskCompleteUrl = (id) => {
  return `/api/tasks/${id}/complete`;
};
const toggleTaskComplete = async (id, toggleCompleteBody, options) => {
  return customFetch(getToggleTaskCompleteUrl(id), {
    ...options,
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...options?.headers },
    body: JSON.stringify(toggleCompleteBody)
  });
};
const getToggleTaskCompleteMutationOptions = (options) => {
  const mutationKey = ["toggleTaskComplete"];
  const { mutation: mutationOptions, request: requestOptions } = options ? options.mutation && "mutationKey" in options.mutation && options.mutation.mutationKey ? options : { ...options, mutation: { ...options.mutation, mutationKey } } : { mutation: { mutationKey }, request: void 0 };
  const mutationFn = (props) => {
    const { id, data } = props ?? {};
    return toggleTaskComplete(id, data, requestOptions);
  };
  return { mutationFn, ...mutationOptions };
};
const useToggleTaskComplete = (options) => {
  return useMutation(getToggleTaskCompleteMutationOptions(options));
};
const getGetDashboardSummaryUrl = () => {
  return `/api/dashboard/summary`;
};
const getDashboardSummary = async (options) => {
  return customFetch(getGetDashboardSummaryUrl(), {
    ...options,
    method: "GET"
  });
};
const getGetDashboardSummaryQueryKey = () => {
  return [`/api/dashboard/summary`];
};
const getGetDashboardSummaryQueryOptions = (options) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getGetDashboardSummaryQueryKey();
  const queryFn = ({ signal }) => getDashboardSummary({ signal, ...requestOptions });
  return { queryKey, queryFn, ...queryOptions };
};
function useGetDashboardSummary(options) {
  const queryOptions = getGetDashboardSummaryQueryOptions(options);
  const query = useQuery(queryOptions);
  return { ...query, queryKey: queryOptions.queryKey };
}
const getGetTodayTasksUrl = () => {
  return `/api/dashboard/today`;
};
const getTodayTasks = async (options) => {
  return customFetch(getGetTodayTasksUrl(), {
    ...options,
    method: "GET"
  });
};
const getGetTodayTasksQueryKey = () => {
  return [`/api/dashboard/today`];
};
const getGetTodayTasksQueryOptions = (options) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getGetTodayTasksQueryKey();
  const queryFn = ({
    signal
  }) => getTodayTasks({ signal, ...requestOptions });
  return { queryKey, queryFn, ...queryOptions };
};
function useGetTodayTasks(options) {
  const queryOptions = getGetTodayTasksQueryOptions(options);
  const query = useQuery(queryOptions);
  return { ...query, queryKey: queryOptions.queryKey };
}
const getGetUrgentTasksUrl = () => {
  return `/api/dashboard/urgent`;
};
const getUrgentTasks = async (options) => {
  return customFetch(getGetUrgentTasksUrl(), {
    ...options,
    method: "GET"
  });
};
const getGetUrgentTasksQueryKey = () => {
  return [`/api/dashboard/urgent`];
};
const getGetUrgentTasksQueryOptions = (options) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getGetUrgentTasksQueryKey();
  const queryFn = ({
    signal
  }) => getUrgentTasks({ signal, ...requestOptions });
  return { queryKey, queryFn, ...queryOptions };
};
function useGetUrgentTasks(options) {
  const queryOptions = getGetUrgentTasksQueryOptions(options);
  const query = useQuery(queryOptions);
  return { ...query, queryKey: queryOptions.queryKey };
}
export {
  createTask,
  deleteTask,
  getCreateTaskMutationOptions,
  getCreateTaskUrl,
  getDashboardSummary,
  getDeleteTaskMutationOptions,
  getDeleteTaskUrl,
  getGetDashboardSummaryQueryKey,
  getGetDashboardSummaryQueryOptions,
  getGetDashboardSummaryUrl,
  getGetMeQueryKey,
  getGetMeQueryOptions,
  getGetMeUrl,
  getGetTaskQueryKey,
  getGetTaskQueryOptions,
  getGetTaskUrl,
  getGetTasksQueryKey,
  getGetTasksQueryOptions,
  getGetTasksUrl,
  getGetTodayTasksQueryKey,
  getGetTodayTasksQueryOptions,
  getGetTodayTasksUrl,
  getGetUrgentTasksQueryKey,
  getGetUrgentTasksQueryOptions,
  getGetUrgentTasksUrl,
  getHealthCheckQueryKey,
  getHealthCheckQueryOptions,
  getHealthCheckUrl,
  getLoginMutationOptions,
  getLoginUrl,
  getMe,
  getRegisterMutationOptions,
  getRegisterUrl,
  getTask,
  getTasks,
  getTodayTasks,
  getToggleTaskCompleteMutationOptions,
  getToggleTaskCompleteUrl,
  getUpdateTaskMutationOptions,
  getUpdateTaskUrl,
  getUrgentTasks,
  healthCheck,
  login,
  register,
  toggleTaskComplete,
  updateTask,
  useCreateTask,
  useDeleteTask,
  useGetDashboardSummary,
  useGetMe,
  useGetTask,
  useGetTasks,
  useGetTodayTasks,
  useGetUrgentTasks,
  useHealthCheck,
  useLogin,
  useRegister,
  useToggleTaskComplete,
  useUpdateTask
};
