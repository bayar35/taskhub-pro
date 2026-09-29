import { useState } from 'react';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { mn } from 'date-fns/locale';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import type { View, Event } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useGetTodosQuery } from '../features/todo/todoApi';

const locales = { mn };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarEvent extends Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  resource: {
    completed: boolean;
    priority: string;
  };
}

export function CalendarView() {
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());
  const { data } = useGetTodosQuery({});

  const events: CalendarEvent[] = (data?.todos || [])
    .filter((t) => t.dueDate)
    .map((todo) => ({
      id: todo._id,
      title: todo.text,
      start: new Date(todo.dueDate!),
      end: new Date(todo.dueDate!),
      allDay: true,
      resource: {
        completed: todo.completed,
        priority: todo.priority,
      },
    }));

  return (
    <div className="h-[600px] bg-white dark:bg-gray-800 p-4 rounded-lg">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        view={view}
        date={date}
        onView={setView}
        onNavigate={setDate}
        culture="mn"
        messages={{
          today: 'Өнөөдөр',
          previous: 'Өмнөх',
          next: 'Дараах',
          month: 'Сар',
          week: 'Долоо хоног',
          day: 'Өдөр',
          agenda: 'Хөтөлбөр',
          date: 'Огноо',
          time: 'Цаг',
          event: 'Үйл явдал',
          noEventsInRange: 'Энэ хугацаанд үйл явдал байхгүй',
        }}
        eventPropGetter={(event: CalendarEvent) => ({
          style: {
            backgroundColor: event.resource.completed
              ? '#10b981'
              : event.resource.priority === 'high'
              ? '#ef4444'
              : '#3b82f6',
            borderRadius: '4px',
            border: 'none',
            color: 'white',
          },
        })}
      />
    </div>
  );
}