import type { UserConfig, ConfigEnv } from 'vite'
import path from 'node:path'
import process from 'node:process'
import { defineConfig, loadEnv } from 'vite'
import UniPages from '@uni-helper/vite-plugin-uni-pages'

export default async ({ command, mode }: ConfigEnv): Promise<UserConfig> => {
  // 动态导入插件
  const uniModule = await import('@dcloudio/vite-plugin-uni')
  const Uni = uniModule.default.default || uniModule.default
  
  const env = loadEnv(mode, path.resolve(process.cwd(), 'env'))
  const { VITE_APP_PORT = '5173' } = env

  return defineConfig({
    envDir: './env',
    plugins: [
      UniPages(),
      Uni(),
    ],
    resolve: {
      alias: {
        '@': path.join(process.cwd(), './src'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: Number.parseInt(VITE_APP_PORT, 10),
    },
    build: {
      target: 'es6',
      minify: 'esbuild',
    },
  })
}
