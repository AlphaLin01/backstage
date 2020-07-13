<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <!-- 输入框 -->
      <div style="margin-top: 15px;">
        <el-row :gutter="20">
          <el-col :span="7">
            <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUsersList">
              <el-button slot="append" icon="el-icon-search" @click="getUsersList"></el-button>
            </el-input>
          </el-col>
          <el-col :span="6"> <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button></el-col>
        </el-row>
      </div>

      <!-- 用户列表区 table -->
      <el-table :data="userList" style="width: 100%" border stripe>
        <el-table-column type="index" width="50"> </el-table-column>
        <el-table-column prop="username" label="姓名"> </el-table-column>
        <el-table-column prop="email" label="邮箱"> </el-table-column>
        <el-table-column prop="mobile" label="电话"> </el-table-column>
        <el-table-column prop="role_name" label="角色"> </el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStatusChange(scope.row)"> </el-switch>
            {{ scope.row }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 修改 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="openEditDialog(scope.row.id)"></el-button>
            <!-- 删除 -->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="openDel(scope.row.id)"></el-button>
            <!-- 分配 -->
            <el-tooltip class="item" effect="dark" content="分配角色" placement="top">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="openRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 4, 8, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="closeDialogAdd()">
      <!-- add dialog表单内容 -->
      <el-form :model="addForm" :rules="formRules" ref="addFormRef" label-width="70px">
        <el-form-item label="姓名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser()">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑用户对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="closeDialogEdit()">
      <!-- edit dialog表单内容 -->
      <el-form :model="editForm" :rules="formRules" ref="editFormRef" label-width="70px">
        <el-form-item label="姓名" prop="username">
          <el-input disabled v-model="editForm.username"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色对话框 -->
    <el-dialog title="分配角色" :visible.sync="roleDialogVisible" width="50%" @close="closeDialogRole()">
      <!-- role dialog内容 -->
      <div>
        <p>当前的用户 : {{ userInfo.username }}</p>
        <br />
        <p>当前的角色 : {{ userInfo.role_name }}</p>
        <br />
        <p>
          分配新角色 :
          <el-select v-model="selectId" placeholder="请选择">
            <el-option v-for="item in roleList" :key="item.id" :label="item.roleName" :value="item.id"></el-option>
          </el-select>
        </p>
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button @click="roleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="roleUserInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    var checkPhone = (rule, value, callback) => {
      const rgePhone = /^(?:(?:\+|00)86)?1(?:(?:3[\d])|(?:4[5-7|9])|(?:5[0-3|5-9])|(?:6[5-7])|(?:7[0-8])|(?:8[\d])|(?:9[1|8|9]))\d{8}$/
      if (rgePhone.test(value)) {
        return callback()
      } else {
        callback(new Error('请输入合法手机号'))
      }
    }
    var checkEmail = (rule, value, callback) => {
      const rgeEmail = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      if (rgeEmail.test(value)) {
        return callback()
      }
      callback(new Error('请输入合法邮箱'))
    }

    return {
      queryInfo: {
        //   查询参数
        query: '',
        // 当前页码
        pagenum: 1,
        // 每页显示条数
        pagesize: 10
      },
      userList: [],
      total: 0,
      //   添加用户功能数据
      addDialogVisible: false,
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      formRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '用户名的长度在3~10个字符之间',
            trigger: 'blur'
          }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 3,
            max: 18,
            message: '用户名的长度在3~10个字符之间',
            trigger: 'blur'
          }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkPhone, trigger: 'blur' }
        ]
      },
      //   编辑用户功能数据
      editDialogVisible: false,
      editForm: {},
      // roleDialogVisible
      roleDialogVisible: false,
      // 角色列表
      roleList: [],
      userInfo: {},
      selectId: ''
    }
  },
  methods: {
    async getUsersList() {
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })
      //   console.log(res)

      if (res.meta.status !== 200) {
        return this.$message.error('获取管理员列表失败')
      }
      this.userList = res.data.users
      console.log(this.userList)
      this.total = res.data.total
      //   console.log(res)
    },
    // pagesize改变
    handleSizeChange(newpagesize) {
      //   console.log(newpagesize)
      this.queryInfo.pagesize = newpagesize
      this.getUsersList()
    },
    // 当前页改变
    handleCurrentChange(Currentpage) {
      //   console.log(Currentpage)
      this.queryInfo.pagenum = Currentpage
      this.getUsersList()
    },
    // 用户状态改变
    async userStatusChange(userInfo) {
      //   console.log(userInfo)
      const { data: res } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
      //   console.log(res)
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('改变用户状态失败')
      }
      this.$message.success('更新用户状态成功')
    },
    // 关闭add对话框并重置表单
    closeDialogAdd() {
      //   console.log(this.$refs)
      this.$refs.addFormRef.resetFields()
    },
    // 关闭edit对话框并重置表单
    closeDialogEdit() {
      //   console.log(this.$refs)
      this.$refs.editFormRef.resetFields()
    },
    // 点击确定按钮添加用户
    addUser() {
      this.$refs.addFormRef.validate(async (vaild) => {
        // console.log(vaild)
        if (!vaild) {
          return vaild
        }
        const { data: res } = await this.$http.post('users', this.addForm)
        // console.log(res.data)
        if (!res.meta === 201) {
          return this.$message.error('添加用户失败！')
        }

        this.$message.success('添加用户成功!')

        this.addDialogVisible = false
        this.getUsersList()
      })
    },
    // 打开编辑对话框并根据id渲染form
    async openEditDialog(id) {
      this.editDialogVisible = true
      console.log(id)
      const { data: res } = await this.$http.get(`users/+${id}`)
      //   console.log(res.data)
      if (!res.meta.status === 200) {
        return this.$message.msg('查询用户失败!')
      }
      this.editForm = res.data
    },
    // 点击确定按钮编辑用户
    editUserInfo() {
      this.$refs.editFormRef.validate(async (vaild) => {
        if (!vaild) return vaild
        // console.log(vaild)
        const { data: res } = await this.$http.put(`users/+${this.editForm.id}`, {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        })
        // console.log(res.data)
        if (!res.meta === 200) {
          return this.$message.error('编辑用户失败!')
        }
        this.editDialogVisible = false
        this.$message.success('编辑用户成功!')
        this.getUsersList()
      })
    },
    // 点击确定按钮删除用户
    async openDel(id) {
      // console.log(id)
      const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => {
        return err
      })
      console.log(confirmResult)
      // 如果用户确认删除返回结果为字符串confirm
      // 如果用户取消删除返回结果为字符串cancel
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      // console.log('queren')
      const { data: res } = await this.$http.delete(`users/+${id}`)
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败!')
      }
      this.$message.success('删除用户成功!')
      this.getUsersList()
    },
    // 点击角色按钮
    async openRole(userInfo) {
      this.userInfo = userInfo
      const { data: res } = await this.$http.get('roles')
      // console.log(res.data)
      if (!res.meta === 200) {
        return this.$message.error('获取角色失败！')
      }

      this.$message.success('获取角色成功!')

      this.roleList = res.data
      // console.log(res.data)
      this.roleDialogVisible = true
    },
    // 点击确定按钮提交用户角色
    async roleUserInfo() {
      if (!this.selectId) {
        return this.$message.error('请选择角色!')
      }
      const { data: res } = await this.$http.put(`users/+${this.userInfo.id}/role`, { rid: this.selectId })
      // console.log(res.data)
      if (!res.meta === 200) {
        return this.$message.error('分配角色失败！')
      }

      this.$message.success('分配角色成功!')

      // console.log(res.data)
      this.getUsersList()

      this.roleDialogVisible = false
    },
    // 监听关闭role对话框
    closeDialogRole() {
      this.selectId = ''
      this.userInfo = {}
    }
  },
  created() {
    this.getUsersList()
  }
}
</script>

<style lang="scss" scoped></style>
<style>
.el-breadcrumb {
  margin-bottom: 15px;
}
.el-table {
  margin-top: 20px;
}
.el-pagination {
  margin-top: 15px;
}
</style>
