/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const imageRouter = {
  path: '/image',
  component: Layout,
  redirect: '/image/image-table',
  name: 'Image',
  meta: {
    title: '实例',
    icon: 'table'
  },
  children: [
    {
      path: 'image-table',
      component: () => import('@/views/auto-image/image-table'),
      name: 'ImageTable',
      meta: { title: '镜像管理' }
    },
    {
      path: 'instance-table',
      component: () => import('@/views/auto-image/instance-table'),
      name: 'InstanceTable',
      meta: { title: '实例管理' }
    },
    {
      path: 'flow-parameter-table',
      component: () => import('@/views/auto-image/flow-parameter-table'),
      name: 'FlowParameterTable',
      meta: { title: '实例参数' }
    }
  ]
}
export default imageRouter
