<template>
  <div>
    <sticky :z-index="10" class-name="sub-navbar">
      <el-dropdown trigger="click">
        <el-button plain>
          FlowId<i class="el-icon-caret-bottom el-icon--right" />
        </el-button>
        <el-dropdown-menu slot="dropdown" class="no-padding no-border" style="width:300px">
          <el-input v-model="tableQuery.content" placeholder="Please enter the content">
            <template slot="prepend">
              FlowId
            </template>
          </el-input>
        </el-dropdown-menu>
      </el-dropdown>

      <el-button style="margin-left: 10px;" type="success" @click="getList">
        View
      </el-button>
    </sticky>
    <div class="app-container">
      <div class="filter-container">
        <el-input v-model="tableQuery.title" placeholder="Title" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
        <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
          Search
        </el-button>
        <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
          Add
        </el-button>
      </div>

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
        <el-table-column label="Sys" prop="sys" sortable="custom" align="center" width="80" :class-name="getSortClass('+sys')" :sort-orders="['ascending', 'descending']">
          <template slot-scope="{row}">
            <span>{{ row.sys }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Job" prop="job" sortable="custom" align="center" width="150" :class-name="getSortClass('+job')" :sort-orders="['ascending', 'descending']">
          <template slot-scope="{row}">
            <span>{{ row.job }}</span>
          </template>
        </el-table-column>
        <el-table-column label="DependencySys" prop="dependencysys" sortable="custom" align="center" min-width="80" :class-name="getSortClass('+dependencysys')" :sort-orders="['ascending', 'descending']">
          <template slot-scope="{row}">
            <span>{{ row.dependencysys }}</span>
          </template>
        </el-table-column>
        <el-table-column label="DependencyJob" min-width="150px">
          <template slot-scope="{row}">
            <span>{{ row.dependencyjob }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Description" min-width="200px">
          <template slot-scope="{row}">
            <span>{{ row.description }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Enable" min-width="50px">
          <template slot-scope="{row}">
            <span>{{ row.enable }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Actions" align="center" width="150" class-name="small-padding fixed-width">
          <template slot-scope="{row,$index}">
            <el-button type="primary" size="mini" @click="handleUpdate(row)">
              Edit
            </el-button>
            <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleDelete(row,$index)">
              Delete
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="tableQuery.total>0" :total="tableQuery.total" :layout="tableQuery.layout" :page.sync="tableQuery.pageIndex" :limit.sync="tableQuery.pageLimit" :hidden="tableQuery.hidden" :page-sizes="tableQuery.pageSizes" @pagination="getList" />

      <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
        <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="130px" style="margin-left:50px;">
          <el-form-item v-if="dialogStatus==='create'?true:false" label="Sys" prop="sys">
            <el-input v-model="temp.sys" />
          </el-form-item>
          <el-form-item v-if="dialogStatus==='create'?true:false" label="Job" prop="job">
            <el-input v-model="temp.job" />
          </el-form-item>
          <el-form-item v-if="dialogStatus==='create'?true:false" label="DependencySys" prop="dependencysys">
            <el-input v-model="temp.dependencysys" />
          </el-form-item>
          <el-form-item v-if="dialogStatus==='create'?true:false" label="DependencyJob" prop="dependencyjob">
            <el-input v-model="temp.dependencyjob" />
          </el-form-item>
          <el-form-item v-if="dialogStatus==='create'?false:true" label="Sys" prop="sys">
            <span> {{ temp.sys }} </span>
          </el-form-item>
          <el-form-item v-if="dialogStatus==='create'?false:true" label="Job" prop="job">
            <span> {{ temp.job }} </span>
          </el-form-item>
          <el-form-item v-if="dialogStatus==='create'?false:true" label="DependencySys" prop="dependencysys">
            <span> {{ temp.dependencysys }} </span>
          </el-form-item>
          <el-form-item v-if="dialogStatus==='create'?false:true" label="DependencyJob" prop="dependencyjob">
            <span> {{ temp.dependencyjob }} </span>
          </el-form-item>
          <el-form-item label="Description" prop="description">
            <el-input v-model="temp.description" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" placeholder="Please input" />
          </el-form-item>
          <el-form-item label="Enable">
            <el-select v-model="temp.enable" class="filter-item" placeholder="Please select">
              <el-option v-for="item in enableOptions" :key="item.key" :label="item.label" :value="item.key" />
            </el-select>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">
            Cancel
          </el-button>
          <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
            Confirm
          </el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import defaultConfig from '@/config'
import Sticky from '@/components/Sticky'

const { global_system_accesstoken, global_system_data_url, global_system_storage_key } = defaultConfig

export default {
  name: 'FlowJobParameterTable',
  components: { Pagination, Sticky },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        Succ: 'success',
        Ready: 'info',
        Pending: 'info',
        Submit: 'info',
        Go: 'info',
        Fail: 'danger',
        Stop: 'info',
        Running: 'warning'
      }
      return statusMap[status]
    },
    statusEffectFilter(status) {
      const statusEffectMap = {
        Succ: 'dark',
        Ready: 'plain',
        Pending: 'light',
        Submit: 'light',
        Go: 'light',
        Fail: 'dark',
        Stop: 'plain',
        Running: 'dark'
      }
      return statusEffectMap[status]
    }
  },
  data() {
    return {
      tableKey: 0,
      listLoading: false,
      tableQuery: {
        content: '',
        title: '',
        sort: '+step',
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
        flowid: '',
        sys: '',
        job: '',
        key: '',
        val: '',
        description: '',
        enable: '1'
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      rules: {
        sys: [{ required: true, message: 'sys is required', trigger: 'change' }],
        job: [{ required: true, message: 'job is required', trigger: 'change' }],
        dependencysys: [{ required: true, message: 'dependency sys is required', trigger: 'change' }],
        dependencyjob: [{ required: true, message: 'dependency job is required', trigger: 'change' }]
      }
    }
  },
  created() {
  },
  methods: {
    getList() {
      if ((this.tableQuery.content).length === 0) {
        return
      }
      this.listLoading = true
      let accesstoken = ''
      if (JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0] === undefined || JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0].username === undefined) {
        accesstoken = global_system_accesstoken
      } else {
        accesstoken = JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0].accesstoken
      }
      const url = global_system_data_url + '/flow/job/dependency/ls?accesstoken=' + accesstoken
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8'
        },
        body: JSON.stringify({
          flowid: this.tableQuery.content
        })
      })
        .then(response => response.json())
        .then((responsedata) => {
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
          this.listLoading = false
        })
        .catch(function(err) {
          console.log(err)
          this.listLoading = false
        })
    },
    handleFilter() {
      if ((this.tableQuery.title).length === 0) {
        this.getList()
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
      if (prop === 'job') {
        this.sortByJob(order, 'job')
      }
      if (prop === 'key') {
        this.sortByKey(order, 'key')
      }
      if (prop === 'sys') {
        this.sortBySys(order, 'sys')
      }
    },
    sortBySys(order, key) {
      if (order === null) {
        this.tableQuery.sort = this.tableQuery.sort === `+${key}` ? `-${key}` : `+${key}`
      } else if (order === 'ascending') {
        this.tableQuery.sort = `+${key}`
      } else {
        this.tableQuery.sort = `-${key}`
      }
      if (this.tableQuery.sort === `+${key}`) {
        this.tableQuery.pageData = this.tableQuery.pageData.sort((a, b) => (a.length === b.length) ? b.sys.localeCompare(a.sys) : (b.sys - a.sys))
      } else {
        this.tableQuery.pageData = this.tableQuery.pageData.sort((a, b) => (a.length === b.length) ? a.sys.localeCompare(b.sys) : (a.sys - b.sys))
      }
    },
    sortByJob(order, key) {
      if (order === null) {
        this.tableQuery.sort = this.tableQuery.sort === `+${key}` ? `-${key}` : `+${key}`
      } else if (order === 'ascending') {
        this.tableQuery.sort = `+${key}`
      } else {
        this.tableQuery.sort = `-${key}`
      }
      if (this.tableQuery.sort === `+${key}`) {
        this.tableQuery.pageData = this.tableQuery.pageData.sort((a, b) => (a.length === b.length) ? b.job.localeCompare(a.job) : (b.job - a.job))
      } else {
        this.tableQuery.pageData = this.tableQuery.pageData.sort((a, b) => (a.length === b.length) ? a.job.localeCompare(b.job) : (a.job - b.job))
      }
    },
    sortByKey(order, key) {
      if (order === null) {
        this.tableQuery.sort = this.tableQuery.sort === `+${key}` ? `-${key}` : `+${key}`
      } else if (order === 'ascending') {
        this.tableQuery.sort = `+${key}`
      } else {
        this.tableQuery.sort = `-${key}`
      }
      if (this.tableQuery.sort === `+${key}`) {
        this.tableQuery.pageData = this.tableQuery.pageData.sort((a, b) => (a.length === b.length) ? b.key.localeCompare(a.key) : (b.key - a.key))
      } else {
        this.tableQuery.pageData = this.tableQuery.pageData.sort((a, b) => (a.length === b.length) ? a.key.localeCompare(b.key) : (a.key - b.key))
      }
    },
    resetTemp() {
      this.temp = {
        flowid: '',
        sys: '',
        job: '',
        dependencysys: '',
        dependencyjob: '',
        description: '',
        enable: ''
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          let accesstoken = ''
          if (JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0] === undefined || JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0].username === undefined) {
            accesstoken = global_system_accesstoken
          } else {
            accesstoken = JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0].accesstoken
          }
          const url = global_system_data_url + '/flow/job/dependency/add?accesstoken=' + accesstoken
          fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json;charset=UTF-8'
            },
            body: JSON.stringify({
              flowid: this.tableQuery.content,
              sys: this.temp.sys,
              job: this.temp.job,
              dependencysys: this.temp.dependencysys,
              dependencyjob: this.temp.dependencyjob,
              description: this.temp.description,
              enable: this.temp.enable
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
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
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
          const url = global_system_data_url + '/flow/job/dependency/update?accesstoken=' + accesstoken
          fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json;charset=UTF-8'
            },
            body: JSON.stringify({
              flowid: this.tableQuery.content,
              sys: this.temp.sys,
              job: this.temp.job,
              dependencysys: this.temp.dependencysys,
              dependencyjob: this.temp.dependencyjob,
              description: this.temp.description,
              enable: this.temp.enable
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
      const url = global_system_data_url + '/flow/job/dependency/rm?accesstoken=' + accesstoken
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8'
        },
        body: JSON.stringify({
          flowid: this.tableQuery.content,
          sys: this.temp.sys,
          job: this.temp.job,
          dependencysys: this.temp.dependencysys,
          dependencyjob: this.temp.dependencyjob
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
    },
    getSortClass: function(key) {
      const sort = this.tableQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>

<style scoped>
.components-container div {
  margin: 10px;
}

.time-container {
  display: inline-block;
}
</style>
