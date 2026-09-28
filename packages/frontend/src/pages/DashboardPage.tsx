import { useState, useCallback, useEffect } from 'react';
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
import { SearchBar } from '../components/SearchBar';
import { ThemeToggle } from '../components/ThemeToggle';
import { NotificationBell } from '../components/NotificationBell';
import { connectSocket, disconnectSocket } from '../lib/socket';

export default function DashboardPage() {
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const [logoutApi] = useLogoutMutation();

  // ⬇️ SOCKET CONNECT — ЭНЭ ФУНКЦ ДОТОР БАЙХ ЁСТОЙ
  useEffect(() => {
    if (user?._id) {
      connectSocket(user._id);
      return () => disconnectSocket();
    }
  }, [user?._id]);

  const [input, setInput] = useState('');
  const [category, setCategory] = useState<'Хувийн' | 'Ажил' | 'Хичээл'>(
    'Хувийн'
  );
  const [filter, setFilter] = useState('Бүгд');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useGetTodosQuery({
    category: filter === 'Бүгд' ? undefined : filter,
    search: search || undefined,
  });
  const { data: stats } = useGetTodoStatsQuery();
  const [createTodo] = useCreateTodoMutation();
  const [toggleTodo] = useToggleTodoMutation();
  const [deleteTodo] = useDeleteTodoMutation();

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
  }, []);

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <header className="bg-white dark:bg-gray-800 shadow transition-colors">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold dark:text-white">TaskHub Pro</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Сайн уу, <b>{user?.username}</b> 👋
            </p>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <ThemeToggle />
            <Button variant="danger" size="sm" onClick={handleLogout}>
              Гарах
            </Button>
          </div>
        </div>
      </header>

      {/* ... бусад JSX хэвээр ... */}
      <main className="max-w-4xl mx-auto p-4">
        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center transition-colors">
              <p className="text-2xl font-bold dark:text-white">
                {stats.data.total}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Нийт</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center transition-colors">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.data.completed}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Дууссан</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center transition-colors">
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {stats.data.pending}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Хүлээгдэж буй
              </p>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6 space-y-3 transition-colors">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Юу хийх вэ..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <div className="flex gap-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:outline-none transition-colors"
            >
              <option value="Хувийн">🏠 Хувийн</option>
              <option value="Ажил">💼 Ажил</option>
              <option value="Хичээл">📚 Хичээл</option>
            </select>
            <Button onClick={handleAdd}>Нэмэх</Button>
          </div>
        </div>

        <div className="mb-4">
          <SearchBar
            value={search}
            onChange={handleSearchChange}
            placeholder="Даалгавар хайх..."
          />
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          {['Бүгд', 'Хувийн', 'Ажил', 'Хичээл'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-sm border transition ${
                filter === cat
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {isLoading ? (
          <p className="text-center py-8 dark:text-gray-300">Ачаалж байна...</p>
        ) : data?.todos.length === 0 ? (
          <p className="text-center py-8 text-gray-500 dark:text-gray-400">
            {search
              ? 'Хайлтад тохирох todo олдсонгүй'
              : 'Todo байхгүй. Нэмээрэй!'}
          </p>
        ) : (
          <ul className="space-y-2">
            {data?.todos.map((todo) => (
              <li
                key={todo._id}
                className={`bg-white dark:bg-gray-800 p-3 rounded-lg shadow flex items-center gap-3 transition-colors ${
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
                    className={`dark:text-white ${
                      todo.completed
                        ? 'line-through text-gray-500 dark:text-gray-500'
                        : ''
                    }`}
                  >
                    {todo.text}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
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