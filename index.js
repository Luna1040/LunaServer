const exp = require("express");
const parse = require("body-parser");
const mg = require("mongodb");
const MongoClient = require("mongodb").MongoClient;
const app = exp();
const dburl = "mongodb://localhost:27017";
// exp.static方法告诉服务器静态文件在哪里
app.use(exp.static(__dirname + "/public"));
app.use(parse.json());

app.post("/user/getUserInfo", function (req, res) {
  if (req.body.userId) {
    MongoClient.connect(dburl, {
      useNewUrlParser: true
    }, function (err, client) {
      if (err) {
        console.log(err);
        return;
      }
      const userInfo = client.db("userInfo");
      userInfo.collection("users").find({
        uid: req.body.userId
      }).toArray(function (err, resData) {
        console.log(resData);
        if (err) {
          // console.log(err);
          return;
        }
        res.send({
          status: 200,
          success: true,
          data: resData[0]
        });
      });
      client.close();
    });
  } else {
    res.send({
      status: 500,
      success: false,
      code: 1
      //身份过期请重新登录
    })
    return
  }
});

app.post("/user/register", function (req, res) {
  let data = req.body;
  MongoClient.connect(dburl, {
    useNewUrlParser: true
  }, function (err, client) {
    if (err) {
      console.log(err);
      return;
    }
    console.log("连接成功！");
    const userInfo = client.db("userInfo");
    //   test.createCollection("userInfo");
    userInfo.collection("users").insertOne(
      data,
      function (err, resData) {
        if (err) {
          console.log(err);
          return;
        }
        res.send({
          status: 200,
          success: true,
          data: resData.ops[0]
        });
        console.log(resData);

      }
    );
    client.close();
  });

});

app.listen(3000, function (err) {
  if (err) {
    console.log(err);
    return;
  }
  console.log("服务已启动");
});