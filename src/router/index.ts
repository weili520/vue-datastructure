import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import BinaryTreeView from '../views/BinaryTreeView.vue'
import BalancedBinaryTreeView from '../views/BalancedBinaryTreeView.vue'

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
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
