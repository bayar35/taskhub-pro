import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { loginSchema, type LoginInput } from '@taskhub/shared';
import { useLoginMutation } from '../features/auth/authApi';
import { useAppDispatch } from '../app/hooks';
import { setCredentials } from '../features/auth/authSlice';
import { Button } from '../components/Button';

export default function LoginPage() {
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      const result = await login(data).unwrap();
      dispatch(setCredentials(result.data));
      toast.success('Тавтай морил!');
      navigate('/');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Нэвтрэх алдаа');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold text-center mb-2">Нэвтрэх</h1>
        <p className="text-center text-gray-500 mb-6">
          TaskHub Pro-д тавтай морил
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium mb-1"
            >
              Хэрэглэгчийн нэр
            </label>
            <input
              id="username"
              type="text"
              placeholder="Хэрэглэгчийн нэр"
              {...register('username')}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-1"
            >
              Нууц үг
            </label>
            <input
              id="password"
              type="password"
              placeholder="Нууц үг"
              {...register('password')}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button type="submit" loading={isLoading} className="w-full">
            Нэвтрэх
          </Button>
        </form>

        <p className="text-center mt-4 text-sm">
          Бүртгэлгүй юу?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            Бүртгүүлэх
          </Link>
        </p>
      </div>
    </div>
  );
}