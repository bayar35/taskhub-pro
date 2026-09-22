export type TodoCategory = 'Хувийн' | 'Ажил' | 'Хичээл';
export type TodoPriority = 'low' | 'medium' | 'high';

export interface ITodo {
  _id: string;
  userId: string;
  text: string;
  category: TodoCategory;
  priority: TodoPriority;
  dueDate?: string;
  completed: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ITodoFilters {
  category?: TodoCategory | 'Бүгд';
  search?: string;
  completed?: boolean;
  priority?: TodoPriority;
}