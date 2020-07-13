<template>
  <div class="container">
    <div class="box">
      <!-- 头像 -->
      <div class="avater_box">
        <img src="../assets/logo.png" alt="" />
      </div>
      <!-- 表单 -->
      <el-form label-width="0px" class="form_box" :model="loginForm" :rules="loginFormRules" ref="loginFormRef">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="el-icon-user" style="width:400px"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" prefix-icon="el-icon-lock" style="width:400px" type="password"></el-input>
        </el-form-item>
        <el-form-item class="btn_box">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="loginFormRef">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 表单的数据绑定对象
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      //   表单数据的验证规则对象

      loginFormRules: {
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    loginFormRef() {
      // console.log(this)
      this.$refs.loginFormRef.resetFields()
    },
    login() {
      this.$refs.loginFormRef.validate(async (valid) => {
        // console.log(valid)
        if (!valid) return
        const { data: res } = await this.$http.post('/login', this.loginForm)
        if (res.meta.status !== 200) return this.$message.error('登录失败')
        this.$message.success('登录成功')
        // console.log(res)
        // 1. 将登录成功之后的 token，保存到客户端的 sessionStorage 中
        //   1.1 项目中出了登录之外的其他API接口，必须在登录之后才能访问
        //   1.2 token 只应在当前网站打开期间生效，所以将 token 保存在 sessionStorage 中
        window.sessionStorage.setItem('token', res.data.token)
        // 2. 通过编程式导航跳转到后台主页，路由地址是 /home
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  background-color: #2b4b6b;
  height: 100%;
  .box {
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    // transform: translateY(-50%);
    margin: 0 auto;
    .avater_box {
      width: 130px;
      height: 130px;
      background-color: #fff;
      border: 1px solid #eee;
      border-radius: 50%;
      padding: 10px;
      box-shadow: 0 0 10px #dddddd;
      position: absolute;
      left: 50%;
      transform: translate(-50%, -50%);
      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #eee;
      }
    }
    .form_box {
      position: absolute;
      bottom: 0;
      padding: 20px;
    }
    .btn_box {
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>
