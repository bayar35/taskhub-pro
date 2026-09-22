import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { registerSchema, type RegisterInput } from '@taskhub/shared';
import { useRegisterMutation } from '../features/auth/authApi';
import { Button } from '../components/Button';

export default function RegisterPage() {
  const [registerUser, { isLoading }] = useRegisterMutation();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    try {
      await registerUser(data).unwrap();
      toast.success('Амжилттай бүртгэгдлээ!');
      navigate('/login');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Бүртгүүлэх алдаа');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold text-center mb-2">Бүртгүүлэх</h1>
        <p className="text-center text-gray-500 mb-6">
          Шинэ хэрэглэгч үүсгэх
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Хэрэглэгчийн нэр
            </label>
            <input
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
            <label className="block text-sm font-medium mb-1">Нууц үг</label>
            <input
              type="password"
              {...register('password')}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Дор хаяж 8 тэмдэгт, том үсэг, тоо, тусгай тэмдэгт
            </p>
          </div>

          <Button type="submit" loading={isLoading} className="w-full">
            Бүртгүүлэх
          </Button>
        </form>

        <p className="text-center mt-4 text-sm">
          Бүртгэлтэй юу?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Нэвтрэх
          </Link>
        </p>
      </div>
    </div>
  );
}