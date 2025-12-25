const BASE = process.env.NEXT_PUBLIC_API_URL;

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export type Task = {
    id: string;
    title: string;
    description?: string | null;
    status: TaskStatus;
    createdAt: string;
};


export async function getTasks(): Promise<Task[]> {
    const res = await fetch(`${BASE}/task`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load tasks');
    const json = await res.json();
    return json.data;
}

export async function getTask(id: string): Promise<Task> {
    const res = await fetch(`${BASE}/task/${id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load task');
    const json = await res.json();
    return json.data;
}

export async function createTask(data: Omit<Task, 'id' | 'createdAt'>) {
    const res = await fetch(`${BASE}/task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    const json = await res.json();
    return json.data;
}

export async function updateTask(id: string, data: Partial<Omit<Task, 'id' | 'createdAt'>>) {
    const res = await fetch(`${BASE}/task/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    const json = await res.json();
    return json.data;
}

export async function deleteTask(id: string) {
    const res = await fetch(`${BASE}/task/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(await res.text());
    const json = await res.json();
    return json.data;
}
