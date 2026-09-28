import { useState, useRef, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
} from '../features/notification/notificationApi';
import {
  setNotifications,
  markAsRead,
  markAllAsRead,
  removeNotification,
} from '../features/notification/notificationSlice';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);  // ⬅️ НЭМЭХ

  const dispatch = useAppDispatch();
  const { items, unreadCount } = useAppSelector((s) => s.notifications);

  const { data } = useGetNotificationsQuery({});
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead] = useMarkAllNotificationsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  // ⬇️ ЗАССАН: зөвхөн нэг удаа setNotifications дуудах
  useEffect(() => {
    if (data && !hasInitialized.current) {
      dispatch(setNotifications(data.notifications));
      hasInitialized.current = true;
    }
  }, [data, dispatch]);

  // Гадна дарахад хаах
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = async (id: string) => {
    await markRead(id);
    dispatch(markAsRead(id));
  };

  const handleMarkAllRead = async () => {
    await markAllRead();
    dispatch(markAllAsRead());
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
    dispatch(removeNotification(id));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        aria-label="Мэдэгдэл"
        type="button"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold dark:text-white">Мэдэгдэл</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Бүгдийг уншсан
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8 text-sm">
              Мэдэгдэл байхгүй
            </p>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {items.slice(0, 10).map((n) => (
                <li
                  key={n._id}
                  className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
                    !n.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm dark:text-white">
                        {n.title}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {n.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(n.createdAt).toLocaleString('mn-MN')}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      {!n.read && (
                        <button
                          onClick={() => handleMarkRead(n._id)}
                          className="text-xs text-blue-600 hover:underline"
                          aria-label="Уншсан"
                        >
                          ✓
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(n._id)}
                        className="text-xs text-red-500 hover:underline"
                        aria-label="Устгах"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}