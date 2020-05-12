const exp = require("express");
const parse = require("body-parser");
const app = exp();

// exp.static方法告诉服务器静态文件在哪里
app.use(exp.static(__dirname + "/public"));
app.use(parse.json());

app.get("/userName", function (req, res) {
  res.send({
    status: 200,
    success: true,
    data: {
      name: "卢娜",
      uid: "1040657022",
    },
  });
});

app.post("/register", function (req, res) {
  console.log(req.body);
  let data = req.body;
  if (data.userName.length < 4) {
    res.send({
      status: 500,
      success: false,
      code: 2,
    });
    return;
  } else if (data.password.length < 6) {
    res.send({
      status: 500,
      success: false,
      code: 1,
    });
    return;
  }
  res.send({
    status: 200,
    success: true,
    data: {
      userId: "1040657022",
      userName: "Luna",
      uid: "777",
    },
  });
});

app.listen(3000, function (err) {
  if (err) {
    console.log(err);
    return;
  }
  console.log("服务已启动");
});
