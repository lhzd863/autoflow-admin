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
          <el-table-column label="FlowId" prop="flowid" sortable="custom" align="center" width="200" :class-name="getSortClass('+flowid')" :sort-orders="['ascending', 'descending']">
            <template slot-scope="{row}">
              <span>{{ row.flowid }}</span>
            </template>
          </el-table-column>
          <el-table-column label="Sys" prop="sys" sortable="custom" align="center" width="100" :class-name="getSortClass('+sys')" :sort-orders="['ascending', 'descending']">
            <template slot-scope="{row}">
              <span>{{ row.sys }}</span>
            </template>
          </el-table-column>
          <el-table-column label="Job" prop="job" sortable="custom" align="center" width="300" :class-name="getSortClass('+job')" :sort-orders="['ascending', 'descending']">
            <template slot-scope="{row}">
              <span>{{ row.job }}</span>
            </template>
          </el-table-column>
          <el-table-column label="StartTime" width="200px" align="center">
            <template slot-scope="{row}">
              <span>{{ row.starttime }}</span>
            </template>
          </el-table-column>
          <el-table-column label="Priority" max-width="50px">
            <template slot-scope="{row}">
              <span>{{ row.priority }}</span>
            </template>
          </el-table-column>
          <el-table-column label="Server" max-width="50px">
            <template slot-scope="{row}">
              <span>{{ row.server }}</span>
            </template>
          </el-table-column>
          <el-table-column label="Enable" max-width="50px">
            <template slot-scope="{row}">
              <span>{{ row.enable }}</span>
            </template>
          </el-table-column>
          <el-table-column label="Actions" align="center" width="200" class-name="small-padding fixed-width">
            <template slot-scope="{row,$index}">
              <el-button size="mini" type="primary" @click="handleUpdate(row)">
                Edit
              </el-button>
              <el-button size="mini" type="danger" @click="handleDelete(row, $index)">
                Delete
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <pagination v-show="tableQuery.total>0" :total="tableQuery.total" :layout="tableQuery.layout" :page.sync="tableQuery.pageIndex" :limit.sync="tableQuery.pageLimit" :hidden="tableQuery.hidden" :page-sizes="tableQuery.pageSizes" @pagination="getList" />

        <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
          <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
            <el-form-item label="FlowId">
              <span> {{ temp.flowid }} </span>
            </el-form-item>
            <el-form-item label="Sys">
              <span> {{ temp.sys }} </span>
            </el-form-item>
            <el-form-item label="Job">
              <span> {{ temp.job }} </span>
            </el-form-item>
            <el-form-item label="Priority">
              <el-input v-model="temp.priority" />
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="dialogFormVisible = false">
              Cancel
            </el-button>
            <el-button type="primary" @click="dialogStatus==='update'?updateData():getList()">
              Confirm
            </el-button>
          </div>
        </el-dialog>
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
  name: 'ServerTable',
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
      enableOptions: ['1', '0'],
      temp: {
        imageid: undefined,
        tag: '',
        dbstore: '',
        enable: '1'
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }]
      }
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
      const url = global_system_data_url + '/job/pool/ls?accesstoken=' + accesstoken
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
        var t_dat1 = t_data[k]
        for (var t_key in t_dat1) {
          if (t_dat1[t_key] === null) {
            continue
          }
          if (String(t_dat1[t_key]).indexOf(this.tableQuery.title) !== -1) {
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
      if (prop === 'ip') {
        this.sortByIp(order)
      } else if (prop === 'port') {
        this.sortByPort(order)
      }
    },
    sortByIp(order) {
      if (order === null) {
        this.tableQuery.sort = this.tableQuery.sort === '+ip' ? '-ip' : '+ip'
      } else if (order === 'ascending') {
        this.tableQuery.sort = '+ip'
      } else {
        this.tableQuery.sort = '-ip'
      }
      if (this.tableQuery.sort === '+ip') {
        this.tableQuery.pageData = this.tableQuery.pageData.sort((a, b) => (a.length === b.length) ? b.ip.localeCompare(a.ip) : (b.ip - a.ip))
      } else {
        this.tableQuery.pageData = this.tableQuery.pageData.sort((a, b) => (a.length === b.length) ? a.ip.localeCompare(b.ip) : (a.ip - b.ip))
      }
    },
    sortByPort(order) {
      if (order === null) {
        this.tableQuery.sort = this.tableQuery.sort === '+port' ? '-port' : '+port'
      } else if (order === 'ascending') {
        this.tableQuery.sort = '+port'
      } else {
        this.tableQuery.sort = '-port'
      }
      if (this.tableQuery.sort === '+port') {
        this.tableQuery.pageData = this.tableQuery.pageData.sort((a, b) => (a.length === b.length) ? b.port.localeCompare(a.port) : (b.port - a.port))
      } else {
        this.tableQuery.pageData = this.tableQuery.pageData.sort((a, b) => (a.length === b.length) ? a.port.localeCompare(b.port) : (a.port - b.port))
      }
    },
    resetTemp() {
      this.temp = {
        flowid: '',
        sys: '',
        job: '',
        priority: ''
      }
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          let accesstoken = ''
          if (JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0] === undefined || JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0].username === undefined) {
            accesstoken = global_system_accesstoken
          } else {
            accesstoken = JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0].accesstoken
          }
          const url = global_system_data_url + '/job/pool/add?accesstoken=' + accesstoken
          fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json;charset=UTF-8'
            },
            body: JSON.stringify({
              flowid: this.temp.sys,
              sys: this.temp.sys,
              job: this.temp.job,
              priority: this.temp.priority
            })
          })
            .then(response => response.json())
            .then((responsedata) => {
              this.dialogFormVisible = false
              this.$notify({
                title: 'Success',
                message: 'Created Successfully',
                type: 'success',
                duration: 2000
              })
              this.getList()
            })
            .catch(function(err) {
              console.log(err)
              this.$notify({
                title: 'Error',
                message: 'Created Error',
                type: 'error',
                duration: 2000
              })
            })
        }
      })
    },
    getSortClass: function(key) {
      const sort = this.tableQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    },
    handleDelete(row, index) {
      this.$confirm('Confirm to delete data?', 'Warning', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      })
        .then(async() => {
          this.deleteData(row)
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
      const url = global_system_data_url + '/job/pool/rm?accesstoken=' + accesstoken
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8'
        },
        body: JSON.stringify({
          flowid: row.imageid,
          sys: row.sys,
          job: row.job
        })
      })
        .then(response => response.json())
        .then((responsedata) => {
          this.dialogFormVisible = false
          this.$notify({
            title: 'Success',
            message: 'Delete Successfully',
            type: 'success',
            duration: 2000
          })
          this.tableQuery.pageData.splice(index, 1)
        })
        .catch(function(err) {
          console.log(err)
          this.$notify({
            title: 'Error',
            message: 'Delete Error',
            type: 'error',
            duration: 2000
          })
        })
    }
  }
}
</script>
