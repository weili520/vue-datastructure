# Vue Data Structure

[中文](#中文) | [English](#english)

## 中文

Vue Data Structure 是一个基于 Vue 3、TypeScript 和 Vite 构建的数据结构与算法可视化项目。项目将常见算法和树结构的操作过程图形化，帮助用户观察插入、删除、搜索、遍历、旋转和平衡调整等步骤。

> 本项目 README 及项目内容由 Claude Code 辅助生成。

### 功能特性

- 排序算法可视化：展示排序过程中的元素比较、交换和阶段变化。
- 二叉搜索树可视化：支持节点插入、搜索、删除和结构展示。
- 平衡二叉搜索树可视化：展示 AVL 风格的高度维护、旋转和平衡过程。
- 红黑树可视化：展示红黑树插入、删除、颜色调整和旋转修复过程。
- 多页面导航：通过 Vue Router 在首页、排序、二叉树、平衡二叉树和红黑树页面之间切换。

### 技术栈

- Vue 3
- TypeScript
- Vue Router
- Vite
- Sass

### 项目结构

```text
src/
  class/                         数据结构与算法实现
    SortingAlgorithms.ts
    BinarySearchTree.ts
    BalancedBinarySearchTree.ts
    RedBlackTree.ts
  components/                    通用展示组件
  router/                        页面路由配置
  views/                         可视化页面
    HomeView/
    SortingView/
    BinaryTreeView.vue
    BalancedBinaryTreeView.vue
    RedBlackTreeView/
```

### 本地开发

安装依赖：

```bash
npm install
```

启动开发服务器：

```bash
npm run dev
```

构建生产版本：

```bash
npm run build
```

本地预览构建结果：

```bash
npm run preview
```

### 适用场景

- 数据结构课程学习与演示
- 算法执行过程拆解
- 树结构插入、删除、旋转和平衡逻辑调试
- 前端图形化算法实验

## English

Vue Data Structure is a data structure and algorithm visualization project built with Vue 3, TypeScript, and Vite. It turns common algorithms and tree operations into interactive visual flows so users can observe insertion, deletion, search, traversal, rotation, and balancing steps.

> This project README and project content were generated with assistance from Claude Code.

### Features

- Sorting algorithm visualization: shows comparisons, swaps, and step-by-step state changes.
- Binary search tree visualization: supports node insertion, search, deletion, and structural display.
- Balanced binary search tree visualization: demonstrates AVL-style height maintenance, rotations, and balancing.
- Red-black tree visualization: demonstrates insertion, deletion, color adjustment, and rotation repair logic.
- Multi-page navigation: uses Vue Router to switch between Home, Sorting, Binary Tree, Balanced Binary Tree, and Red-Black Tree pages.

### Tech Stack

- Vue 3
- TypeScript
- Vue Router
- Vite
- Sass

### Project Structure

```text
src/
  class/                         Data structure and algorithm implementations
    SortingAlgorithms.ts
    BinarySearchTree.ts
    BalancedBinarySearchTree.ts
    RedBlackTree.ts
  components/                    Shared display components
  router/                        Route configuration
  views/                         Visualization pages
    HomeView/
    SortingView/
    BinaryTreeView.vue
    BalancedBinaryTreeView.vue
    RedBlackTreeView/
```

### Local Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

### Use Cases

- Learning and teaching data structures
- Breaking down algorithm execution flows
- Debugging tree insertion, deletion, rotation, and balancing logic
- Frontend-based algorithm visualization experiments
