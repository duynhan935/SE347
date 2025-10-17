import api from "../axios";
import type { Size, SizeData } from "@/types";

export const sizeApi = {
    getAllSizes: () => api.get<Size[]>("/size"),
    createSize: (sizeData: SizeData) => api.post<Size>("/size", sizeData),
    updateSize: (sizeId: string, sizeData: SizeData) => api.put<Size>(`/size/${sizeId}`, sizeData),
    deleteSize: (sizeId: string) => api.delete(`/size/${sizeId}`),
};
