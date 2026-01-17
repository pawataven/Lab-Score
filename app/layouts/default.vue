<script setup lang="ts">
import NavigationBarVue from '~/layouts/NavigationBar.vue';

</script>

<template>
  <div>
    <header class="sticky z-50 w-full bg-white/95 backdrop-blur border-b border-slate-200">
      <NavigationBarVue />
    </header>

    <main>
      <slot />
      
    </main>
  </div>
</template>