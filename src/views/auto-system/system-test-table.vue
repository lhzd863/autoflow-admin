<template>
  <div class="app-container">
    <iframe src="t.txt" name="iframe1"></iframe>
  </div>
</template>

<script>
import waves from '@/directive/waves' // waves directive
import defaultConfig from '@/config'

const { global_system_accesstoken, global_system_data_url, global_system_storage_key } = defaultConfig

export default {
  name: 'Test',
  components: {  },
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
      temp: {
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
        enable: ''
      }
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
          const url = global_system_data_url + '/job/pool/add?accesstoken=' + accesstoken
          fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json;charset=UTF-8'
            },
            body: JSON.stringify({
              priority: this.temp.enable
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
