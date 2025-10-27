import { User } from "@/types";
import api from "../axios";

export const userApi = {
        getAllUsers: () => api.get<User[]>("/users"),
        getUserById: (userId: string) => api.get<User>(`/users/${userId}`),
};
