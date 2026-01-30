<template>
  <div class="task">
    <div v-if="task">
        <p>aaaa</p>
  <h3>{{ task.title }}</h3>
</div>

    <div v-if="task">
  <h3>{{ task.detail }}</h3>
</div>

  </div>>
</template>

<script>
export default {
 props:['task']
}
</script>

<style>

</style>