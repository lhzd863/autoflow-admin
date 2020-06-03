<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="tableQuery.title" placeholder="Title" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        Search
      </el-button>
    </div>
    <el-row :gutter="8">
      <el-col :xs="{span: 24}" :sm="{span: 24}" :md="{span: 24}" :lg="{span: 24}" :xl="{span: 24}" style="padding-right:8px;margin-bottom:30px;">
        <el-table
          :key="tableKey"
          v-loading="listLoading"
          :data="tableQuery.pageData"
          border
          fit
          highlight-current-row
          style="width: 100%;"
          @sort-change="sortChange"
        >
          <el-table-column label="Id" min-width="300px">
            <template slot-scope="{row}">
              <span>{{ row.id }}</span>
            </template>
          </el-table-column>
          <el-table-column label="Sys" min-width="80px">
            <template slot-scope="{row}">
              <span>{{ row.sys }}</span>
            </template>
          </el-table-column>
          <el-table-column label="Job" min-width="300px">
            <template slot-scope="{row}">
              <span>{{ row.job }}</span>
            </template>
          </el-table-column>
          <el-table-column label="Ip" min-width="120px">
            <template slot-scope="{row}">
              <span>{{ row.ip }}</span>
            </template>
          </el-table-column>
          <el-table-column label="Port" min-width="80px">
            <template slot-scope="{row}">
              <span>{{ row.port }}</span>
            </template>
          </el-table-column>
          <el-table-column label="StartTime" min-width="180px">
            <template slot-scope="{row}">
              <span>{{ row.starttime }}</span>
            </template>
          </el-table-column>
          <el-table-column label="UpdateTime" min-width="180px">
            <template slot-scope="{row}">
              <span>{{ row.updatetime }}</span>
            </template>
          </el-table-column>
          <el-table-column label="Duration" max-width="80px">
            <template slot-scope="{row}">
              <span>{{ row.duration }}</span>
            </template>
          </el-table-column>
          <el-table-column label="Actions" align="center" width="200" class-name="small-padding fixed-width">
            <template slot-scope="{row,$index}">
              <el-button size="mini" type="danger" @click="handleDelete(row,$index)">
                Delete
              </el-button>
              <el-button size="mini" type="danger" @click="handleStop(row,$index)">
                Stop
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <pagination v-show="tableQuery.total>0" :total="tableQuery.total" :layout="tableQuery.layout" :page.sync="tableQuery.pageIndex" :limit.sync="tableQuery.pageLimit" :hidden="tableQuery.hidden" :page-sizes="tableQuery.pageSizes" @pagination="getList" />
      </el-col>
    </el-row>

  </div>
</template>

<script>
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import defaultConfig from '@/config'

const { global_system_accesstoken, global_system_data_url, global_system_storage_key } = defaultConfig

