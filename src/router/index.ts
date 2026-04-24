import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import HomeView from '../views/HomeView/index.vue'
import SortingView from '../views/SortingView/index.vue'
import BinaryTreeView from '../views/BinaryTreeView.vue'
import BalancedBinaryTreeView from '../views/BalancedBinaryTreeView.vue'
import RedBlackTreeView from '../views/RedBlackTreeView/index.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/binary-tree',
    name: 'binary-tree',
    component: BinaryTreeView,
  },
  {
    path: '/balanced-binary-tree',
    name: 'balanced-binary-tree',
    component: BalancedBinaryTreeView,
  },
  {
    path: '/red-black-tree',
    name: 'red-black-tree',
    component: RedBlackTreeView,
  },
  {
    path: '/sorting',
    name: 'sorting',
    component: SortingView,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
