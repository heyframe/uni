<template>
  <view class="content">
    <view class="text-area">
      <text class="bg-amber">{{ userInfo?.nickname }}</text>
    </view>
    <view class="product-list">
      <view
        class="product-item"
        v-for="product in products"
        :key="product.id"
      >
        <image
          class="product-cover"
          :src="product.cover?.media?.url || '/static/logo.png'"
        />
        <text class="product-name">{{ product.name }}</text>
        <text class="product-price">¥{{ product.calculatedPrice?.unitPrice || 0 }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useUser } from "@/app/composables/useUser/useUser";
import {useListing} from "@/app/composables/useListing/useListing";
import {definePage} from "@uni-helper/vite-plugin-uni-pages";

definePage({
  type: 'home',
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '首页',
  },
})

const userComposable = useUser();
const userInfo = ref<any>(null);
const products = ref<any[]>([]);

const { search, getElements } = useListing({
  listingType: "categoryListing",
  categoryId: "01998723f6187075b5cb80b9f517037a", // entrypoint to browse
  defaultSearchCriteria: { // set the default criteria
    limit: 4,
    p: 1,
  },
});

onMounted(async () => {
  // 登录用户
  await userComposable.login({ username: 'test@test.com', password: 'heyframe' });
  userInfo.value = userComposable.user.value;

  await search({ // invoke search() method
    includes: { // omit this parameter if you want to use the whole product entity
      product: ["id", "name", "cover", "calculatedPrice", "translated"],
      product_media: ["media"],
      media: ["url", "thumbnails"],
    },
  });

  products.value = getElements.value.slice(0, 4);
});
</script>

<style>
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.logo {
  height: 200rpx;
  width: 200rpx;
  margin-top: 200rpx;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 50rpx;
}

.text-area {
  display: flex;
  justify-content: center;
}

.title {
  font-size: 36rpx;
  color: #8f8f94;
}

.product-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 30rpx;
}

.product-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20rpx;
}

.product-cover {
  width: 150rpx;
  height: 150rpx;
  margin-bottom: 10rpx;
}

.product-name {
  font-size: 28rpx;
  color: #333;
}

.product-price {
  font-size: 28rpx;
  color: #ff5722;
}
</style>
