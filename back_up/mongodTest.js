const mg = require("mongodb");
const MongoClient = require("mongodb").MongoClient;

const dburl = "mongodb://localhost:27017";

MongoClient.connect(dburl, { useNewUrlParser: true }, function (err, client) {
  if (err) {
    console.log(err);
    return;
  }
  console.log("连接成功！");
  const test = client.db("test");
  //   test.createCollection("userInfo");
  test.collection("userInfo").insertMany(
    [
      { name: "卢娜", password: "1040657022" },
      { name: "素言阿姨", password: "1040657023" },
    ],
    function (err, res) {
      if (err) {
        console.log(err);
        return;
      }
      console.log(res);
    }
  );
  client.close();
});