export default {
  name: 'HeartWorkerJobRunningTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      tableKey: 0,
      listLoading: true,
      tableQuery: {
        title: '',
        sort: '+imageid',
        total: 0,
        srcData: null,
        pageSizes: [10],
        pageIndex: 1,
        pageData: null,
        pageLimit: 10,
        hidden: false,
        layout: 'total, prev, pager, next, jumper'
      },
      sortOptions: [{ label: 'ID Ascending', key: '+imageid' }, { label: 'ID Descending', key: '-imageid' }],
      enableOptions: [{ label: 'Enable', key: '1' }, { label: 'Disable', key: '0' }],
      temp: {
        id: '',
        workid: '',
        ip: '',
        port: '',
        sys: '',
        job: '',
        starttime: '',
        updatetime: '',
        duration: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create',
        add: 'Routine Add',
        sub: 'Routine Sub'
      },
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      },
      flowid: '',
      processnum: ''
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      let accesstoken = ''
      if (JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0] === undefined || JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0].username === undefined) {
        accesstoken = global_system_accesstoken
      } else {
        accesstoken = JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0].accesstoken
      }
      const url = global_system_data_url + '/worker/routine/job/running/heart/ls?accesstoken=' + accesstoken
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8'
        },
        body: JSON.stringify({
        })
      })
        .then(response => response.json())
        .then((responsedata) => {
          this.listLoading = false
          if (responsedata.status_code !== 200) {
            this.$notify({
              title: 'Error',
              message: responsedata.status_txt,
              type: 'error',
              duration: 2000
            })
            return
          }
          this.tableQuery.srcData = responsedata.data
          this.tableQuery.total = (responsedata.data).length
          this.tableQuery.pageSizes = []
          for (var i = 1; i <= this.tableQuery.total / 10 + 1; i++) {
            this.tableQuery.pageSizes.push(i * 10)
          }
          this.tableQuery.pageData = this.tableQuery.srcData.slice((this.tableQuery.pageIndex - 1) * this.tableQuery.pageLimit, (this.tableQuery.pageIndex) * this.tableQuery.pageLimit)
        })
        .catch(function(err) {
          console.log(err)
          this.listLoading = false
        })
    },
    handleFilter() {
      this.getList()
      if ((this.tableQuery.title).length === 0) {
        return
      }
      this.tableQuery.pageIndex = 1
      var t_data = this.tableQuery.srcData
      this.tableQuery.pageData = []
      var j = 0
      for (var k = 0; k < (t_data).length; k++) {
        var t_dat = t_data[k]
        for (var t_key in t_dat) {
          if (t_dat[t_key] === null) {
            continue
          }
          if (String(t_dat[t_key]).indexOf(this.tableQuery.title) !== -1) {
            this.tableQuery.pageData[j] = t_data[k]
            j++
            break
          }
        }
      }
      this.tableQuery.total = (this.tableQuery.pageData).length
      this.tableQuery.pageSizes = []
      for (var i = 1; i <= this.tableQuery.total / 10 + 1; i++) {
        this.tableQuery.pageSizes.push(i * 10)
      }
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'mstid') {
        this.sortByMstId(order, 'mstid')
      }
    },
    sortByMstId(order, key) {
      if (order === null) {
        this.tableQuery.sort = this.tableQuery.sort === `+${key}` ? `-${key}` : `+${key}`
      } else if (order === 'ascending') {
        this.tableQuery.sort = `+${key}`
      } else {
        this.tableQuery.sort = `-${key}`
      }
      if (this.tableQuery.sort === `+${key}`) {
        this.tableQuery.pageData = this.tableQuery.pageData.sort((a, b) => (a.length === b.length) ? b.mstid.localeCompare(a.mstid) : (b.mstid - a.mstid))
      } else {
        this.tableQuery.pageData = this.tableQuery.pageData.sort((a, b) => (a.length === b.length) ? a.mstid.localeCompare(b.mstid) : (a.mstid - b.mstid))
      }
    },
    resetTemp() {
      this.temp = {
        id: '',
        workerid: '',
        ip: '',
        port: '',
        sys: '',
        job: '',
        starttime: '',
        updatetime: '',
        duration: ''
      }
    },
    handleDelete(row, index) {
      this.$confirm('Confirm to stop instance?', 'Warning', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      })
        .then(async() => {
          this.deleteData(row, index)
        })
        .catch(err => { console.error(err) })
    },
    handleStop(row, index) {
      this.temp = Object.assign({}, row)
      this.$confirm('Confirm to stop instance?', 'Warning', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      })
        .then(async() => {
          this.stopRoutineData()
        })
        .catch(err => { console.error(err) })
    },
    deleteData(row, index) {
      let accesstoken = ''
      if (JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0] === undefined || JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0].username === undefined) {
        accesstoken = global_system_accesstoken
      } else {
        accesstoken = JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0].accesstoken
      }
      this.listLoading = true
      const url = global_system_data_url + '/worker/routine/job/running/heart/rm?accesstoken=' + accesstoken
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8'
        },
        body: JSON.stringify({
          id: row.id
        })
      })
        .then(response => response.json())
        .then((responsedata) => {
          this.listLoading = false
          if (responsedata.status_code === 200) {
            this.$notify({
              title: 'Success',
              message: 'Start Successfully',
              type: 'success',
              duration: 2000
            })
          } else {
            this.$notify({
              title: 'Error',
              message: responsedata.status_txt,
              type: 'warning',
              duration: 2000
            })
          }
          this.tableQuery.pageData.splice(index, 1)
        })
        .catch(function(err) {
          console.log(err)
          this.listLoading = false
          this.$notify({
            title: 'Error',
            message: err,
            type: 'error',
            duration: 2000
          })
          this.getList()
        })
    },
    getSortClass: function(key) {
      const sort = this.tableQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    },
    stopData(row, index) {
      let accesstoken = ''
      if (JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0] === undefined || JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0].username === undefined) {
        accesstoken = global_system_accesstoken
      } else {
        accesstoken = JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0].accesstoken
      }
      this.listLoading = true
      const url = global_system_data_url + '/mst/flow/routine/stop?accesstoken=' + accesstoken
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8'
        },
        body: JSON.stringify({
          mstid: row.mstid,
          flowid: row.flowid,
          routineid: row.routineid,
          workerid: row.workerid,
          sys: row.sys,
          job: row.job
        })
      })
        .then(response => response.json())
        .then((responsedata) => {
          this.dialogFormVisible = false
          if (responsedata.status_code === 200) {
            this.$notify({
              title: 'Success',
              message: 'Start Successfully',
              type: 'success',
              duration: 2000
            })
          } else {
            this.$notify({
              title: 'Error',
              message: responsedata.status_txt,
              type: 'warning',
              duration: 2000
            })
          }
          this.getList()
        })
        .catch(function(err) {
          console.log(err)
          this.listLoading = false
          this.$notify({
            title: 'Error',
            message: err,
            type: 'error',
            duration: 2000
          })
          this.getList()
        })
    }
  }
}
</script>
