import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Тестүүд дотор describe, it, expect зэргийг import хийхгүйгээр ашиглах боломжтой болгоно
    globals: true,
    
    // Тестийн орчин (Node.js дээр ажиллана)
    environment: 'node',
    
    // beforeAll, afterAll зэрэг hook-уудын хүлээх хугацаа (2 минут)
    hookTimeout: 120000,
    
    // Нэг тест хамгийн ихдээ 60 секунд ажиллана
    testTimeout: 60000,
    
    // Файлуудыг зэрэгцээд биш, дарааллаар нь ажиллуулна (Database давхцалаас сэргийлнэ)
    fileParallelism: false,
    
    // Тестүүдийг тусдаа процесс (fork) дээр ажиллуулна
    pool: 'forks',
    
    // Зөвхөн нэг процесс ашиглана (бүх тест нэг дор, дарааллаар)
    poolOptions: {
      forks: { singleFork: true },
    },
  },
});