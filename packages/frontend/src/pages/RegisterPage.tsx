import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { registerSchema, type RegisterInput } from '@taskhub/shared';
import { useRegisterMutation } from '../features/auth/authApi';
import { useAppDispatch } from '../app/hooks';
import { setCredentials } from '../features/auth/authSlice';
import { Button } from '../components/Button';

export default function RegisterPage() {
  const [register, { isLoading }] = useRegisterMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
   try {
      const result: any = await register(data).unwrap();
      
      // Backend response бүтцээс хамаарч:
      // - Хэрэв { data: { user, accessToken } } бол
      // - Хэрэв { user, accessToken } бол
      const payload = result.data ?? result;
      
      dispatch(setCredentials({
        user: payload.user,
        accessToken: payload.accessToken ?? payload.token,
      }));
      
      toast.success('Амжилттай бүртгэгдлээ!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Бүртгэл амжилтгүй');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6 dark:text-white">
          Бүртгүүлэх
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium mb-1 dark:text-gray-200"
            >
              Хэрэглэгчийн нэр
            </label>
            <input
              id="username"
              type="text"
              placeholder="username"
              {...registerField('username')}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.username && (
              <p className="text-red-500 text-xs mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-1 dark:text-gray-200"
            >
              И-мэйл
            </label>
            <input
              id="email"
              type="email"
              placeholder="email@example.com"
              {...registerField('email')}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-1 dark:text-gray-200"
            >
              Нууц үг
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              {...registerField('password')}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            loading={isLoading}
            className="w-full"
            variant="primary"
          >
            Бүртгүүлэх
          </Button>
        </form>

        <p className="text-center text-sm mt-6 dark:text-gray-300">
          Бүртгэлтэй юу?{' '}
          <Link to="/login" className="text-blue-500 hover:underline">
            Нэвтрэх
          </Link>
        </p>
      </div>
    </div>
  );
}