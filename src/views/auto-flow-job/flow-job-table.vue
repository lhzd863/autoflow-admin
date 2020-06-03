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
        <el-table-column label="Sys" min-width="80px">
          <template slot-scope="{row}">
            <span>{{ row.sys }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Job" prop="job" sortable="custom" align="center" width="300" :class-name="getSortClass('+job')" :sort-orders="['ascending', 'descending']">
          <template slot-scope="{row}">
            <span>{{ row.job }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Enable" min-width="80px">
          <template slot-scope="{row}">
            <span>{{ row.enable }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Status" min-width="80px">
          <template slot-scope="{row}">
            <el-tag :type="row.status | statusFilter" :hit="false" :effect="row.status | statusEffectFilter">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="RunContext" min-width="200px">
          <template slot-scope="{row}">
            <span>{{ row.runcontext }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Server" width="180px" align="center">
          <template slot-scope="{row}">
            <span>{{ row.sserver }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Ip" min-width="150px">
          <template slot-scope="{row}">
            <span>{{ row.sip }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Port" min-width="80px">
          <template slot-scope="{row}">
            <span>{{ row.sport }}</span>
          </template>
        </el-table-column>
        <el-table-column label="StartTime" min-width="160px">
          <template slot-scope="{row}">
            <span>{{ row.starttime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="EndTime" min-width="160px">
          <template slot-scope="{row}">
            <span>{{ row.endtime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="TimeWindow" width="80px" align="center">
          <template slot-scope="{row}">
            <span>{{ row.timewindow }}</span>
          </template>
        </el-table-column>
        <el-table-column label="RetryCnt" width="80px" align="center">
          <template slot-scope="{row}">
            <span>{{ row.retrycnt }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Alert" width="80px" align="center">
          <template slot-scope="{row}">
            <span>{{ row.alert }}</span>
          </template>
        </el-table-column>
        <el-table-column label="TimeTrigger" width="80px" align="center">
          <template slot-scope="{row}">
            <span>{{ row.timetrigger }}</span>
          </template>
        </el-table-column>
        <el-table-column label="JobType" width="80px" align="center">
          <template slot-scope="{row}">
            <span>{{ row.jobtype }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Frequency" width="80px" align="center">
          <template slot-scope="{row}">
            <span>{{ row.frequency }}</span>
          </template>
        </el-table-column>
        <el-table-column label="CheckBatStatus" width="80px" align="center">
          <template slot-scope="{row}">
            <span>{{ row.checkbatstatus }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Priority" width="80px" align="center">
          <template slot-scope="{row}">
            <span>{{ row.priority }}</span>
          </template>
        </el-table-column>
        <el-table-column label="RunningCmd" width="80px" align="center">
          <template slot-scope="{row}">
            <span>{{ row.runningcmd }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Actions" align="center" width="230" class-name="small-padding fixed-width">
          <template slot-scope="{row,$index}">
            <el-button type="primary" size="mini" @click="logListData(row)">
              Log
            </el-button>
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
        <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px" style="margin-left:50px;">
          <el-form-item v-if="dialogStatus==='create'?true:false" label="Sys" prop="sys">
            <el-input v-model="temp.sys" />
          </el-form-item>
          <el-form-item v-if="dialogStatus==='create'?true:false" label="Job" prop="job">
            <el-input v-model="temp.job" />
          </el-form-item>
          <el-form-item v-if="dialogStatus==='create'?false:true" label="Sys" prop="sys">
            <span> {{ temp.sys }} </span>
          </el-form-item>
          <el-form-item v-if="dialogStatus==='create'?false:true" label="Job" prop="job">
            <span> {{ temp.job }} </span>
          </el-form-item>
          <el-form-item label="Enable">
            <el-select v-model="temp.enable" class="filter-item" placeholder="Please select">
              <el-option v-for="item in enableOptions" :key="item.key" :label="item.label" :value="item.key" />
            </el-select>
          </el-form-item>
          <el-form-item label="Status" prop="status">
            <el-select v-model="temp.status" class="filter-item" placeholder="Please select">
              <el-option v-for="item in statusOptions" :key="item.key" :label="item.label" :value="item.key" />
            </el-select>
          </el-form-item>
          <el-form-item label="RunContext" prop="runtime">
            <el-input v-model="temp.runcontext" />
          </el-form-item>
          <el-form-item label="Server" prop="server">
            <el-input v-model="temp.server" />
          </el-form-item>
          <el-form-item label="Ip" prop="ip">
            <el-input v-model="temp.ip" />
          </el-form-item>
          <el-form-item label="Port" prop="port">
            <el-input v-model="temp.port" />
          </el-form-item>
          <el-form-item label="TimeWindow">
            <el-select v-model="temp.timewindow" class="filter-item" placeholder="Please select">
              <el-option v-for="item in timewindowOptions" :key="item.key" :label="item.label" :value="item.key" />
            </el-select>
          </el-form-item>
          <el-form-item label="JobType">
            <el-select v-model="temp.jobtype" class="filter-item" placeholder="Please select">
              <el-option v-for="item in jobtypeOptions" :key="item.key" :label="item.label" :value="item.key" />
            </el-select>
          </el-form-item>
          <el-form-item label="Frequency">
            <el-select v-model="temp.frequency" class="filter-item" placeholder="Please select">
              <el-option v-for="item in frequencyOptions" :key="item.key" :label="item.label" :value="item.key" />
            </el-select>
          </el-form-item>
          <el-form-item label="CheckBatStatus">
            <el-select v-model="temp.checkbatstatus" class="filter-item" placeholder="Please select">
              <el-option v-for="item in checkbatstatusOptions" :key="item.key" :label="item.label" :value="item.key" />
            </el-select>
          </el-form-item>
          <el-form-item label="Priority">
            <el-select v-model="temp.priority" class="filter-item" placeholder="Please select">
              <el-option v-for="item in priorityOptions" :key="item.key" :label="item.label" :value="item.key" />
            </el-select>
          </el-form-item>
          <el-form-item label="RunningCmd" prop="runningcmd">
            <el-input v-model="temp.runningcmd" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" placeholder="Please input" />
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
      <el-dialog :title="logTextMap[dialogStatus]" :visible.sync="dialogLogOuterVisible" width="90%">
        <el-dialog :title="logTextMap[dialogStatus]" :visible.sync="dialogLogInnerVisible" width="80%" append-to-body>
          <el-card shadow="never" class="box-card-log">
            <pre> {{logtemp.logcontent}} </pre>
          </el-card>
          <div slot="footer" class="dialog-footer">
            <el-button @click="dialogLogInnerVisible = false">
              Cancel
            </el-button>
            <el-button type="primary" @click="logContentData">
              Confirm
            </el-button>
          </div>
        </el-dialog>
        <el-table
          :key="tableKey"
          v-loading="listLoadingOuter"
          :data="logQuery.pageData"
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
          <el-table-column label="Step" min-width="80px">
            <template slot-scope="{row}">
              <span>{{ row.step }}</span>
            </template>
          </el-table-column>
          <el-table-column label="WorkerId" min-width="150px">
            <template slot-scope="{row}">
              <span>{{ row.sserver }}</span>
            </template>
          </el-table-column>
          <el-table-column label="Ip" min-width="150px">
            <template slot-scope="{row}">
              <span>{{ row.sip }}</span>
            </template>
          </el-table-column>
          <el-table-column label="Port" min-width="80px">
            <template slot-scope="{row}">
              <span>{{ row.sport }}</span>
            </template>
          </el-table-column>
          <el-table-column label="StartTime" min-width="180px">
            <template slot-scope="{row}">
              <span>{{ row.starttime }}</span>
            </template>
          </el-table-column>
          <el-table-column label="EndTime" min-width="180px">
            <template slot-scope="{row}">
              <span>{{ row.endtime }}</span>
            </template>
          </el-table-column>
          <el-table-column label="ExitCode" min-width="80px">
            <template slot-scope="{row}">
              <span>{{ row.exitcode }}</span>
            </template>
          </el-table-column>
          <el-table-column label="Actions" align="center" width="150" class-name="small-padding fixed-width">
            <template slot-scope="{row,$index}">
              <el-button type="primary" size="mini" @click="handleLog(row)">
                View
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogLogOuterVisible = false">
            Cancel
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
  name: 'FlowJobTable',
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
      listLoadingOuter: false,
      tableQuery: {
        content: '',
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
      logQuery: {
        content: '',
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
      priorityOptions: [{ label: 'Priority-0', key: '0' }, { label: 'Priority-1', key: '1' }, { label: 'Priority-2', key: '2' }, { label: 'Priority-3', key: '3' }, { label: 'Priority-4', key: '4' }],
      timewindowOptions: [{ label: 'Enable', key: '1' }, { label: 'Disable', key: '0' }],
      jobtypeOptions: [{ label: 'Real', key: 'D' }, { label: 'Virtual', key: 'V' }],
      frequencyOptions: [{ label: 'Day', key: 'D' }, { label: 'Month', key: 'M' }],
      checkbatstatusOptions: [{ label: 'Enable', key: '1' }, { label: 'Disable', key: '0' }],
      statusOptions: [{ label: 'Ready', key: 'Ready' }, { label: 'Pending', key: 'Pending' }, { label: 'Submit', key: 'Submit' }, { label: 'Go', key: 'Go' }, { label: 'Running', key: 'Running' }, { label: 'Succ', key: 'Succ' }, { label: 'Fail', key: 'Fail' }],
      temp: {
        sys: undefined,
        job: '',
        enable: '1',
        status: '',
        runcontext: '',
        server: '',
        ip: '',
        port: '',
        timewindow: '',
        retrycnt: '',
        alert: '',
        timetrigger: '',
        jobtype: '',
        frequency: '',
        checkbatstatus: '',
        priority: '',
        runningcmd: '',
        logcontent: ''
      },
      logtemp: {
        logcontent: '',
        id: '',
        sys: '',
        job: ''
      },
      dialogFormVisible: false,
      dialogLogOuterVisible: false,
      dialogLogInnerVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      logTextMap: {
        view: 'View',
        list: 'List'
      },
      rules: {
        sys: [{ required: true, message: 'type is required', trigger: 'change' }]
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
      const url = global_system_data_url + '/flow/job/ls?accesstoken=' + accesstoken
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
          this.tableQuery.pageData = this.tableQuery.pageData.sort((a, b) => (a.length === b.length) ? a.job.localeCompare(b.job) : (a.job - b.job))
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
      console.log(data)
      const { prop, order } = data
      if (prop === 'imageid') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === null) {
        this.tableQuery.sort = this.tableQuery.sort === '+imageid' ? '-imageid' : '+imageid'
      } else if (order === 'ascending') {
        this.tableQuery.sort = '+imageid'
      } else {
        this.tableQuery.sort = '-imageid'
      }
      if (this.tableQuery.sort === '+imageid') {
        this.tableQuery.pageData = this.tableQuery.pageData.sort((a, b) => (a.length === b.length) ? b.imageid.localeCompare(a.imageid) : (b.imageid - a.imageid))
      } else {
        this.tableQuery.pageData = this.tableQuery.pageData.sort((a, b) => (a.length === b.length) ? a.imageid.localeCompare(b.imageid) : (a.imageid - b.imageid))
      }
    },
    resetTemp() {
      this.temp = {
        tag: '',
        dbstore: '',
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
          const url = global_system_data_url + '/flow/job/add?accesstoken=' + accesstoken
          fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json;charset=UTF-8'
            },
            body: JSON.stringify({
              flowid: this.tableQuery.content,
              sys: this.temp.sys,
              job: this.temp.job,
              timewindow: this.temp.timewindow,
              retrycnt: this.temp.retrycnt,
              alert: this.temp.alert,
              timetrigger: this.temp.timetrigger,
              jobtype: this.temp.jobtype,
              frequency: this.temp.frequency,
              checkbatstatus: this.temp.checkbatstatus,
              priority: this.temp.priority,
              runningcmd: this.temp.runningcmd,
              enable: this.temp.enable,
              status: this.temp.status
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
    logListData(row) {
      if ((this.tableQuery.content).length === 0) {
        return
      }
      this.listLoadingOuter = true
      this.dialogLogOuterVisible = true
      var key = row.sys+"."+row.job
      this.logTextMap.key = key
      this.dialogStatus = 'key'
      let accesstoken = ''
      if (JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0] === undefined || JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0].username === undefined) {
        accesstoken = global_system_accesstoken
      } else {
        accesstoken = JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0].accesstoken
      }
      const url = global_system_data_url + '/flow/job/log/ls?accesstoken=' + accesstoken
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8'
        },
        body: JSON.stringify({
          flowid: this.tableQuery.content,
          sys: row.sys,
          job: row.job
        })
      })
        .then(response => response.json())
        .then((responsedata) => {
          this.listLoadingOuter = false
          if (responsedata.status_code !== 200) {
            this.$notify({
              title: 'Error',
              message: responsedata.status_txt,
              type: 'error',
              duration: 2000
            })
            return
          }
          this.logQuery.pageData = responsedata.data
          this.logQuery.pageData = this.logQuery.pageData.sort((a, b) => (a.length === b.length) ? b.starttime.localeCompare(a.starttime) : (b.starttime - a.starttime))
        })
        .catch(function(err) {
          console.log(err)
        })
    }, 
    handleLog(row) {
      this.logtemp = Object.assign({}, row) // copy obj
      this.dialogLogInnerVisible = true
      this.logtemp.logcontent = ''
      var key = row.sys+"."+row.job
      this.logTextMap.key = key
      this.dialogStatus = 'key'
      for (var i = 0; i < (row.content).length; i++) {
        this.logtemp.logcontent += row.content[i]
      }
    },
    logContentData() {
      if ((this.tableQuery.content).length === 0) {
        return
      }
      let accesstoken = ''
      if (JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0] === undefined || JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0].username === undefined) {
        accesstoken = global_system_accesstoken
      } else {
        accesstoken = JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0].accesstoken
      }
      const url = global_system_data_url + '/flow/job/log/get?accesstoken=' + accesstoken
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8'
        },
        body: JSON.stringify({
          flowid: this.tableQuery.content,
          id: this.logtemp.id
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
          var tstr = ''
          for (var i = 0; i < (responsedata.data[0].content).length; i++) {
            tstr +=responsedata.data[0].content[i]
          }
          var tid = this.logtemp.id
          this.logtemp = Object.assign({}, {id:tid,logcontent:tstr})
        })
        .catch(function(err) {
          console.log(err)
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
          const url = global_system_data_url + '/flow/job/update?accesstoken=' + accesstoken
          fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json;charset=UTF-8'
            },
            body: JSON.stringify({
              flowid: this.tableQuery.content,
              sys: this.temp.sys,
              job: this.temp.job,
              timewindow: this.temp.timewindow,
              retrycnt: this.temp.retrycnt,
              alert: this.temp.alert,
              timetrigger: this.temp.timetrigger,
              jobtype: this.temp.jobtype,
              frequency: this.temp.frequency,
              checkbatstatus: this.temp.checkbatstatus,
              priority: this.temp.priority,
              runningcmd: this.temp.runningcmd,
              enable: this.temp.enable,
              status: this.temp.status
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
      let accesstoken = ''
      if (JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0] === undefined || JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0].username === undefined) {
        accesstoken = global_system_accesstoken
      } else {
        accesstoken = JSON.parse(localStorage.getItem(global_system_storage_key) || '[]')[0].accesstoken
      }
      const url = global_system_data_url + '/image/rm?accesstoken=' + accesstoken
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8'
        },
        body: JSON.stringify({
          imageid: row.imageid
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
.box-card-log {
    higth: 600px;
}
</style>
