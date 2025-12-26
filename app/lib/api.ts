import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export type Task = {
    id: string;
    title: string;
    description?: string | null;
    status: TaskStatus;
    createdAt: string;
};


export async function getTasks(): Promise<Task[]> {
    const res = await api.get('/task');
    return res.data.data;
}

export async function getTask(id: string): Promise<Task> {
    const res = await api.get(`/task/${id}`);
    return res.data.data;
}

export async function createTask(data: Omit<Task, 'id' | 'createdAt'>) {
    const res = await api.post('/task', data);
    return res.data.data;
}

export async function updateTask(id: string, data: Partial<Omit<Task, 'id' | 'createdAt'>>) {
    const res = await api.patch(`/task/${id}`, data);
    return res.data.data;
}

export async function deleteTask(id: string) {
    const res = await api.delete(`/task/${id}`);
    return res.data.data;
}
