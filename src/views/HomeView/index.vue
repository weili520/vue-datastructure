<template>
  <main class="view">
    <section class="view__hero">
      <div class="view__copy">
        <p class="view__eyebrow">Data structure lab</p>
        <h1>把抽象数据结构变成可操作的动态图形</h1>
        <p class="view__intro">
          这个项目用 Vue 展示经典数据结构的核心操作，将插入、删除、搜索和遍历过程拆成可观察的步骤，适合学习、演示和调试算法思路。
        </p>
      </div>

      <div class="view__visual" aria-label="数据结构节点关系示意图">
        <span class="view__node view__node--root">40</span>
        <span class="view__node view__node--left">20</span>
        <span class="view__node view__node--right">60</span>
        <span class="view__node view__node--leaf-left">10</span>
        <span class="view__node view__node--leaf-right">30</span>
        <span class="view__line view__line--left" />
        <span class="view__line view__line--right" />
        <span class="view__line view__line--leaf-left" />
        <span class="view__line view__line--leaf-right" />
      </div>
    </section>

    <section class="view__section">
      <div class="view__section-head">
        <p class="view__eyebrow">Available demos</p>
        <h2>当前可视化模块</h2>
      </div>

      <div class="view__cards">
         <RouterLink class="view__card view__card--algorithm" to="/sorting">
          <span class="view__card-index">01</span>
          <h3>排序算法</h3>
          <p>展示冒泡、快排、归并、堆排序等经典算法的比较、交换、分区和合并过程。</p>
          <span class="view__card-link">进入演示</span>
        </RouterLink>

        <RouterLink class="view__card" to="/binary-tree">
          <span class="view__card-index">02</span>
          <h3>二叉搜索树</h3>
          <p>展示 BST 的插入、删除、搜索与深度优先遍历，突出左右子树的大小关系。</p>
          <span class="view__card-link">进入演示</span>
        </RouterLink>

        <RouterLink class="view__card view__card--accent" to="/balanced-binary-tree">
          <span class="view__card-index">03</span>
          <h3>平衡二叉树</h3>
          <p>展示 AVL 树的高度、平衡因子和旋转恢复过程，适合观察失衡后的结构调整。</p>
          <span class="view__card-link">进入演示</span>
        </RouterLink>

        <RouterLink class="view__card" to="/red-black-tree">
          <span class="view__card-index">04</span>
          <h3>红黑树</h3>
          <p>展示红黑树的插入、删除、搜索、变色旋转与深度优先遍历过程。</p>
          <span class="view__card-link">进入演示</span>
        </RouterLink>
      </div>
    </section>

    <section class="view__features">
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

<style scoped lang="scss" src="./index.scss"></style>
