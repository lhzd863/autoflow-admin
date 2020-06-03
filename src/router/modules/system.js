/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const systemRouter = {
  path: '/system',
  component: Layout,
  redirect: '/system/server-table',
  name: 'System',
  meta: {
    title: '系统',
    icon: 'component'
  },
  children: [
    {
      path: 'server-table',
      component: () => import('@/views/auto-system/server-table'),
      name: 'ServerTable',
      meta: { title: '运行实例管理' }
    },
    {
      path: 'jobpool-table',
      component: () => import('@/views/auto-system/jobpool-table'),
      name: 'JobPoolTable',
      meta: { title: '作业执行节点分配池' }
    },
    {
      path: 'system-parameter-table',
      component: () => import('@/views/auto-system/system-parameter-table'),
      name: 'ParameterTable',
      meta: { title: '系统参数' }
    },
    {
      path: 'system-ring-table',
      component: () => import('@/views/auto-system/system-ring-table'),
      name: 'RingTable',
      meta: { title: 'Ring列表' }
    },
    {
      path: 'system-test',
      component: () => import('@/views/auto-system/system-test-table'),
      name: 'Test',
      meta: { title: 'Test' }
    }
  ]
}
export default systemRouter
