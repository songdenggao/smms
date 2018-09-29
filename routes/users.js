var express = require('express');
var router = express.Router();

// 引入连接数据库模块
const connection=require('./conn');

//调用方法
connection.connect(()=>{
  console.log('数据库连接成功!666');
});

//检查用户名和密码是否正确
router.post('/checklogin',(req,res)=>{
  // 接收用户名和密码
  let {username,password}=req.body;

  // 构造sql 用户名和密码且的关系
  const sqlStr=`select*from users where username='${username}' and password='${password}'`;

  // 执行sql语句（查询用户名和密码是否存在）
  connection.query(sqlStr,(err,data)=>{
    if(err){
      throw err;
    }else{
      // 如果存在 返回成功的数据对象
      if(data.length){
        console.log(data);
        // 登录成功 设置cookie (在res.send()之前设置)
        res.cookie('username',data[0].username);
        res.cookie('password',data[0].password);
        res.cookie('groups',data[0].groups);

        res.send({"errcode":1,"msg":"恭喜你，登录成功！"})
      }else{
        // 否则 返回失败的数据对象
        res.send({"errcode":0, "msg":"请检查用户名或密码！"})
      }
    }
  })

})

//检查用户是否已经登录
router.get('/checkIsLogin',(req,res)=>{
  // 从浏览器获取cookie（看一下有没有，如果有 就是登录过的 如果没有 就是直接进来的没有登录的）
  // console.log('从浏览器获取cookie:', req.cookies.username) 
  // 从浏览器获取的cookie
  let username=req.cookies.username
  // 如果存在 随便响应一些信息（不要影响用户操作）
  if(username){
    res.send('console.log("")')
  }else{
    // 如果不存在 那就是没有登录 弹出提示 跳转到登录页面
    res.send('alert("请登录以后再操作！呵呵！"); location.href="./login.html";');
  }

})

//退出登录
router.get('/logout',(req,res)=>{
  // 清除cookie
  res.clearCookie('username');
  res.clearCookie('password');
  res.clearCookie('groups');

  // 弹出对应提示 跳转到登录页面
  res.send('<script>alert("欢迎下次登录！"); location.href="http://localhost:666/login.html";</script>')
})

/* 接收添加用户账号的请求 */
router.post('/userAdd', (req, res) => {
  // 接收前端用户账号的数据
  let {username, password, group} = req.body;
  // console.log('接收到的数据:',username, password, group) 这里要测试

  // 构造sql语句
  const sqlStr = 'insert into users(username, password, groups) values(?,?,?)';
  // 接收到的数据参数
  const sqlParams = [username, password, group]

  // 执行sql语句(插入数据-添加账号)
  connection.query(sqlStr, sqlParams, (err, data) => {
    // 如有有错 抛出错误
    if (err) {
      throw err;
    } else {
      // 否则 检查是否插入成功
      // 判断 如果受影响的行数 > 0 就是插入成功了
      if (data.affectedRows > 0) {
        // 响应一个成功的数据对象回去
        res.send({"errcode": 1, "msg":"添加成功!"})
      } else {
        // 否则 就是插入失败 响应一个失败的数据对象回去
        res.send({"errcode": 0, "msg":"添加失败!"})
      }
    }
  })
});


/* 接收显示所有用户账号的请求 */
router.get('/userList', (req, res) => {
  // 构造sql (查询所有用户账号)
  const sqlStr = 'select * from users order by ctime desc';

  // 执行sql （执行查询所有用户账号数据）
  connection.query(sqlStr, (err, data) => {
    // 如果有错 抛出错误
    if (err) {
      throw err;
    } else {
      // 否则  直接把查询的所有数据 响应给前端
      res.send(data);
    }
  })
});

/* 接收单条删除的请求 */
router.get('/userDeleteOne', (req, res) => {
  // 接收前端发送过来的id
  let {id} = req.query;

  // 构造根据id删除指定数据的sql语句
  const sqlStr = `delete from users where id = ${id}`;

  // 执行sql语句（根据id单条删除）
  connection.query(sqlStr, (err, data) => {
    // 如果有错 抛出错误
    if (err) {
      throw err;
    } else {
      // 判断 如果受影响的行数 > 0 返回给前端删除成功的数据对象
      if (data.affectedRows > 0) {
        res.send({"errcode":1, "msg":"删除成功！"})
      } else {
        // 否则 返回给前端删除失败的数据对象
        res.send({"errcode":0, "msg":"删除失败！"})
      }
    }
  })
})

//修改用户账号-把原来的数据查询出来 返回给前端
router.get('/useredit',(req,res)=>{
  // 接收id
  let{id}=req.query;

  // 根据id 构造sql语句（根据id查询这一条数据的sql）
  const sqlStr=`select * from users where id = ${id}`;
  // 执行sql语句（用代码查询）
  connection.query(sqlStr,(err,data)=>{
    // 如果有错 抛出错误 否则 把查询的数据 发送给前端
    if(err){
      throw err;
    }else{
      res.send(data);
    }
  })
})

//修改用户账号-把修改后的新数据保存回去 覆盖掉原来的
router.post('/saveedit',(req,res)=>{
  // 接收前端传过来的参数
  let {username,password,group,id}=req.body;

  // 构造sql语句（根据id 修改这条数据）
  const sqlStr = `update users set username='${username}', password='${password}', groups='${group}' where id=${id}`;

  // 执行修改的sql语句
  connection.query(sqlStr,(er,data)=>{
    if(err){
      throw err;
    }else{
      if(data.affectedRows>0){
        res.send({"errcode":1, "msg":"修改成功!"})
      }else{
        res.send({"errcode":0, "msg":"修改失败!"})
      }
    }
  })
})


// 接收批量删除的数组
router.post('/batchesdel', (req, res) => {
  // 接收前端选中的需要批量删除的数据的 id 们。
  let idArr = req.body['idArr[]']

  // 构造sql 根据id们 把这些被选中的数据全部干掉
  const sqlStr = `delete from users where id in (${idArr})`;
  // 执行sql语句（批量删除）
  connection.query(sqlStr, (err, data) => {
    // 如果有错 抛出错误
    if (err) {
      throw err;
    } else {
      // 如果受影响行数大于0 （批量删除几个就是几行）就是删除成功 返回成功的数据对象
      if (data.affectedRows > 0) {
        res.send({"errcode":1, "msg":"批量删除成功!"})
      } else {
      // 否则 就是批量删除失败 返回失败的数据对象
        res.send({"errcode":0, "msg":"批量删除失败!"})
      }
    }
  })
})

module.exports = router;
