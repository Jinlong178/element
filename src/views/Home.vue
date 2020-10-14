<template>
  <section>
    <p style="padding: 20px;">
      欢迎登录，<b>{{ user.name }}</b>！<br>
    </p>
  </section>
</template>

<script>
  import {mapState} from 'vuex'

  export default {
    name: 'Home',
    data() {
      return {
        count: 0,
      }
    },
    computed: {
      ...mapState({
        user: state => state.userDetail,
      }),
    },
  }
</script>

<style scoped>

</style>
