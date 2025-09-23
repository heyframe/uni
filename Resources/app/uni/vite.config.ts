import {defineConfig, loadEnv} from "vite";
import Uni from '@uni-helper/plugin-uni'
import * as path from "node:path";
import colors from 'picocolors';
import UniManifest from './vite/vite-plugins/uni-manifest-plugin'
import UniComponents from '@uni-helper/vite-plugin-uni-components'
import {NutResolver} from "@heyframe/nutui-uniapp";
import AutoImport from 'unplugin-auto-import/vite'
import UnoCSS from 'unocss/vite'
import ViteRestart from 'vite-plugin-restart'

export default defineConfig(({command, mode}) => {
  const isProd = command === 'build';
  const isDev = !isProd;
  const base = isProd ? '/bundles/uni/uni' : undefined;

  const {UNI_PLATFORM} = process.env
  console.log(colors.yellow(`UNI_PLATFORM: ${UNI_PLATFORM}`))

  const env = loadEnv(mode, path.resolve(process.cwd()))
  const {VITE_APP_PORT,} = env
  return {
    base,
    plugins: [
      UniManifest(),
      UniComponents({
        deep: true,
        dts: 'src/components.d.ts',
        resolvers: [NutResolver()],
      }),
      AutoImport({
        imports: [
          'vue',
          'pinia',
          'uni-app',
          {
            '@heyframe/nutui-uniapp/composables': [
              'useNotify',
              'useToast',
            ],
          },
        ],
        dts: 'src/auto-imports.d.ts',
        dirs: ['src/composables', 'src/stores'],
        vueTemplate: true,
      }),
      ViteRestart({
        restart: ['vite.config.js'],
      }),
      Uni(),
      UnoCSS(),
    ],
    resolve: {
      alias: {
        '@': path.join(process.cwd(), './src'),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@import "@heyframe/nutui-uniapp/styles/variables";',
        },
      },
    },
    server: {
      host: process.env.HOST ? process.env.HOST : 'localhost',
      port: Number(VITE_APP_PORT) || 9000,
    },
    build: {
      sourcemap: false,
      target: 'es6',
      minify: mode === 'development' ? false : 'esbuild',
    }
  }
});
