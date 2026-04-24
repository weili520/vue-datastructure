<template>
  <main class="home-view">
    <section class="home-view__hero">
      <div class="home-view__copy">
        <p class="home-view__eyebrow">Data structure lab</p>
        <h1>把抽象数据结构变成可操作的动态图形</h1>
        <p class="home-view__intro">
          这个项目用 Vue 展示经典数据结构的核心操作，将插入、删除、搜索和遍历过程拆成可观察的步骤，适合学习、演示和调试算法思路。
        </p>
        <div class="home-view__actions">
          <RouterLink class="home-view__button home-view__button--primary" to="/binary-tree">查看二叉搜索树</RouterLink>
          <RouterLink class="home-view__button" to="/balanced-binary-tree">查看平衡二叉树</RouterLink>
        </div>
      </div>

      <div class="home-view__visual" aria-label="数据结构节点关系示意图">
        <span class="home-view__node home-view__node--root">40</span>
        <span class="home-view__node home-view__node--left">20</span>
        <span class="home-view__node home-view__node--right">60</span>
        <span class="home-view__node home-view__node--leaf-left">10</span>
        <span class="home-view__node home-view__node--leaf-right">30</span>
        <span class="home-view__line home-view__line--left" />
        <span class="home-view__line home-view__line--right" />
        <span class="home-view__line home-view__line--leaf-left" />
        <span class="home-view__line home-view__line--leaf-right" />
      </div>
    </section>

    <section class="home-view__section">
      <div class="home-view__section-head">
        <p class="home-view__eyebrow">Available demos</p>
        <h2>当前可视化模块</h2>
      </div>

      <div class="home-view__cards">
        <RouterLink class="home-view__card" to="/binary-tree">
          <span class="home-view__card-index">01</span>
          <h3>二叉搜索树</h3>
          <p>展示 BST 的插入、删除、搜索与深度优先遍历，突出左右子树的大小关系。</p>
          <span class="home-view__card-link">进入演示</span>
        </RouterLink>

        <RouterLink class="home-view__card home-view__card--accent" to="/balanced-binary-tree">
          <span class="home-view__card-index">02</span>
          <h3>平衡二叉树</h3>
          <p>展示 AVL 树的高度、平衡因子和旋转恢复过程，适合观察失衡后的结构调整。</p>
          <span class="home-view__card-link">进入演示</span>
        </RouterLink>
      </div>
    </section>

    <section class="home-view__features">
      <article>
        <strong>路径高亮</strong>
        <span>操作过程按访问顺序逐步点亮节点。</span>
      </article>
      <article>
        <strong>图形布局</strong>
        <span>节点与连线自动重排，保持树结构清晰。</span>
      </article>
      <article>
        <strong>遍历结果</strong>
        <span>先序、中序、后序遍历同步展示访问序列。</span>
      </article>
    </section>
  </main>
</template>

