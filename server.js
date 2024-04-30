const express = require('express');
const app = express();
const port = 3000;

const { MongoClient } = require('mongodb');
const url = 'mongodb+srv://cme1:yzIpWuoYJNjJSNS3@cluster0.0olzhgm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(url);

app.set('view engine', 'ejs');

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const methodOverride = require('method-override')
app.use(methodOverride('_method'))


app.get('/', (req, res) => {
  res.render('index.ejs');
});

const getDB = async () => {
  await client.connect()
  return client.db('todo')
}

app.get('/list', async (req, res) => {
  try {
    const db = await getDB()
    const posts = await db.collection('posts').find().sort({ _id: -1 }).toArray()
    res.render('list.ejs', { posts })
  } catch (error) {
    console.error(error);
  }
  res.render('list.ejs');
});

app.get('/detail/:id', async (req, res) => {
  const id = parseInt(req.params.id)
  try {
    const db = await getDB()
    const post = await db.collection('posts').findOne({ _id: id })
    res.render('detail.ejs', { post })
  } catch (error) {
    console.error(error);
  }
  res.render('detail.ejs');
});


app.post('/add', async (req, res) => {
  const { title, dateOfGoal, today } = req.body;
  try {
    const db = await getDB();
    const result = await db.collection('counter').findOne({ name: "counter" });
    await db.collection('posts').insertOne({ _id: result.totalPost + 1, title, dateOfGoal, today });
    await db.collection('counter').updateOne({ name: 'counter' }, { $inc: { totalPost: 1 } });
  } catch (error) {
    console.error(error);
  }
  res.redirect('/list')
})

// 삭제 기능
app.post('/delete', async (req, res) => {
  const id = parseInt(req.body.postNum);

  try {
    const db = await getDB();
    await db.collection('posts').deleteOne({ _id: id });
    res.redirect('/list');
  } catch (error) {
    console.error(error);
  }
})

// 수정 페이지
app.get('/edit/:id', async (req, res) => {
  const id = parseInt(req.params.id)

  try {
    const db = await getDB();
    const post = await db.collection('posts').findOne({ _id: id });
    res.render('edit.ejs', { post })

  } catch (error) {
    console.error(error);
  }
})

// 수정 기능
app.post('/update', async (req, res) => {
  const { id, title, dateOfGoal, today } = req.body

  try {
    const db = await getDB();
    await db.collection('posts').updateOne({ _id: parseInt(id) }, { $set: { title, dateOfGoal, today } });
    res.redirect('/list')
  } catch (error) {
    console.error(error);
  }
})

app.listen(port, () => {
  console.log(`서버실행중..... ${port}`);
});
