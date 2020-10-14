<template>
  <section style="width: 500px; margin: 0 auto;">
    <h2>账号已被冻结，请联系管理员</h2>
  </section>
</template>

<script>
  export default {
    name: "Freeze"
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
