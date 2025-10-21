import { apiRequest } from "./api";

export interface Role {
    id: number;
    name: string;
    description?: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    status?: "ativo" | "inativo";
    roles?: Role[];
}

export interface CreateUserInput {
    name: string;
    email: string;
    password?: string;
    role_id?: number; // role principal
    role_ids?: number[]; // múltiplos papéis (opcional)
    status?: "ativo" | "inativo";
}

export interface UpdateUserInput {
    name?: string;
    email?: string;
    password?: string;
    role_id?: number;
    role_ids?: number[];
    status?: "ativo" | "inativo";
}

export interface PaginatedResult<T> {
    items: T[];
    page: number;
    perPage: number;
    total: number;
    lastPage: number;
    serverDriven: boolean; // true quando veio meta do servidor
}

export const usersService = {
    async list(): Promise<User[]> {
        // Espera-se que a API retorne { data: User[] } ou User[]; normalizamos
        const res = await apiRequest.get<unknown>("/users");
        const isObject = (v: unknown): v is Record<string, unknown> =>
            typeof v === "object" && v !== null;
        const hasData = (r: unknown): r is { data: unknown } =>
            isObject(r) && Object.prototype.hasOwnProperty.call(r, "data");
        if (Array.isArray(res)) return res as User[];
        if (hasData(res) && Array.isArray(res.data)) return res.data as User[];
        return [];
    },

    async paginate(params?: {
        page?: number;
        perPage?: number;
        search?: string;
    }): Promise<PaginatedResult<User>> {
        const page = params?.page ?? 1;
        const perPage = params?.perPage ?? 10;
        const search = params?.search ?? undefined;
        const res = await apiRequest.get<unknown>("/users", {
            page,
            per_page: perPage,
            q: search,
        });

        const isObject = (v: unknown): v is Record<string, unknown> =>
            typeof v === "object" && v !== null;
        const hasProp = (o: Record<string, unknown>, k: string) =>
            Object.prototype.hasOwnProperty.call(o, k);

        // Formatos suportados:
        // 1) Array simples
        if (Array.isArray(res)) {
            const items = res as User[];
            return {
                items: items.slice(0, perPage),
                page,
                perPage,
                total: items.length,
                lastPage: Math.max(1, Math.ceil(items.length / perPage)),
                serverDriven: false,
            };
        }

        if (isObject(res)) {
            // 2) { data: User[], meta: { current_page, per_page, total, last_page } }
            if (
                hasProp(res, "data") &&
                Array.isArray((res as { data: unknown }).data)
            ) {
                const items = (res as { data: unknown }).data as User[];
                const meta = isObject((res as Record<string, unknown>).meta)
                    ? ((res as Record<string, unknown>).meta as Record<
                          string,
                          unknown
                      >)
                    : undefined;
                if (meta) {
                    const currentPage = Number(meta.current_page ?? page);
                    const per = Number(meta.per_page ?? perPage);
                    const total = Number(meta.total ?? items.length);
                    const last = Number(meta.last_page ?? 1);
                    return {
                        items,
                        page: currentPage,
                        perPage: per,
                        total,
                        lastPage: last,
                        serverDriven: true,
                    };
                }
                // 3) { data: { data: User[], current_page, per_page, total, last_page } }
                if (isObject((res as Record<string, unknown>).data)) {
                    const inner = (res as { data: Record<string, unknown> })
                        .data;
                    const innerItems = Array.isArray(inner.data)
                        ? (inner.data as User[])
                        : items;
                    const currentPage = Number(inner.current_page ?? page);
                    const per = Number(inner.per_page ?? perPage);
                    const total = Number(inner.total ?? innerItems.length);
                    const last = Number(inner.last_page ?? 1);
                    return {
                        items: innerItems,
                        page: currentPage,
                        perPage: per,
                        total,
                        lastPage: last,
                        serverDriven: true,
                    };
                }
                // Sem meta -> client-side fallback
                return {
                    items,
                    page,
                    perPage,
                    total: items.length,
                    lastPage: Math.max(1, Math.ceil(items.length / perPage)),
                    serverDriven: false,
                };
            }
        }

        // Fallback vazio
        return {
            items: [],
            page,
            perPage,
            total: 0,
            lastPage: 1,
            serverDriven: false,
        };
    },

    async create(payload: CreateUserInput): Promise<User> {
        const res = await apiRequest.post<unknown>("/users", payload);
        const isObject = (v: unknown): v is Record<string, unknown> =>
            typeof v === "object" && v !== null;
        const hasData = (r: unknown): r is { data: unknown } =>
            isObject(r) && Object.prototype.hasOwnProperty.call(r, "data");
        return hasData(res) ? (res.data as User) : (res as User);
    },

    async update(id: number, payload: UpdateUserInput): Promise<User> {
        const res = await apiRequest.put<unknown>(`/users/${id}`, payload);
        const isObject = (v: unknown): v is Record<string, unknown> =>
            typeof v === "object" && v !== null;
        const hasData = (r: unknown): r is { data: unknown } =>
            isObject(r) && Object.prototype.hasOwnProperty.call(r, "data");
        return hasData(res) ? (res.data as User) : (res as User);
    },

    async remove(id: number): Promise<void> {
        await apiRequest.delete(`/users/${id}`);
    },

    async assignRole(userId: number, roleId: number): Promise<void> {
        await apiRequest.post(`/users/${userId}/roles`, { role_id: roleId });
    },

    async setRoles(userId: number, roleIds: number[]): Promise<void> {
        // Tenta endpoint em lote; se falhar, faz fallback criando por item
        try {
            await apiRequest.post(`/users/${userId}/roles`, {
                role_ids: roleIds,
            });
        } catch {
            // fallback simples
            for (const rid of roleIds) {
                try {
                    await apiRequest.post(`/users/${userId}/roles`, {
                        role_id: rid,
                    });
                } catch {
                    // ignora individuais
                }
            }
        }
    },
};
