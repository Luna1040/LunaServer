const exp = require("express");
const parse = require("body-parser");
const mg = require("mongodb");
const MongoClient = require("mongodb").MongoClient;
const multer = require("multer");
const fs = require("fs");
const app = exp();
const uri =
  "mongodb://LunaLovegood:Luna1040@ac-tzndspj-shard-00-00.un8n2rn.mongodb.net:27017,ac-tzndspj-shard-00-01.un8n2rn.mongodb.net:27017,ac-tzndspj-shard-00-02.un8n2rn.mongodb.net:27017/?ssl=true&replicaSet=atlas-ik07hi-shard-0&authSource=admin&retryWrites=true&w=majority";

const client = new MongoClient(uri, { useNewUrlParser: true });
// exp.static方法告诉服务器静态文件在哪里
app.use(exp.static(__dirname + "/public"));
app.use(parse.json());
function getUserInfo(req, res){
  if (req.body.company === "" || !req.body.company) {
    return res.send({
      status: 500,
      success: false,
      code: 19,
      // 用户名不能为空
    });
    const companyList = client.db("company");
  } else {
    client.connect((err) => {
      if (err) {
        return res.send({
          status: 500,
          success: false,
          code: 0,
          //未知错误
        });
      }
      const companyList = client.db("company");
      companyList
          .collection("companyList")
          .find({ id: req.body.company })
          .toArray(function (err, resData) {
            if (err) {
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
                code: 19,
                //您选择的公司已被封禁
              });
              return;
            }
            if (resData[0].status === 0) {
              return res.send({
                status: 500,
                success: false,
                code: 20,
                //您选择的公司仍在审核中
              });
            }
            if (req.body.userId) {
              client.connect((err) => {
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
                    .collection(req.body.company)
                    .find({
                      uid: req.body.userId,
                    })
                    .toArray(function (err, resData) {
                      if (err) {
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
                      delete resData[0]._id;
                      res.send({
                        status: 200,
                        success: true,
                        data: resData[0],
                      });
                    });
                client.close();
              });
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
    });
  }
}
function login(req, res){
  let data = req.body;
  if (data.company === "" || !data.company) {
    return res.send({
      status: 500,
      success: false,
      code: 19,
      // 用户名不能为空
    });
  } else {
    client.connect((err) => {
      if (err) {
        return res.send({
          status: 500,
          success: false,
          code: 0,
          //未知错误
        });
      }
      const companyList = client.db("company");
      companyList
          .collection("companyList")
          .find({ _id: req.body.company })
          .toArray(function (err, resData) {
            if (err) {
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
                code: 19,
                //您选择的公司已被封禁
              });
              return;
            }
            if (resData[0].status === 0) {
              return res.send({
                status: 500,
                success: false,
                code: 20,
                //您选择的公司仍在审核中
              });
            }
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
            client.connect((err) => {
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
              if (data.userName.indexOf("@") !== -1) {
                userInfo
                    .collection(data.company)
                    .find({
                      email: data.userName,
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
                      delete resData[0].password;
                      res.send({
                        status: 200,
                        success: true,
                        data: resData,
                      });
                    });
              } else {
                userInfo
                    .collection(data.company)
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
                      delete resData[0].password;
                      delete resData[0]._id;
                      res.send({
                        status: 200,
                        success: true,
                        data: resData[0],
                      });
                    });
              }
            });
          });
    });
  }
}
let currentOnlineUser = []

