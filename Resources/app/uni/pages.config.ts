import { isH5 } from '@uni-helper/uni-env'
import { defineUniPages } from '@uni-helper/vite-plugin-uni-pages'

export default defineUniPages({
  globalStyle: {
    navigationBarBackgroundColor: '@navBgColor',
    navigationBarTextStyle: '@navTxtStyle',
    navigationBarTitleText: 'NutUi',
    backgroundColor: '@bgColor',
    backgroundTextStyle: '@bgTxtStyle',
    backgroundColorTop: '@bgColorTop',
    backgroundColorBottom: '@bgColorBottom',
  },
  // tabbar 的配置统一在 “./src/tabbar/config.ts” 文件中
  // 无tabbar模式下，h5 设置为 {} 为了防止浏览器报错导致白屏
  // tabBar: (isH5 ? {} : undefined) as any,
})
