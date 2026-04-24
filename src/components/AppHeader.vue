<template>
  <header class="app-header">
    <RouterLink class="app-header__logo" to="/" aria-label="返回首页">
      <span class="app-header__logo-mark">
        <span class="app-header__logo-node app-header__logo-node--root" />
        <span class="app-header__logo-node app-header__logo-node--left" />
        <span class="app-header__logo-node app-header__logo-node--right" />
        <span class="app-header__logo-branch app-header__logo-branch--left" />
        <span class="app-header__logo-branch app-header__logo-branch--right" />
      </span>
      <span class="app-header__logo-text">Vue DS</span>
    </RouterLink>

    <nav class="app-header__nav" aria-label="主导航">
      <RouterLink to="/sorting">排序算法</RouterLink>
      <RouterLink to="/binary-tree">二叉树</RouterLink>
      <RouterLink to="/balanced-binary-tree">平衡二叉树</RouterLink>
    </nav>
  </header>
</template>

<style scoped lang="scss">
.app-header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 24px;
  padding: 14px clamp(18px, 4vw, 48px);
  background: var(--ps-black);

  &__logo {
    display: inline-flex;
    align-items: center;
    justify-self: start;
    gap: 10px;
    width: fit-content;
    border-radius: 36px;
    color: var(--ps-white);
    padding: 8px 14px;
    text-decoration: none;
    transition:
      color 180ms ease,
      background 180ms ease;

    &:hover,
    &:focus-visible {
      outline: 0;
      background: rgba(255, 255, 255, 0.08);
      color: var(--ps-link-hover);
    }
  }

  &__logo-mark {
    position: relative;
    width: 36px;
    height: 30px;
  }

  &__logo-node,
  &__logo-branch {
    position: absolute;
    display: block;
  }

  &__logo-node {
    z-index: 1;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--ps-white);
    box-shadow: 0 0 0 2px rgba(30, 174, 219, 0.25);

    &--root {
      top: 0;
      left: 13px;
      background: var(--ps-cyan);
    }

    &--left {
      bottom: 1px;
      left: 2px;
    }

    &--right {
      right: 2px;
      bottom: 1px;
    }
  }

  &__logo-branch {
    top: 14px;
    left: 16px;
    width: 18px;
    height: 2px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.7);
    transform-origin: left center;

    &--left {
      transform: rotate(135deg);
    }

    &--right {
      transform: rotate(45deg);
    }
  }

  &__logo-text {
    color: var(--ps-white);
    font-size: 16px;
    font-weight: 800;
    letter-spacing: 0.2px;
  }

  &__nav {
    display: flex;
    justify-content: center;
    gap: 24px;

    a {
      position: relative;
      border-radius: 36px;
      color: var(--ps-white);
      padding: 8px 14px;
      font-size: 15px;
      font-weight: 500;
      text-decoration: none;
      transition: color 180ms ease;

      &:hover {
        color: var(--ps-link-hover);
      }

      &.router-link-active::after {
        position: absolute;
        right: 14px;
        bottom: 3px;
        left: 14px;
        height: 2px;
        border-radius: 999px;
        background: var(--ps-blue);
        content: '';
      }
    }
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    justify-items: center;
    gap: 10px;

    &__logo {
      justify-self: center;
    }

    &__nav {
      gap: 10px;
    }
  }
}
</style>
