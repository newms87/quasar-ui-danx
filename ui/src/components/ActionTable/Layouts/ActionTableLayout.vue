<template>
  <div class="flex flex-grow flex-col flex-nowrap overflow-hidden h-full">
    <slot name="top" />
    <slot name="toolbar" />
    <div class="flex flex-nowrap flex-grow overflow-hidden w-full">
      <slot name="filters" />
      <slot />
    </div>
  </div>
</template>
