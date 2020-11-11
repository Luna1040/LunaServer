const exp = require("express");
const parse = require("body-parser");
const mg = require("mongodb");
const MongoClient = require("mongodb").MongoClient;
const ws = require('nodejs-websocket')
const app = exp();
const uri = "mongodb+srv://LunaLovegood:<password>@realmcluster.2vupt.mongodb.net/<dbname>?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true });
// exp.static方法告诉服务器静态文件在哪里
app.use(exp.static(__dirname + "/public"));
app.use(parse.json());

app.post("/api/user/getUserInfo", function (req, res) {
  if (req.body.userId) {
    client.connect(err => {
      if (err) {
        res.send({
          status: 500,
          success: false,
          code: 0,
          //未知错误
        });
        return;
      }
      const userInfo = client.db("userInfo");
      userInfo
          .collection("users")
          .find({
            uid: req.body.userId,
          })
          .toArray(function (err, resData) {
            console.log(resData);
            if (err) {
              console.log(err);
              res.send({
                status: 500,
                success: false,
                code: 0,
                //未知错误
              });
              return;
            }
            if (resData.length === 0) {
              res.send({
                status: 500,
                success: false,
                code: 2,
                //无法获取用户信息，请重新登录！
              });
            }
            delete resData[0].password;
            res.send({
              status: 200,
              success: true,
              data: resData[0],
            });
          });
      client.close();
    });
    // MongoClient.connect(
    //     dburl, {
    //       useNewUrlParser: true,
    //     },
    //     function (err, client) {
    //       if (err) {
    //         res.send({
    //           status: 500,
    //           success: false,
    //           code: 0,
    //           //未知错误
    //         });
    //         return;
    //       }
    //       const userInfo = client.db("userInfo");
    //       userInfo
    //           .collection("users")
    //           .find({
    //             uid: req.body.userId,
    //           })
    //           .toArray(function (err, resData) {
    //             console.log(resData);
    //             if (err) {
    //               console.log(err);
    //               res.send({
    //                 status: 500,
    //                 success: false,
    //                 code: 0,
    //                 //未知错误
    //               });
    //               return;
    //             }
    //             if (resData.length === 0) {
    //               res.send({
    //                 status: 500,
    //                 success: false,
    //                 code: 2,
    //                 //无法获取用户信息，请重新登录！
    //               });
    //             }
    //             delete resData[0].password;
    //             res.send({
    //               status: 200,
    //               success: true,
    //               data: resData[0],
    //             });
    //           });
    //       client.close();
    //     }
    // );
  } else {
    res.send({
      status: 500,
      success: false,
      code: 1,
      //身份过期请重新登录
    });
    return;
  }
});
app.post("/api/user/register", function (req, res) {
  let data = req.body;
  console.log(data);
  if (data.userName === "" || !data.userName) {
    res.send({
      status: 500,
      success: false,
      code: 1,
      // 用户名不能为空
    });
    return;
  }
  if (data.userName.length < 4) {
    res.send({
      status: 500,
      success: false,
      code: 2,
      // 用户名不能少于4位
    });
    return;
  }
  if (data.userName.length > 20) {
    res.send({
      status: 500,
      success: false,
      code: 3,
      // 用户名不能多余20位
    });
    return;
  }
  if (data.password === "" || !data.password) {
    res.send({
      status: 500,
      success: false,
      code: 6,
      // 密码不能为空
    });
    return;
  }
  client.connect(err => {
    if (err) {
      console.log(err);
      res.send({
        status: 500,
        success: false,
        code: 0,
        //未知错误
      });
      return;
    }
    const userInfo = client.db("userInfo");
    userInfo
        .collection("users")
        .find({
          userName: req.body.userName,
        })
        .toArray(function (err, resData) {
          if (err) {
            console.log(err);
            res.send({
              status: 500,
              success: false,
              code: 0,
              //未知错误
            });
            return;
          }
          if (resData.length !== 0) {
            res.send({
              status: 500,
              success: false,
              code: 5,
              // 用户名已存在
            });
            return;
          }
        });
    userInfo.collection("users").insertOne(data, function (err, resData) {
      if (err) {
        return;
      }
      delete resData.ops[0].password;
      res.send({
        status: 200,
        success: true,
        data: resData.ops[0],
      });
      console.log(resData);
    });
  })
  // MongoClient.connect(
  //   dburl, {
  //     useNewUrlParser: true,
  //   },
  //   function (err, client) {
  //     if (err) {
  //       console.log(err);
  //       res.send({
  //         status: 500,
  //         success: false,
  //         code: 0,
  //         //未知错误
  //       });
  //       return;
  //     }
  //     const userInfo = client.db("userInfo");
  //     userInfo
  //       .collection("users")
  //       .find({
  //         userName: req.body.userName,
  //       })
  //       .toArray(function (err, resData) {
  //         if (err) {
  //           console.log(err);
  //           res.send({
  //             status: 500,
  //             success: false,
  //             code: 0,
  //             //未知错误
  //           });
  //           return;
  //         }
  //         if (resData.length !== 0) {
  //           res.send({
  //             status: 500,
  //             success: false,
  //             code: 5,
  //             // 用户名已存在
  //           });
  //           return;
  //         }
  //       });
  //     userInfo.collection("users").insertOne(data, function (err, resData) {
  //       if (err) {
  //         return;
  //       }
  //       delete resData.ops[0].password;
  //       res.send({
  //         status: 200,
  //         success: true,
  //         data: resData.ops[0],
  //       });
  //       console.log(resData);
  //     });
  //     client.close();
  //   }
  // );
});
app.post("/api/user/login", function (req, res) {
  let data = req.body;
  if (data.userName === "" || !data.userName) {
    res.send({
      status: 500,
      success: false,
      code: 1,
      // 用户名不能为空
    });
    return;
  }
  if (data.password === "" || !data.password) {
    res.send({
      status: 500,
      success: false,
      code: 3,
      // 密码不能为空
    });
    return;
  }
  client.connect(err => {
    if (err) {
      console.log(err);
      res.send({
        status: 500,
        success: false,
        code: 0,
        //未知错误
      });
      return;
    }
    console.log("连接成功！");
    const userInfo = client.db("userInfo");
    if (data.userName.indexOf("@") !== -1) {
      userInfo
          .collection("users")
          .find({
            email: data.userName,
          })
          .toArray(function (err, resData) {
            console.log(resData);
            if (resData.length === 0) {
              res.send({
                status: 500,
                success: false,
                code: 2,
                // 用户名或邮箱错误
              });
              return;
            }
            if (resData[0].password !== data.password) {
              res.send({
                status: 500,
                success: false,
                code: 4,
                // 密码错误！
              });
              return;
            }
            delete resData[0].password;
            res.send({
              status: 200,
              success: true,
              data: resData,
            });
          });
    } else {
      userInfo
          .collection("users")
          .find({
            userName: data.userName,
          })
          .toArray(function (err, resData) {
            if (resData.length === 0) {
              res.send({
                status: 500,
                success: false,
                code: 2,
                // 用户名或邮箱错误
              });
              return;
            }
            if (resData[0].password !== data.password) {
              res.send({
                status: 500,
                success: false,
                code: 4,
                // 密码错误！
              });
              return;
            }
            res.send({
              status: 200,
              success: true,
              data: resData,
            });
          });
    }
  })
  // MongoClient.connect(
  //   dburl, {
  //     useNewUrlParser: true,
  //   },
  //   function (err, client) {
  //     if (err) {
  //       console.log(err);
  //       return;
  //     }
  //     console.log("连接成功！");
  //     const userInfo = client.db("userInfo");
  //     if (data.userName.indexOf("@") !== -1) {
  //       userInfo
  //         .collection("users")
  //         .find({
  //           email: data.userName,
  //         })
  //         .toArray(function (err, resData) {
  //           console.log(resData);
  //           if (resData.length === 0) {
  //             res.send({
  //               status: 500,
  //               success: false,
  //               code: 2,
  //               // 用户名或邮箱错误
  //             });
  //             return;
  //           }
  //           if (resData[0].password !== data.password) {
  //             res.send({
  //               status: 500,
  //               success: false,
  //               code: 4,
  //               // 密码错误！
  //             });
  //             return;
  //           }
  //           delete resData[0].password;
  //           res.send({
  //             status: 200,
  //             success: true,
  //             data: resData,
  //           });
  //         });
  //     } else {
  //       userInfo
  //         .collection("users")
  //         .find({
  //           userName: data.userName,
  //         })
  //         .toArray(function (err, resData) {
  //           if (resData.length === 0) {
  //             res.send({
  //               status: 500,
  //               success: false,
  //               code: 2,
  //               // 用户名或邮箱错误
  //             });
  //             return;
  //           }
  //           if (resData[0].password !== data.password) {
  //             res.send({
  //               status: 500,
  //               success: false,
  //               code: 4,
  //               // 密码错误！
  //             });
  //             return;
  //           }
  //           res.send({
  //             status: 200,
  //             success: true,
  //             data: resData,
  //           });
  //         });
  //     }
  //   }
  // );
});
app.post('/api/home/addTodoList', function (req, res) {
  let data = req.body;
  if (!data.uid) {
    res.send({
      status: 500,
      success: false,
      code: 1
      //无法获取uid
    })
    return
  }
  if (!data.content) {
    res.send({
      status: 500,
      success: false,
      code: 2,
      //无法获取todoList
    })
    return
  }
  client.connect(err => {
    if (err) {
      res.send({
        status: 500,
        success: false,
        code: 0,
        //未知错误
      });
      return;
    }
    const todoList = client.db("todoList");
    todoList.collection(data.uid).find().toArray(function (err, resData) {
      for (let i = 0; i < resData.length; i++) {
        if(resData[i].id === data.id) {
          res.send({
            status: 500,
            success: false,
            code: 3,
            //ID重复
          });
          return
        }
      }
    })
    todoList.collection(data.uid).insertOne(data, function (err, resData) {
      if (err) {
        res.send({
          status: 500,
          success: false,
          code: 0,
          //未知错误
        });
        return;
      }
      res.send({
        status: 200,
        success: true
      })
    })
  })
  //   MongoClient.connect(
  //   dburl, {
  //     useNewUrlParser: true,
  //   },
  //   function (err, client) {
  //     if (err) {
  //       res.send({
  //         status: 500,
  //         success: false,
  //         code: 0,
  //         //未知错误
  //       });
  //       return;
  //     }
  //     const todoList = client.db("todoList");
  //     todoList.collection(data.uid).find().toArray(function (err, resData) {
  //       for (let i = 0; i < resData.length; i++) {
  //         if(resData[i].id === data.id) {
  //           res.send({
  //             status: 500,
  //             success: false,
  //             code: 3,
  //             //ID重复
  //           });
  //           return
  //         }
  //       }
  //     })
  //     todoList.collection(data.uid).insertOne(data, function (err, resData) {
  //       if (err) {
  //         res.send({
  //           status: 500,
  //           success: false,
  //           code: 0,
  //           //未知错误
  //         });
  //         return;
  //       }
  //       res.send({
  //         status: 200,
  //         success: true
  //       })
  //     })
  //   }
  // );
});
app.post('/api/home/getTodoList', function (req, res) {
  let data = req.body;
  if (!data.uid) {
    res.send({
      status: 500,
      success: false,
      code: 1
      //无法获取uid
    })
    return
  }
  client.connect(err => {
    if (err) {
      res.send({
        status: 500,
        success: false,
        code: 0,
        //未知错误
      });
      return;
    }
    let uid = data.uid
    const todoList = client.db("todoList");
    todoList.collection(uid).find().toArray(function (err, resData) {
      if (err) {
        res.send({
          status: 500,
          success: false,
          code: 0,
          //未知错误
        });
        return;
      }
      resData.forEach((item, index) => {
        delete resData[index]._id
      })
      res.send({
        status: 200,
        success: true,
        data: resData
      })
    })
  })
  //   MongoClient.connect(
  //   dburl, {
  //     useNewUrlParser: true,
  //   },
  //   function (err, client) {
  //     if (err) {
  //       res.send({
  //         status: 500,
  //         success: false,
  //         code: 0,
  //         //未知错误
  //       });
  //       return;
  //     }
  //     let uid = data.uid
  //     const todoList = client.db("todoList");
  //     todoList.collection(uid).find().toArray(function (err, resData) {
  //       if (err) {
  //         res.send({
  //           status: 500,
  //           success: false,
  //           code: 0,
  //           //未知错误
  //         });
  //         return;
  //       }
  //       resData.forEach((item, index) => {
  //         delete resData[index]._id
  //       })
  //       res.send({
  //         status: 200,
  //         success: true,
  //         data: resData
  //       })
  //     })
  //   }
  // );
});
app.listen(3000, function (err) {
  if (err) {
    console.log(err);
    return;
  }
  console.log("服务已启动");
});

var game1 = null,game2 = null , game1Ready = false , game2Ready = false;
var server = ws.createServer(function(conn){
    conn.on("text", function (str) {
        conn.send(str)
        boardcast(str)
    })
    conn.on("close", function (code, reason) {
        console.log("关闭连接")
    });
    conn.on("error", function (code, reason) {
        console.log("异常关闭")
    });
}).listen(3001)

function boardcast(str){
  server.connections.forEach((conn)=>{
      conn.sendText(str);
  });
}