app.post("/api/user/getUserInfo", function (req, res) {
  getUserInfo(req, res)
});
app.post("/api/user/register", function (req, res) {
  let data = req.body;
  if (data.company === "" || !data.company) {
    return res.send({
      status: 500,
      success: false,
      code: 19,
      // 用户名不能为空
    });
  } else {
    client.connect((err) => {
      if (err) {
        return res.send({
          status: 500,
          success: false,
          code: 0,
          //未知错误
        });
      }
      const companyList = client.db("company");
      companyList
          .collection("companyList")
          .find({ _id: req.body.company })
          .toArray(function (err, resData) {
            console.log(resData);
            if (err) {
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
                code: 19,
                //您选择的公司已被封禁
              });
              return;
            }
            if (resData[0].status === 0) {
              return res.send({
                status: 500,
                success: false,
                code: 20,
                //您选择的公司仍在审核中
              });
            }
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
            client.connect((err) => {
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
                  .collection(data.company)
                  .find({ userName: req.body.userName })
                  .toArray(function (err, resData) {
                    if (err) {
                      res.send({
                        status: 500,
                        success: false,
                        code: 0,
                        //未知错误
                      });
                      return;
                    }
                    for (let i = 0; i < resData.length; i++) {
                      if (resData[i].userName === data.userName) {
                        res.send({
                          status: 500,
                          success: false,
                          code: 5,
                          // 用户名已存在
                        });
                        return;
                      }
                    }
                    userInfo
                        .collection(data.company)
                        .insertOne(data, function (err, resData) {
                          if (err) {
                            res.send({
                              status: 500,
                              success: false,
                              code: 0,
                              //未知错误
                            });
                            return;
                          }
                          delete resData.ops[0].password;
                          return res.send({
                            status: 200,
                            success: true,
                            data: resData.ops[0],
                          });
                        });
                  });
            });
          });
    });
  }
});
app.post("/api/user/login", function (req, res) {
  login(req, res)
});
//发送聊天内容
app.post("/api/chat/sendMessage", function (req, res) {
  let data = req.body;
  client.connect((err) => {
    if (err) {
      return res.send({
        status: 500,
        success: false,
        code: 0,
        //未知错误
      });
    }
    const chat = client.db("chat");
    let paramsTarget = JSON.parse(JSON.stringify(data))
    paramsTarget.unRead = true
    let paramsMyself = JSON.parse(JSON.stringify(data))
    chat.collection(data.chatId).insertOne(paramsTarget, function (err, resData) {
      if (err) {
        res.send({
          status: 500,
          success: false,
          code: 0,
          //未知错误
        });
      }
    });
    chat.collection(data.id).insertOne(paramsMyself, function (err, resData) {
      if (err) {
        res.send({
          status: 500,
          success: false,
          code: 0,
          //未知错误
        });
        return;
      }
      let wsData = JSON.parse(JSON.stringify(data))
      wsData.WSType='message'
      server.connections.forEach(function(conn) {
        conn.sendText(JSON.stringify(data));
      })
      return res.send({
        status: 200,
        success: true,
        data: resData.ops[0],
      });
    });
  });
});
//获取聊天内容
app.post("/api/chat/getAllMessage", function (req, res){
  let data = req.body;
  client.connect((err) => {
    if (err) {
      return res.send({
        status: 500,
        success: false,
        code: 0,
        //未知错误
      });
    }
    const chatAllList = client.db("chat");
    console.log(chatAllList.collection(''));
  })
})
//在线离线接口
app.post("/api/chat/online", function (req, res){
  let data = req.body;
  let noRepeat = true
  if(currentOnlineUser.length !== 0) {
    for (let i = 0; i < currentOnlineUser.length; i++) {
      console.log(data);
      console.log(currentOnlineUser[i]);
      if (data.id === currentOnlineUser[i].id) {
        noRepeat = false
      }
    }
  }
  if(noRepeat) {
    currentOnlineUser.push({id: data.id, userName: data.userName, userIcon: data.userIcon, userSign: data.userSign})
  }
    let body = {
      success: true,
      WSType: 'onlineUser',
      currentOnlineUser: currentOnlineUser
    }
    server.connections.forEach(function (conn) {
      conn.sendText(JSON.stringify(body));
    })
    return res.send({
      status: 200,
      success: true,
      data: body,
    });
})
app.post("/api/chat/offline", function (req, res){
  let data = req.body;
  for(let i = 0; i <= currentOnlineUser.length; i++){
    if(data.id===currentOnlineUser[i].id){
      currentOnlineUser.splice(i)
      let body = {
        success: true,
        WSType: 'onlineUser',
        currentOnlineUser: currentOnlineUser
      }
      server.connections.forEach(function(conn) {
        conn.sendText(JSON.stringify(body));
      })
      return res.send({
        status: 200,
        success: true,
        data: body,
      });
    }
  }
  return currentOnlineUser
})

// Picture upload
const createFolder = function (folder) {
  try {
    fs.accessSync(folder);
  } catch (e) {
    fs.mkdirSync(folder);
  }
};

const uploadFolder = "./public/res/";

createFolder(uploadFolder);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadFolder); // 保存的路径，备注：需要自己创建
  },
  filename: function (req, file, cb) {
    // 将保存文件名设置为 字段名 + 时间戳，比如 logo-1478521468943
    cb(
      null,
      "Luna" +
        Date.now() +
        "." +
        file.originalname.split(".")[file.originalname.split(".").length - 1]
    );
  },
});
const upload = multer({ storage: storage });

app.post("/upload", upload.single("logo"), function (req, res, next) {
  const file = req.file;
  res.send({
    success: true,
    url: "https://lunagarden.net/res/" + file.filename,
  });
});
app.get("/form", function (req, res, next) {
  var form = fs.readFileSync("./form.html", { encoding: "utf8" });
  res.send(form);
});
app.listen(3000,'0.0.0.0', function (err) {
  if (err) {
    return;
  }
  console.log("Service is started");
});
//websocket
const ws = require("nodejs-websocket");
console.log("Starting Connecting...")
const server = ws.createServer(function(conn){
  conn.on("text", function (str) {})
  conn.on("close", function (code, reason) {
    console.log("close connect")
  });
  conn.on("error", function (code, reason) {
    console.log("error")
  });
}).listen(3001,'0.0.0.0')
console.log("WebSocket is connected")