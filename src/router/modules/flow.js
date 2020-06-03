/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const flowRouter = {
  path: '/flow',
  component: Layout,
  redirect: '/flow/flow-job-table',
  name: 'Flow',
  meta: {
    title: '作业',
    icon: 'component'
  },
  children: [
    {
      path: 'flow-job-table',
      component: () => import('@/views/auto-flow-job/flow-job-table'),
      name: 'FlowJobTable',
      meta: { title: '作业管理' }
    },
    {
      path: 'flow-job-step-table',
      component: () => import('@/views/auto-flow-job/flow-job-step-table'),
      name: 'FlowJobStepTable',
      meta: { title: '作业执行对象管理' }
    },
    {
      path: 'flow-job-parameter-table',
      component: () => import('@/views/auto-flow-job/flow-job-parameter-table'),
      name: 'FlowJobParameterTable',
      meta: { title: '作业参数管理' }
    },
    {
      path: 'flow-job-dependency-table',
      component: () => import('@/views/auto-flow-job/flow-job-dependency-table'),
      name: 'FlowJobDependencyTable',
      meta: { title: '作业依赖管理' }
    },
    {
      path: 'flow-job-timewindow-table',
      component: () => import('@/views/auto-flow-job/flow-job-timewindow-table'),
      name: 'FlowJobTimeWindowTable',
      meta: { title: '作业时间窗口管理' }
    },
    {
      path: 'flow-job-stream-table',
      component: () => import('@/views/auto-flow-job/flow-job-stream-table'),
      name: 'FlowJobStreamTable',
      meta: { title: '作业触发管理' }
    }
  ]
}
export default flowRouter
