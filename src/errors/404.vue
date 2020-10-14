<template>
  <section style="width: 500px; margin: 0 auto;">
    <h2>404 页面找不到</h2>
    <p><a class="back" @click="$router.go(-1)">点击返回前一页</a></p>
  </section>
</template>

<script>
  export default {
    name: "NotFount"
  }
</script>

<style lang="less" scoped>
  a.back {
    text-decoration: underline;

    &:hover {
      color: red;
      cursor: pointer;
    }
  }
</style>
