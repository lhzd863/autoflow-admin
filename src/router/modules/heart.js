/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const heartRouter = {
  path: '/heart',
  component: Layout,
  redirect: '/heart/heart-job-running-table',
  name: 'Heart',
  meta: {
    title: '心跳',
    icon: 'component'
  },
  children: [
    {
      path: 'heart-master-table',
      component: () => import('@/views/auto-heart/heart-master-table'),
      name: 'HeartMasterTable',
      meta: { title: '管理节点' }
    },
    {
      path: 'heart-master-flow-routine-table',
      component: () => import('@/views/auto-heart/heart-master-flow-routine-table'),
      name: 'RoutineTable',
      meta: { title: '管理节点实例线程' }
    },
    {
      path: 'heart-job-running-table',
      component: () => import('@/views/auto-heart/heart-job-running-table'),
      name: 'HeartJobRunningTable',
      meta: { title: '管理节点Running作业' }
    },
    {
      path: 'heart-worker-table',
      component: () => import('@/views/auto-heart/heart-worker-table'),
      name: 'HeartWorkerTable',
      meta: { title: '执行节点' }
    },
    {
      path: 'heart-worker-job-running-table',
      component: () => import('@/views/auto-heart/heart-worker-job-running-table'),
      name: 'HeartWorkerJobRunningTable',
      meta: { title: '执行节点Running作业' }
    }
  ]
}
export default heartRouter
