# Notes

## Node.js Server:
### Setup Step:
1. npm init -y
2. npm install express -save
3. create an index.js and use express on it
4. npm install --save body-parser  //due with post issue
5. program this two codes in index.js:
* app.use(bodyParser.urlencoded({ extended: false }))
* app.use(bodyParser.json())

### Use MongoDB:
1. npm install mongodb
2. npm install mongoose
3. 
client.connect(err => {
  const collection = client.db("sample_airbnb").collection("listingsAndReviews");
  collection.findOne({}, function(err, result) {
    if (err) throw err;
    res.json(result);
  });
});

### Start server
1. node index.js

## React:
### Install Babel (JSX --> JavaScript)
1. npm install --save-dev @babel/core @babel/cli
2. npx babel --watch src --out-dir . --presets react-app/prod // It will tran all the jsx file in "src" to js

