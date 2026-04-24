import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import HelloWorld from '../components/HelloWorld.vue'
import BinaryTreeView from '../views/BinaryTreeView.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HelloWorld,
  },
  {
    path: '/binary-tree',
    name: 'binary-tree',
    component: BinaryTreeView,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
