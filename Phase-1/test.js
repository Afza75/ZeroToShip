const fs = require('fs');
const Post = require('./models/post');
const Offer = require('./models/offer');

const post1 = new Post(1, "Guitar for trade", "Acoustic, good condition", 5, "Open");
const offer1 = new Offer(1, 1, 8, "Wireless headphones + charger", 5);

const post1Dict = post1.toDict();
const offer1Dict = offer1.toDict();

console.log("Post as dictionary:", post1Dict);
console.log("Offer as dictionary:", offer1Dict);

const dbData = {
  posts: [post1Dict],
  offers: [offer1Dict],
};

fs.writeFileSync('tradepost_db.json', JSON.stringify(dbData, null, 2));
console.log("\nSaved to tradepost_db.json");

const rawData = fs.readFileSync('tradepost_db.json');
const parsedData = JSON.parse(rawData);


const rebuiltPost = Post.fromDict(parsedData.posts[0]);
const rebuiltOffer = Offer.fromDict(parsedData.offers[0]);

console.log("\nRebuilt Post object:", rebuiltPost);
console.log("Rebuilt Offer object:", rebuiltOffer);