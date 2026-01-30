<template>
  <v-app>
    <v-layout>
      <!-- SOL MENÜ -->
      <v-navigation-drawer expand-on-hover permanent rail>
        <v-list nav density="compact">
          <v-list-item title="Görevlerim" to="/my-files" router />
          <v-list-item title="Günlük Hayat " to="/shared" router />
          <v-list-item title="CoreX Holding" to="/starred" router />
        </v-list>
      </v-navigation-drawer>

      <!-- ORTA ALAN -->
      <v-main class="pa-4">
        <router-view />
      </v-main>
    </v-layout>
  </v-app>
  
</template>

<script>
  
export default {
  name: 'App'
}
</script>
<style>

</style>
