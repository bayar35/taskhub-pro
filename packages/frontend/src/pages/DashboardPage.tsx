import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout } from '../features/auth/authSlice';
import { useLogoutMutation } from '../features/auth/authApi';
import {
  useGetTodosQuery,
  useGetTodoStatsQuery,
  useCreateTodoMutation,
  useToggleTodoMutation,
  useDeleteTodoMutation,
} from '../features/todo/todoApi';
import { Button } from '../components/Button';

export default function DashboardPage() {
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const [logoutApi] = useLogoutMutation();

  const [input, setInput] = useState('');
  const [category, setCategory] = useState<'Хувийн' | 'Ажил' | 'Хичээл'>(
    'Хувийн'
  );
  const [filter, setFilter] = useState('Бүгд');

  const { data, isLoading } = useGetTodosQuery({ category: filter });
  const { data: stats } = useGetTodoStatsQuery();
  const [createTodo] = useCreateTodoMutation();
  const [toggleTodo] = useToggleTodoMutation();
  const [deleteTodo] = useDeleteTodoMutation();

  const handleAdd = async () => {
    if (!input.trim()) return;
    try {
      await createTodo({
        text: input,
        category,
        priority: 'medium',
      }).unwrap();
      setInput('');
      toast.success('Todo нэмэгдлээ');
    } catch {
      toast.error('Алдаа');
    }
  };

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch {}
    dispatch(logout());
    toast.success('Гарлаа');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">TaskHub Pro</h1>
            <p className="text-sm text-gray-500">
              Сайн уу, <b>{user?.username}</b> 👋
            </p>
          </div>
          <Button variant="danger" size="sm" onClick={handleLogout}>
            Гарах
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <p className="text-2xl font-bold">{stats.data.total}</p>
              <p className="text-sm text-gray-500">Нийт</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <p className="text-2xl font-bold text-green-600">
                {stats.data.completed}
              </p>
              <p className="text-sm text-gray-500">Дууссан</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <p className="text-2xl font-bold text-orange-600">
                {stats.data.pending}
              </p>
              <p className="text-sm text-gray-500">Хүлээгдэж буй</p>
            </div>
          </div>
        )}

        <div className="bg-white p-4 rounded-lg shadow mb-6 space-y-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Юу хийх вэ..."
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <div className="flex gap-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none"
            >
              <option value="Хувийн">🏠 Хувийн</option>
              <option value="Ажил">💼 Ажил</option>
              <option value="Хичээл">📚 Хичээл</option>
            </select>
            <Button onClick={handleAdd}>Нэмэх</Button>
          </div>
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          {['Бүгд', 'Хувийн', 'Ажил', 'Хичээл'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-sm border transition ${
                filter === cat
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {isLoading ? (
          <p className="text-center py-8">Ачаалж байна...</p>
        ) : data?.todos.length === 0 ? (
          <p className="text-center py-8 text-gray-500">
            Todo байхгүй. Нэмээрэй!
          </p>
        ) : (
          <ul className="space-y-2">
            {data?.todos.map((todo) => (
              <li
                key={todo._id}
                className={`bg-white p-3 rounded-lg shadow flex items-center gap-3 ${
                  todo.completed ? 'opacity-60' : ''
                }`}
              >
                <button
                  onClick={() => toggleTodo(todo._id)}
                  className="text-xl"
                >
                  {todo.completed ? '✅' : '⬜'}
                </button>
                <div className="flex-1">
                  <p
                    className={
                      todo.completed ? 'line-through text-gray-500' : ''
                    }
                  >
                    {todo.text}
                  </p>
                  <p className="text-xs text-gray-500">
                    🏷️ {todo.category} • {todo.priority}
                  </p>
                </div>
                <button
                  onClick={() => deleteTodo(todo._id)}
                  className="text-red-500 hover:text-red-700"
                >
                  🗑️
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}