import { apiRequest } from "./api";
import type { Role } from "./users";

export const rolesService = {
    async list(): Promise<Role[]> {
        const res = await apiRequest.get<unknown>("/roles");
        const isObject = (v: unknown): v is Record<string, unknown> =>
            typeof v === "object" && v !== null;
        const hasData = (r: unknown): r is { data: unknown } =>
            isObject(r) && Object.prototype.hasOwnProperty.call(r, "data");
        if (Array.isArray(res)) return res as Role[];
        if (hasData(res) && Array.isArray(res.data)) return res.data as Role[];
        return [];
    },
};
