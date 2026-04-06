import * as zod from "zod";
const HealthCheckResponse = zod.object({
  status: zod.string()
});
const RegisterBody = zod.object({
  name: zod.string(),
  email: zod.string(),
  password: zod.string()
});
const LoginBody = zod.object({
  email: zod.string(),
  password: zod.string()
});
const LoginResponse = zod.object({
  token: zod.string(),
  user: zod.object({
    id: zod.number(),
    name: zod.string(),
    email: zod.string(),
    createdAt: zod.string()
  })
});
const GetMeResponse = zod.object({
  id: zod.number(),
  name: zod.string(),
  email: zod.string(),
  createdAt: zod.string()
});
const GetTasksQueryParams = zod.object({
  status: zod.enum(["pending", "completed", "overdue"]).optional(),
  priority: zod.enum(["low", "medium", "high"]).optional(),
  category: zod.enum(["work", "personal", "study"]).optional(),
  timeRange: zod.enum(["today", "upcoming", "all"]).optional()
});
const GetTasksResponseItem = zod.object({
  id: zod.number(),
  userId: zod.number(),
  title: zod.string(),
  description: zod.string().nullish(),
  startDate: zod.string().nullish(),
  deadlineDate: zod.string().nullish(),
  reminderTime: zod.string().nullish(),
  priority: zod.enum(["low", "medium", "high"]),
  category: zod.enum(["work", "personal", "study"]),
  completed: zod.boolean(),
  status: zod.enum(["pending", "completed", "overdue"]),
  createdAt: zod.string(),
  updatedAt: zod.string()
});
const GetTasksResponse = zod.array(GetTasksResponseItem);
const CreateTaskBody = zod.object({
  title: zod.string(),
  description: zod.string().nullish(),
  startDate: zod.string().nullish(),
  deadlineDate: zod.string().nullish(),
  reminderTime: zod.string().nullish(),
  priority: zod.enum(["low", "medium", "high"]),
  category: zod.enum(["work", "personal", "study"])
});
const GetTaskParams = zod.object({
  id: zod.coerce.number()
});
const GetTaskResponse = zod.object({
  id: zod.number(),
  userId: zod.number(),
  title: zod.string(),
  description: zod.string().nullish(),
  startDate: zod.string().nullish(),
  deadlineDate: zod.string().nullish(),
  reminderTime: zod.string().nullish(),
  priority: zod.enum(["low", "medium", "high"]),
  category: zod.enum(["work", "personal", "study"]),
  completed: zod.boolean(),
  status: zod.enum(["pending", "completed", "overdue"]),
  createdAt: zod.string(),
  updatedAt: zod.string()
});
const UpdateTaskParams = zod.object({
  id: zod.coerce.number()
});
const UpdateTaskBody = zod.object({
  title: zod.string().optional(),
  description: zod.string().nullish(),
  startDate: zod.string().nullish(),
  deadlineDate: zod.string().nullish(),
  reminderTime: zod.string().nullish(),
  priority: zod.enum(["low", "medium", "high"]).optional(),
  category: zod.enum(["work", "personal", "study"]).optional(),
  completed: zod.boolean().optional(),
  status: zod.enum(["pending", "completed", "overdue"]).optional()
});
const UpdateTaskResponse = zod.object({
  id: zod.number(),
  userId: zod.number(),
  title: zod.string(),
  description: zod.string().nullish(),
  startDate: zod.string().nullish(),
  deadlineDate: zod.string().nullish(),
  reminderTime: zod.string().nullish(),
  priority: zod.enum(["low", "medium", "high"]),
  category: zod.enum(["work", "personal", "study"]),
  completed: zod.boolean(),
  status: zod.enum(["pending", "completed", "overdue"]),
  createdAt: zod.string(),
  updatedAt: zod.string()
});
const DeleteTaskParams = zod.object({
  id: zod.coerce.number()
});
const ToggleTaskCompleteParams = zod.object({
  id: zod.coerce.number()
});
const ToggleTaskCompleteBody = zod.object({
  completed: zod.boolean()
});
const ToggleTaskCompleteResponse = zod.object({
  id: zod.number(),
  userId: zod.number(),
  title: zod.string(),
  description: zod.string().nullish(),
  startDate: zod.string().nullish(),
  deadlineDate: zod.string().nullish(),
  reminderTime: zod.string().nullish(),
  priority: zod.enum(["low", "medium", "high"]),
  category: zod.enum(["work", "personal", "study"]),
  completed: zod.boolean(),
  status: zod.enum(["pending", "completed", "overdue"]),
  createdAt: zod.string(),
  updatedAt: zod.string()
});
const GetDashboardSummaryResponse = zod.object({
  totalActive: zod.number(),
  inProgress: zod.number(),
  completedToday: zod.number(),
  completedTotal: zod.number(),
  overdueCount: zod.number(),
  completionRate: zod.number(),
  missedTotal: zod.number(),
  todayCount: zod.number(),
  upcomingCount: zod.number()
});
const GetTodayTasksResponseItem = zod.object({
  id: zod.number(),
  userId: zod.number(),
  title: zod.string(),
  description: zod.string().nullish(),
  startDate: zod.string().nullish(),
  deadlineDate: zod.string().nullish(),
  reminderTime: zod.string().nullish(),
  priority: zod.enum(["low", "medium", "high"]),
  category: zod.enum(["work", "personal", "study"]),
  completed: zod.boolean(),
  status: zod.enum(["pending", "completed", "overdue"]),
  createdAt: zod.string(),
  updatedAt: zod.string()
});
const GetTodayTasksResponse = zod.array(GetTodayTasksResponseItem);
const GetUrgentTasksResponseItem = zod.object({
  id: zod.number(),
  userId: zod.number(),
  title: zod.string(),
  description: zod.string().nullish(),
  startDate: zod.string().nullish(),
  deadlineDate: zod.string().nullish(),
  reminderTime: zod.string().nullish(),
  priority: zod.enum(["low", "medium", "high"]),
  category: zod.enum(["work", "personal", "study"]),
  completed: zod.boolean(),
  status: zod.enum(["pending", "completed", "overdue"]),
  createdAt: zod.string(),
  updatedAt: zod.string()
});
const GetUrgentTasksResponse = zod.array(GetUrgentTasksResponseItem);
export {
  CreateTaskBody,
  DeleteTaskParams,
  GetDashboardSummaryResponse,
  GetMeResponse,
  GetTaskParams,
  GetTaskResponse,
  GetTasksQueryParams,
  GetTasksResponse,
  GetTasksResponseItem,
  GetTodayTasksResponse,
  GetTodayTasksResponseItem,
  GetUrgentTasksResponse,
  GetUrgentTasksResponseItem,
  HealthCheckResponse,
  LoginBody,
  LoginResponse,
  RegisterBody,
  ToggleTaskCompleteBody,
  ToggleTaskCompleteParams,
  ToggleTaskCompleteResponse,
  UpdateTaskBody,
  UpdateTaskParams,
  UpdateTaskResponse
};
