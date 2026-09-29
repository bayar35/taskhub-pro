import { useState } from 'react';
import {
  useCreateRecurringMutation,
  type Frequency,
} from '../features/recurring/recurringApi';
import { Button } from './Button';

interface FormState {
  text: string;
  category: string;
  priority: string;
  frequency: Frequency;
  interval: number;
  daysOfWeek: number[];
  startDate: string;
}

const initialForm: FormState = {
  text: '',
  category: 'Хувийн',
  priority: 'medium',
  frequency: 'daily',
  interval: 1,
  daysOfWeek: [],
  startDate: new Date().toISOString().slice(0, 10),
};

export function RecurringForm({ onSuccess }: { onSuccess?: () => void }) {
  const [createRecurring, { isLoading }] = useCreateRecurringMutation();
  const [form, setForm] = useState<FormState>(initialForm);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createRecurring({
        ...form,
        startDate: new Date(form.startDate).toISOString(),
      }).unwrap();
      onSuccess?.();
    } catch (error) {
      console.error(error);
    }
  };

  const toggleDay = (day: number) => {
    setForm((prev) => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter((d) => d !== day)
        : [...prev.daysOfWeek, day],
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <input
        type="text"
        placeholder="Даалгаврын нэр"
        value={form.text}
        onChange={(e) => setForm({ ...form, text: e.target.value })}
        className="w-full px-3 py-2 border rounded-lg"
        required
      />

      <div className="flex gap-2">
        <select
          value={form.frequency}
          onChange={(e) =>
            setForm({ ...form, frequency: e.target.value as Frequency })
          }
          className="flex-1 px-3 py-2 border rounded-lg"
        >
          <option value="daily">Өдөр бүр</option>
          <option value="weekly">Долоо хоног бүр</option>
          <option value="monthly">Сар бүр</option>
          <option value="yearly">Жил бүр</option>
        </select>

        <input
          type="number"
          min="1"
          value={form.interval}
          onChange={(e) =>
            setForm({ ...form, interval: parseInt(e.target.value) })
          }
          className="w-20 px-3 py-2 border rounded-lg"
        />
      </div>

      {form.frequency === 'weekly' && (
        <div className="flex gap-1">
          {['Ня', 'Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя'].map((day, i) => (
            <button
              key={i}
              type="button"
              onClick={() => toggleDay(i)}
              className={`w-10 h-10 rounded-full text-sm ${
                form.daysOfWeek.includes(i)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      )}

      <input
        type="date"
        value={form.startDate}
        onChange={(e) => setForm({ ...form, startDate: e.target.value })}
        className="w-full px-3 py-2 border rounded-lg"
      />

      <Button type="submit" loading={isLoading} className="w-full">
        Давтамжтай даалгавар үүсгэх
      </Button>
    </form>
  );
}