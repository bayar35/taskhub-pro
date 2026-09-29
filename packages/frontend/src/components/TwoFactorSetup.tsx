import { useState } from 'react';
import {
  useSetupTwoFactorMutation,
  useVerifyTwoFactorMutation,
} from '../features/auth/authApi';
import { Button } from './Button';

export function TwoFactorSetup() {
  const [setup, { data }] = useSetupTwoFactorMutation();
  const [verify, { isLoading }] = useVerifyTwoFactorMutation();
  const [token, setToken] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const handleSetup = async () => {
    try {
      await setup().unwrap();
    } catch (error) {
      console.error(error);
    }
  };

  const handleVerify = async () => {
    try {
      const result = await verify({ token }).unwrap();
      setBackupCodes(result.data.backupCodes);
    } catch (error) {
      console.error(error);
    }
  };

  if (backupCodes.length > 0) {
    return (
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <h3 className="font-bold mb-2">⚠️ Backup Codes</h3>
        <p className="text-sm mb-3">
          Эдгээр кодыг аюулгүй газар хадгалаарай. 2FA-г алдсан тохиолдолд
          ашиглана.
        </p>
        <div className="grid grid-cols-2 gap-2 font-mono text-sm">
          {backupCodes.map((code, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 p-2 rounded"
            >
              {code}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data) {
    return (
      <div className="space-y-4">
        <p className="text-sm">
          Google Authenticator эсвэл Authy апп-аар QR кодыг скан хийгээрэй.
        </p>
        <img src={data.data.qrCode} alt="QR Code" className="mx-auto" />
        <p className="text-xs text-center text-gray-500">
          Secret: {data.data.secret}
        </p>
        <input
          type="text"
          placeholder="6 оронтой код"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          maxLength={6}
          className="w-full px-3 py-2 border rounded-lg text-center text-2xl tracking-widest"
        />
        <Button
          onClick={handleVerify}
          loading={isLoading}
          className="w-full"
        >
          Баталгаажуулах
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={handleSetup} className="w-full">
      2FA идэвхжүүлэх
    </Button>
  );
}