<style scoped lang="scss">
.home-view {
  min-height: calc(100svh - 58px);
  padding: 36px clamp(16px, 5vw, 80px) 56px;
  background:
    radial-gradient(circle at 78% 8%, rgba(30, 174, 219, 0.16), transparent 30%),
    radial-gradient(circle at 12% 38%, rgba(0, 112, 204, 0.12), transparent 28%),
    linear-gradient(180deg, var(--ps-white), var(--ps-mist));
  text-align: left;

  &__hero {
    display: grid;
    grid-template-columns: minmax(0, 1.05fr) minmax(360px, 0.95fr);
    gap: 40px;
    align-items: stretch;
    border-radius: 32px;
    background: linear-gradient(135deg, #071016, var(--ps-black) 58%, #053a55);
    color: var(--ps-white);
    padding: clamp(28px, 5vw, 56px);
    box-shadow: var(--ps-shadow-80);
    overflow: hidden;
  }

  &__copy {
    display: flex;
    flex-direction: column;
    justify-content: center;
    max-width: 760px;
  }

  &__eyebrow {
    color: var(--ps-blue-dark);
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.14px;
    text-transform: uppercase;
  }

  &__hero &__eyebrow,
  &__intro {
    color: var(--ps-white);
  }

  h1 {
    margin: 12px 0 20px;
    color: var(--ps-white);
    font-size: clamp(40px, 7vw, 76px);
    letter-spacing: -1.6px;
  }

  h2,
  h3 {
    color: var(--ps-charcoal);
  }

  h2 {
    margin: 6px 0 0;
    font-size: clamp(30px, 4vw, 46px);
  }

  h3 {
    margin: 18px 0 12px;
    font-size: 25px;
    font-weight: 500;
  }

  &__intro {
    max-width: 650px;
    font-size: 20px;
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    margin-top: 34px;
  }

  &__button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 48px;
    border: 1px solid rgba(255, 255, 255, 0.32);
    border-radius: 999px;
    color: var(--ps-white);
    padding: 0 22px;
    font-size: 16px;
    font-weight: 700;
    text-decoration: none;
    transition:
      background 180ms ease,
      box-shadow 180ms ease,
      color 180ms ease,
      transform 180ms ease;

    &:hover,
    &:focus-visible {
      outline: 0;
      background: var(--ps-cyan);
      box-shadow: var(--ps-ring);
      transform: translateY(-1px);
    }

    &--primary {
      border-color: var(--ps-blue);
      background: var(--ps-blue);
    }
  }

  &__visual {
    position: relative;
    min-height: 440px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 28px;
    background:
      linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
      rgba(255, 255, 255, 0.06);
    background-size: 30px 30px;
  }

  &__node,
  &__line {
    position: absolute;
    display: block;
  }

  &__node {
    z-index: 1;
    width: 68px;
    height: 68px;
    border: 2px solid rgba(255, 255, 255, 0.72);
    border-radius: 50%;
    background: var(--ps-white);
    color: var(--ps-blue-dark);
    font-size: 20px;
    font-weight: 800;
    line-height: 68px;
    text-align: center;
    box-shadow: 0 16px 30px rgba(0, 0, 0, 0.28);

    &--root {
      top: 54px;
      left: calc(50% - 34px);
      background: var(--ps-cyan);
      color: var(--ps-white);
    }

    &--left {
      top: 178px;
      left: 22%;
    }

    &--right {
      top: 178px;
      right: 22%;
    }

    &--leaf-left {
      top: 314px;
      left: 12%;
    }

    &--leaf-right {
      top: 314px;
      left: 34%;
    }
  }

  &__line {
    height: 2px;
    transform-origin: left center;
    background: rgba(255, 255, 255, 0.42);

    &--left {
      top: 154px;
      left: 40%;
      width: 124px;
      transform: rotate(145deg);
    }

    &--right {
      top: 154px;
      left: 54%;
      width: 124px;
      transform: rotate(35deg);
    }

    &--leaf-left {
      top: 286px;
      left: 26%;
      width: 92px;
      transform: rotate(140deg);
    }

    &--leaf-right {
      top: 286px;
      left: 30%;
      width: 92px;
      transform: rotate(40deg);
    }
  }

  &__section {
    margin-top: 48px;
  }

  &__section-head {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 24px;
    margin-bottom: 22px;
  }

  &__cards {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 22px;
  }

  &__card {
    position: relative;
    min-height: 210px;
    border: 1px solid var(--ps-divider);
    border-radius: 26px;
    background: var(--ps-white);
    color: var(--ps-gray);
    padding: 26px;
    text-decoration: none;
    box-shadow: var(--ps-shadow-06);
    transition:
      border-color 180ms ease,
      box-shadow 180ms ease,
      transform 180ms ease;

    &:hover,
    &:focus-visible {
      outline: 0;
      border-color: var(--ps-blue);
      box-shadow: var(--ps-shadow-16);
      transform: translateY(-3px);
    }

    &--accent {
      background: linear-gradient(180deg, var(--ps-white), rgba(30, 174, 219, 0.08));
    }
  }

  &__card-index {
    color: var(--ps-blue);
    font-weight: 800;
  }

  &__card-link {
    position: absolute;
    right: 26px;
    bottom: 24px;
    color: var(--ps-blue-dark);
    font-size: 15px;
    font-weight: 800;
  }

  &__features {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px;
    margin-top: 24px;

    article {
      border-radius: 20px;
      background: var(--ps-white);
      padding: 20px;
      box-shadow: var(--ps-shadow-06);
    }

    strong,
    span {
      display: block;
    }

    strong {
      color: var(--ps-charcoal);
      font-size: 18px;
    }

    span {
      margin-top: 8px;
      color: var(--ps-gray);
      font-size: 15px;
    }
  }

  @media (max-width: 1024px) {
    &__hero,
    &__cards,
    &__features {
      grid-template-columns: 1fr;
    }

    &__visual {
      min-height: 400px;
    }
  }

  @media (max-width: 640px) {
    padding: 28px 16px 42px;

    &__hero {
      padding: 26px;
    }

    &__visual {
      min-height: 330px;
    }

    &__node {
      width: 56px;
      height: 56px;
      font-size: 17px;
      line-height: 56px;
    }

    &__line {
      display: none;
    }

    &__section-head {
      display: block;
    }
  }
}
</style>
