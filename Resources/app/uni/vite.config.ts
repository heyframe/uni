import {defineConfig, loadEnv} from "vite";
import Uni from '@uni-helper/plugin-uni'
import * as path from "node:path";
import colors from 'picocolors';
import UniManifest from '@uni-helper/vite-plugin-uni-manifest'
import UniComponents from '@uni-helper/vite-plugin-uni-components'
import {NutResolver} from "@heyframe/nutui-uniapp";
import AutoImport from 'unplugin-auto-import/vite'
import UnoCSS from 'unocss/vite'
import UniPages from '@uni-helper/vite-plugin-uni-pages'
import UniLayouts from '@uni-helper/vite-plugin-uni-layouts'
export default defineConfig(({command, mode}) => {
  const isProd = command === 'build';
  const isDev = !isProd;
  const {UNI_PLATFORM, UNI_PLUGIN_NAME} = process.env

  const base = isProd ? `/bundles/${UNI_PLUGIN_NAME}/uni` : undefined;


  console.log(colors.yellow(`UNI_PLATFORM: ${UNI_PLATFORM}`))
  console.log(colors.yellow(`UNI_PLUGIN_NAME: ${UNI_PLUGIN_NAME}`))
  console.log(colors.yellow(`APP_URL: ${process.env.APP_URL}`))


  const env = loadEnv(mode, path.resolve(process.cwd()))
  const {VITE_APP_PORT} = env
  return {
    base,
    plugins: [
      UniPages({
        exclude: ['**/components/**/**.*'],
        dts: 'src/types/uni-pages.d.ts',
        minify: true,
      }),
      UniLayouts(),
      UniManifest(),
      UniComponents({
        deep: true,
        dts: 'src/components.d.ts',
        resolvers: [NutResolver()],
      }),
      UnoCSS(),
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
        dirs: ['src/app/composables', 'src/app/stores'],
        vueTemplate: true,
      }),
      Uni(),
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
      hmr: true,
      host: process.env.HOST ? process.env.HOST : 'localhost',
      port: Number(VITE_APP_PORT) || 9000,
      proxy: isDev ? {
        '/front-api': {
          target: process.env.APP_URL,
          changeOrigin: true,
          secure: false,
        },
      }:undefined,
    },
    build: {
      sourcemap: false,
      target: 'es6',
      minify: mode === 'development' ? false : 'esbuild',
    }
  }
});
