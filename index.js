const exp = require("express");
const parse = require("body-parser");
const mg = require("mongodb");
const MongoClient = require("mongodb").MongoClient;
const ws = require('nodejs-websocket')
const multer  = require('multer')
const fs = require('fs');
const app = exp();
const uri = "mongodb+srv://LunaLovegood:Luna1040@realmcluster.2vupt.mongodb.net/RealmCluster?retryWrites=true&w=majority";
const client = new MongoClient(uri, {useNewUrlParser: true});
// exp.static方法告诉服务器静态文件在哪里
app.use(exp.static(__dirname + "/public"));
app.use(parse.json());

// 已验证大多数情况
app.post("/api/user/getUserInfo", function (req, res) {
    if (req.body.company === "" || !req.body.company) {
        return res.send({
            status: 500,
            success: false,
            code: 19,
            // 用户名不能为空
        });
    } else {
        client.connect(err => {
            if (err) {
                return res.send({
                    status: 500,
                    success: false,
                    code: 0,
                    //未知错误
                });
            }
            const companyList = client.db("company");
            companyList.collection("lists").find({id: req.body.company}).toArray(function (err, resData) {
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
                    })
                    return;
                }
                if (resData[0].status === 0) {
                    return res.send({
                        status: 500,
                        success: false,
                        code: 20,
                        //您选择的公司仍在审核中
                    })
                }
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
            })
        })
    }
});
// 已验证大多数情况
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
        client.connect(err => {
            if (err) {
                return res.send({
                    status: 500,
                    success: false,
                    code: 0,
                    //未知错误
                });
            }
            const companyList = client.db("company");
            companyList.collection("lists").find({id: req.body.company}).toArray(function (err, resData) {
                if (err) {
                    res.send({
                        status: 500,
                        success: false,
                        code: 0,
                        //未知错误
                    });
                    return;
                }
                if(resData.length === 0) {

                    res.send({
                        status: 500,
                        success: false,
                        code: 19,
                        //您选择的公司已被封禁
                    })
                    return;
                }
                if(resData[0].status === 0) {
                    return res.send({
                        status: 500,
                        success: false,
                        code: 20,
                        //您选择的公司仍在审核中
                    })
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
                    userInfo.collection(data.company).find({userName: req.body.userName,}).toArray(function (err, resData) {
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
                        userInfo.collection(data.company).insertOne(data, function (err, resData) {
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
                    })
                })
            })
        })
    }
});
// 已验证大多数情况
app.post("/api/user/login", function (req, res) {
    let data = req.body;
    if (data.company === "" || !data.company) {
        return res.send({
            status: 500,
            success: false,
            code: 19,
            // 用户名不能为空
        });
    } else {
        client.connect(err => {
            if (err) {
                return res.send({
                    status: 500,
                    success: false,
                    code: 0,
                    //未知错误
                });
            }
            const companyList = client.db("company");
            companyList.collection("lists").find({id: req.body.company}).toArray(function (err, resData) {
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
                    })
                    return;
                }
                if (resData[0].status === 0) {
                    return res.send({
                        status: 500,
                        success: false,
                        code: 20,
                        //您选择的公司仍在审核中
                    })
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
                                delete resData[0].password
                                res.send({
                                    status: 200,
                                    success: true,
                                    data: resData[0],
                                });
                            });
                    }
                })
            })
        })
    }
});
// 正在测试
app.post('/api/home/addProject', function (req, res) {
    let data = req.body;
    if (!data.uid) {
        res.send({
            status: 500,
            success: false,
            code: 1
            //无法获取uid，初始化创建人失败
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
        const project = client.db("project");
        project.collection('projectList').find().toArray(function (err, resData) {
            for (let i = 0; i < resData.length; i++) {
                if (resData[i].id === data.id) {
                    res.send({
                        status: 500,
                        success: false,
                        code: 2,
                        //项目ID重复
                    });
                    return
                }
                if (resData[i].projectName === data.projectName) {
                    res.send({
                        status: 500,
                        success: false,
                        code: 3,
                        //已有的项目名称
                    });
                    return
                }
            }
        })
        let params = {
            creatorID: data.creatorID,
            creatorName: data.creatorName,
            id: data.id,
            projectName: data.projectName,
            important: data.important,
            projectMember: data.projectMember,
            projectOwnerID: data.projectOwnerID,
            projectOwnerName: data.projectOwnerName,
            // 以下非前端传输字段
            createTime: Date.parse(new Date()),
            finished: 0,
            todoList: [],
            lastUpdatedTime: '--'
        }
        project.collection('projectList').insertOne(params, function (err, resData) {
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
});
app.post('/api/home/getProjectList', function (req, res) {
    let data = req.body;
    if (!data.uid) {
        res.send({
            status: 500,
            success: false,
            code: 1
            //无法获取uid，权限验证失败
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
                if (resData[i].id === data.id) {
                    res.send({
                        status: 200,
                        success: true,
                        data: resData[i]
                    });
                    return
                }
            }
            res.send({
                status: 500,
                success: false,
                code: 2,
                // 未找到所查询的项目
            })
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
                if (resData[i].id === data.id) {
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
});
const createFolder = function(folder){
    try{
        fs.accessSync(folder);
    }catch(e){
        fs.mkdirSync(folder);
    }
};

const uploadFolder = './public/res/'

createFolder(uploadFolder);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadFolder);    // 保存的路径，备注：需要自己创建
    },
    filename: function (req, file, cb) {
        // 将保存文件名设置为 字段名 + 时间戳，比如 logo-1478521468943
        cb(null, 'Luna' + Date.now() + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1]);
    }
});
const upload = multer({ storage: storage});

app.post('/upload', upload.single('logo'), function(req, res, next){
    const file = req.file;
    res.send({success: true, url: 'https://lunagarden.net/res/'+file.filename});
});

app.get('/form', function(req, res, next){
    var form = fs.readFileSync('./form.html', {encoding: 'utf8'});
    res.send(form);
});
app.listen(3000, function (err) {
    if (err) {
        return;
    }
    console.log("服务已启动");
});

var game1 = null, game2 = null, game1Ready = false, game2Ready = false;
var server = ws.createServer(function (conn) {
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

function boardcast(str) {
    server.connections.forEach((conn) => {
        conn.sendText(str);
    });
}

