<template>
  <Transition name="autoHeight">
    <slot />
  </Transition>
</template>

<style lang="scss">
.autoHeight-enter-active,
.autoHeight-leave-active {
	transition: height .3s linear;
	height: calc-size(auto);
}

.autoHeight-enter-to, .autoHeight-leave-from {
	height: calc-size(auto);
}

.autoHeight-enter-from, .autoHeight-leave-to {
	height: 0;
}
</style>
