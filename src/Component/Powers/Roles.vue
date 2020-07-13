<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <!-- 输入框 -->
      <div style="margin-top: 15px;">
        <el-row :gutter="20">
          <el-col :span="6"> <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button> </el-col>
        </el-row>
      </div>
      <!-- table -->
      <el-table :data="rolesList" style="width: 100%" border stripe>
        <el-table-column type="expand" width="50">
          <template slot-scope="scope">
            <el-row :class="['bb', i1 === 0 ? 'bt' : '', 'flex']" v-for="(item1, i1) in scope.row.children" :key="item1.id">
              <!-- 一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="delRights(scope.row, item1.id)">
                  {{ item1.authName }}
                </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级和三级权限 -->
              <el-col :span="19">
                <!-- 通过v-for嵌套渲染二级权限 -->
                <el-row :class="('bd', i2 === 0 ? '' : 'bt', 'flex')" v-for="(item2, i2) in item1.children" :key="item2.id">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="delRights(scope.row, item2.id)">
                      {{ item2.authName }}
                    </el-tag>
                    <i class="el-icon-caret-right"></i
                  ></el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      :class="('bd', i3 === 0 ? '' : 'bt')"
                      v-for="(item3, i3) in item2.children"
                      :key="item3.id"
                      closable
                      @close="delRights(scope.row, item3.id)"
                      >{{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre>
              {{ scope.row }}
            </pre> -->
          </template>
        </el-table-column>
        <el-table-column type="index" width="50"> </el-table-column>
        <el-table-column prop="roleName" label="角色名称"> </el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"> </el-table-column>

        <el-table-column label="操作">
          <template slot-scope="scope">
            <!-- 修改 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="openEditDialog(scope.row.id)">编辑</el-button>
            <!-- 删除 -->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="openDel(scope.row.id)">删除</el-button>
            <!-- 分配 -->

            <el-button type="warning" icon="el-icon-setting" size="mini" @click="openRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 添加角色dialog -->
      <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%" @close="closeAdd()">
        <el-form :model="addForm" ref="addFormRef" :rules="formRules" label-width="80px">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="addForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="addForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addRoles()">确 定</el-button>
        </div>
      </el-dialog>
      <!-- 编辑角色dialog -->
      <el-dialog title="编辑角色" :visible.sync="editDialogVisible" width="50%" @close="closeEdit()">
        <el-form :model="editForm" ref="editFormRef" :rules="formRules" label-width="80px">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="editForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="editForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editRoles()">确 定</el-button>
        </div>
      </el-dialog>
      <!-- 分配权限dialog -->

      <el-dialog title="权限分配" :visible.sync="rightDialogVisible" width="50%" @close="closeRightDialog()">
        <el-tree :data="rightsList" :props="treeProps" show-checkbox default-expand-all node-key="id" :default-checked-keys="defKeys" ref="tree"></el-tree>

        <!-- <pre>
        {{ this.rightsList }}
        </pre> -->

        <div slot="footer" class="dialog-footer">
          <el-button @click="rightDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="rightConfirm">确 定</el-button>
        </div>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rolesList: [],
      rightsList: [],
      // 添加.编辑.分配权限功能显示
      addDialogVisible: false,
      editDialogVisible: false,
      rightDialogVisible: false,
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      editForm: {},
      formRules: {
        roleName: [
          { required: true, message: '角色名称', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '用户名的长度在3~10个字符之间',
            trigger: 'blur'
          }
        ],
        roleDesc: [
          { required: true, message: '角色描述', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '用户名的长度在3~10个字符之间',
            trigger: 'blur'
          }
        ]
      },
      // 树形控件绑定属性
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 树形勾选节点
      defKeys: [],
      // 角色id
      roleId: ''
    }
  },
  methods: {
    // 获取列表数据
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色失败!')
      }
      this.$message.success('获取角色列表成功!')
      this.rolesList = res.data
    },
    // 关闭add对话框
    closeAdd() {
      // console.log(this.$refs)
      this.$refs.addFormRef.resetFields()
    },
    // 点击确定按钮添加roles数据
    async addRoles() {
      const { data: res } = await this.$http.post('roles', this.addForm)
      // console.log(res)
      if (res.meta.status !== 201) {
        return this.$message.error('添加角色失败!')
      }
      this.$message.success('添加角色成功!')
      this.addForm = res.data
      this.addDialogVisible = false
      this.getRolesList()
    },
    // 点击确定按钮删除roles数据
    async openDel(id) {
      const resc = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => err)
      console.log(resc)
      if (resc !== 'confirm') {
        return this.$message.info('已取消删除!')
      }
      const { data: res } = await this.$http.delete(`roles/+${id}`)
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('删除角色失败!')
      }
      this.$message.success('删除角色成功!')
      this.getRolesList()
    },
    // 渲染编辑form
    async openEditDialog(id) {
      this.editDialogVisible = true
      const { data: res } = await this.$http.get(`roles/+${id}`)
      // console.log(res)
      if (!res.meta.status === 200) {
        return this.$message.error('查询用户失败!')
      }
      this.editForm = res.data
    },
    // 点击确定按钮编辑roles数据
    editRoles() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) {
          return valid
        }
        const { data: res } = await this.$http.put(`roles/+${this.editForm.roleId}`, {
          roleName: this.editForm.roleName,

          roleDesc: this.editForm.roleDesc
        })
        // console.log(res)
        if (!res.meta.status === 200) {
          return this.$message.error('编辑角色失败!')
        }
        this.$message.success('编辑角色成功!')
        this.editForm = res.data
        this.editDialogVisible = false
        this.getRolesList()
      })
    },
    closeEdit() {
      this.$refs.editFormRef.resetFields()
    },
    // 点击删除三级权限

    async delRights(roleArry, rightId) {
      console.log(roleArry, rightId)
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
      const { data: res } = await this.$http.delete(`roles/+${roleArry.id}/rights/+${rightId}`)
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败!')
      }
      this.$message.success('删除用户成功!')
      // this.getRolesList()
      roleArry.children = res.data
    },
    // 点击按钮分配权限弹出框
    async openRightDialog(roleArry) {
      this.roleId = roleArry.id
      const { data: res } = await this.$http.get('rights/tree')
      console.log(res)
      if (!res.meta.status === 200) {
        return this.$message.error('获取权限列表失败!')
      }
      this.rightsList = res.data
      this.getDefKeyId(roleArry, this.defKeys)
      this.rightDialogVisible = true
    },
    // 通过递归获取第三节点权限的id 并保存在defKeys[[]里
    getDefKeyId(node, arry) {
      // 如果当前节点没有children 那么就将node.id传入arry中保存
      if (!node.children) {
        return arry.push(node.id)
      }
      node.children.forEach((item) => this.getDefKeyId(item, arry))
    },
    closeRightDialog() {
      this.defKeys = []
    },
    async rightConfirm() {
      const keys = [...this.$refs.tree.getCheckedNodes(), ...this.$refs.tree.getCheckedKeys()]
      const strKeys = keys.join(',')

      const { data: res } = await this.$http.post(`roles/+${this.roleId}/rights`, { rids: strKeys })
      console.log(res)
      if (!res.meta.status === 200) {
        return this.$message.error('角色授权失败!')
      }
      this.$message.success('角色授权成功!')
      this.getRolesList()
      this.rightDialogVisible = false
    }
  },
  created() {
    this.getRolesList()
  }
}
</script>

<style lang="scss" scoped>
.el-tag {
  margin: 8px;
}
.bt {
  border-top: 1px solid #eee;
}
.bb {
  border-bottom: 1px solid #eee;
}
.flex {
  display: flex;
  // justify-content: center;
  align-items: center;
}
</style>
<style>
#app {
  min-width: 1366px;
}
</style>
