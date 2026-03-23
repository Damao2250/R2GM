import { defineUniPages } from '@uni-helper/vite-plugin-uni-pages'

export default defineUniPages({
  globalStyle: {
    navigationBarTextStyle: 'black',
    navigationBarTitleText: 'G2DM',
    navigationBarBackgroundColor: '#F8F8F8',
    backgroundColor: '#F8F8F8',
  },
  easycom: {
    autoscan: true,
    custom: {
      '^wd-(.*)': 'wot-design-uni/components/wd-$1/wd-$1.vue',
    },
  },
  subPackages: [
    {
      root: 'pkg-health',
      pages: [],
    },
    {
      root: 'pkg-device',
      pages: [],
    },
  ],
})
