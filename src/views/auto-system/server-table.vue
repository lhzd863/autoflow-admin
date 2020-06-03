<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="tableQuery.title" placeholder="Title" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        Search
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        Create
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
          <el-table-column label="Ip" prop="ip" sortable="custom" align="center" width="200" :class-name="getSortClass('+ip')" :sort-orders="['ascending', 'descending']">
            <template slot-scope="{row}">
              <span>{{ row.ip }}</span>
            </template>
          </el-table-column>
          <el-table-column label="Port" prop="port" sortable="custom" align="center" width="100" :class-name="getSortClass('+port')" :sort-orders="['ascending', 'descending']">
            <template slot-scope="{row}">
              <span>{{ row.port }}</span>
            </template>
          </el-table-column>
          <el-table-column label="FlowId" width="200px" align="center">
            <template slot-scope="{row}">
              <span>{{ row.flowid }}</span>
            </template>
          </el-table-column>
          <el-table-column label="MstId" max-width="200px">
            <template slot-scope="{row}">
              <span>{{ row.mstid }}</span>
            </template>
          </el-table-column>
          <el-table-column label="WorkPoolStatus" max-width="200px">
            <template slot-scope="{row}">
              <span>{{ row.workpoolstatus }}</span>
            </template>
          </el-table-column>
          <el-table-column label="MyWorkCnt" max-width="200px">
            <template slot-scope="{row}">
              <span>{{ row.myworkcnt }}</span>
            </template>
          </el-table-column>
          <el-table-column label="Actions" align="center" width="300" class-name="small-padding fixed-width">
            <template slot-scope="{row,$index}">
              <el-button type="primary" icon="el-icon-circle-plus" @click="handleAdd(row)" circle>
              </el-button>
              <el-button type="primary" icon="el-icon-remove" @click="handleSub(row)" circle>
              </el-button>
              <el-button size="mini" type="danger" @click="handleStop(row)">
                Stop
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <pagination v-show="tableQuery.total>0" :total="tableQuery.total" :layout="tableQuery.layout" :page.sync="tableQuery.pageIndex" :limit.sync="tableQuery.pageLimit" :hidden="tableQuery.hidden" :page-sizes="tableQuery.pageSizes" @pagination="getList" />
 
        <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
          <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
            <el-form-item v-if="dialogStatus==='create'?true:false" label="ImageId" prop="imageid">
              <el-input v-model="temp.imageid" />
            </el-form-item>
            <el-form-item v-if="dialogStatus==='create'?false:true" label="FlowId" prop="flowid">
              <span> {{ temp.flowid }} </span>
            </el-form-item>
            <el-form-item v-if="dialogStatus==='create'?false:true" label="MstId" prop="mstid">
              <span> {{ temp.mstid }} </span>
            </el-form-item>
            <el-form-item label="ProcessNum" prop="processnum">
              <el-input v-model="temp.processnum" />
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="dialogFormVisible = false">
              Cancel
            </el-button>
            <el-button type="primary" @click="dialogStatus==='create'?createData():(dialogStatus==='add'?addData():subData())">
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
        flowid: undefined,
        processnum: '0',
        imageid: undefined,
        mstid: ''
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
        flowid: [{ required: true, message: 'flowid is required', trigger: 'change' }],
        mstid: [{ required: true, message: 'mstid is required', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      this.resetQueryTable()
      let accesstoken = ''
      if (JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0] === undefined || JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0].username === undefined) {
        accesstoken = global_system_accesstoken
      } else {
        accesstoken = JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0].accesstoken
      }
      const url = global_system_data_url + '/flow/routine/status?accesstoken=' + accesstoken
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
        tag: '',
        dbstore: '',
        enable: ''
      }
    },
    resetQueryTable(){
      this.QueryTable = {
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
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
      this.temp.imageid = row.imageid
    },
    handleAdd(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'add'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleSub(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'sub'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleStop(row) {
      this.$confirm('Confirm to stop instance?', 'Warning', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      })
        .then(async() => {
          this.instanceStop(row)
        })
        .catch(err => { console.error(err) })
    },
    instanceStop(row){
      let accesstoken = ''
      if (JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0] === undefined || JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0].username === undefined) {
        accesstoken = global_system_accesstoken
      } else {
        accesstoken = JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0].accesstoken
      }
      this.listLoading = true
      const url = global_system_data_url + '/instance/stop?accesstoken=' + accesstoken
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8'
        },
        body: JSON.stringify({
          flowid: row.flowid
        })
      })
        .then(response => response.json())
        .then((responsedata) => {
          this.listLoading = false
          this.$notify({
            title: 'Success',
            message: '',
            type: 'success',
            duration: 2000
          })
          this.getList()
        })
        .catch(function(err) {
          console.log(err)
          this.listLoading = false
          this.$notify({
            title: 'Error',
            message: responsedata.status_txt,
            type: 'error',
            duration: 2000
          })
          this.getList()
        })
    },
    createData(){
      let accesstoken = ''
      if (JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0] === undefined || JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0].username === undefined) {
        accesstoken = global_system_accesstoken
      } else {
        accesstoken = JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0].accesstoken
      }
      this.dialogFormVisible = false
      this.listLoading = true
      const url = global_system_data_url + '/instance/create?accesstoken=' + accesstoken
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8'
        },
        body: JSON.stringify({
          imageid: this.temp.imageid,
          processnum: this.temp.processnum
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
          this.getList()
        })
        .catch(function(err) {
          console.log(err)
          this.listLoading = false
          this.$notify({
            title: 'Error',
            message: responsedata.status_txt,
            type: 'error',
            duration: 2000
          })
          this.getList()
        })
    },
    addData(){
      let accesstoken = ''
      if (JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0] === undefined || JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0].username === undefined) {
        accesstoken = global_system_accesstoken
      } else {
        accesstoken = JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0].accesstoken
      }
      this.dialogFormVisible = false
      this.listLoading = true
      const url = global_system_data_url + '/flow/routine/add?accesstoken=' + accesstoken
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8'
        },
        body: JSON.stringify({
          flowid: this.temp.flowid,
          mstid: this.temp.mstid,
          processnum: this.temp.processnum
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
          this.getList()
        })
        .catch(function(err) {
          console.log(err)
          this.listLoading = false
          this.$notify({
            title: 'Error',
            message: responsedata.status_txt,
            type: 'error',
            duration: 2000
          })
          this.getList()
        })
    },
    subData(){
      let accesstoken = ''
      if (JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0] === undefined || JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0].username === undefined) {
        accesstoken = global_system_accesstoken
      } else {
        accesstoken = JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0].accesstoken
      }
      this.dialogFormVisible = false
      this.listLoading = true
      const url = global_system_data_url + '/flow/routine/sub?accesstoken=' + accesstoken
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8'
        },
        body: JSON.stringify({
          flowid: this.temp.flowid,
          mstid: this.temp.mstid,
          processnum: this.temp.processnum
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
          this.getList()
        })
        .catch(function(err) {
          console.log(err)
          this.listLoading = false 
          this.$notify({
            title: 'Error',
            message: responsedata.status_txt,
            type: 'error',
            duration: 2000
          })
          this.getList()
        })
    },
    getSortClass: function(key) {
      const sort = this.tableQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>
