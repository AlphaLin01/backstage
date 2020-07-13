<template>
  <el-container>
    <el-header>
      <div class="headerLeft">
        <img src="../assets/logo1.jpg" alt="" />
        <span>电商后台管理系统</span>
      </div>
      <el-button size="mini" @click="logout" type="info">退出</el-button>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="collapse" @click="collapse">|||</div>
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409eff"
          :unique-opened="true"
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="activePath"
        >
          <!-- 一级菜单 -->
          <el-submenu :index="'/' + item.path" v-for="item in menuList" :key="item.id">
            <template slot="title">
              <i :class="'el-icon-' + iconObj[item.id]"></i>
              <span>{{ item.authName }}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveMenuStatus('/' + subItem.path)">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{ subItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      menuList: [],
      iconObj: {
        125: 'user',
        103: 'set-up',
        101: 'shopping-bag-1',
        102: 'document',
        145: 's-platform'
      },
      isCollapse: false,
      activePath: ''
    }
  },
  methods: {
    // 登录
    logout() {
      window.sessionStorage.clear('token')
      this.$router.push('/login')
    },
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menuList = res.data
    },
    // 菜单折叠
    collapse() {
      this.isCollapse = !this.isCollapse
    },
    saveMenuStatus(activePath) {
      // console.log(activePath)
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  },
  created() {
    this.getMenuList()
    // 当(刷新页面时)组件创建时获取activePath
    this.activePath = window.sessionStorage.getItem('activePath')
  }
}
</script>

<style lang="scss" scoped>
.el-container {
  .el-header {
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-left: 0px;

    .headerLeft {
      display: flex;
      justify-content: space-between;
      align-items: center;
      img {
        width: 60px;
        height: 60px;
        margin-right: 20px;
      }
      span {
        font-size: 20px;
        color: #fff;
      }
    }
    .el-button {
      margin-left: 20px;
    }
  }
  .el-aside {
    background-color: #333744;
    height: 100vh;
    .collapse {
      background-color: #4a5064;
      text-align: center;
      height: 24px;
      // font-size: 20px;
      line-height: 24px;
      color: #fff;
      letter-spacing: 0.1em;
    }
  }
  .el-main {
    background-color: #eaedf1;
    height: 100vh;
  }
}
.el-menu {
  border: 0px;
}
</style>
