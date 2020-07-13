<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片 -->
    <el-card class="box-card">
      <!-- 用户列表区 table -->
      <el-table :data="regihtsList" style="width: 100%" border stripe>
        <el-table-column type="index" width="50"> </el-table-column>
        <el-table-column prop="authName" label="权限名称"> </el-table-column>
        <el-table-column prop="path" label="路径"> </el-table-column>
        <el-table-column prop="level" label="权限等级">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.level === '0'">一级</el-tag>
            <el-tag v-else-if="scope.row.level === '1'">二级</el-tag>
            <el-tag type="waring" v-else>三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      regihtsList: []
    }
  },
  methods: {
    async getRegihtsList() {
      const { data: res } = await this.$http.get('rights/list')
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败!')
      }
      this.$message.success('获取权限列表成功!')
      this.regihtsList = res.data
    }
  },
  created() {
    this.getRegihtsList()
  }
}
</script>

<style lang="scss" scoped></style>
