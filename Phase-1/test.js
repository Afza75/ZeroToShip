const fs = require('fs');
const Post = require('./models/post');
const Offer = require('./models/offer');

// Step 1: Create sample objects
const post1 = new Post(1, "Guitar for trade", "Acoustic, good condition", 5, "Open");
const offer1 = new Offer(1, 1, 8, "Wireless headphones + charger", 5);

// Step 2: Convert to plain dictionaries
const post1Dict = post1.toDict();
const offer1Dict = offer1.toDict();

// Step 3: Print them to check (sanity check before saving)
console.log("Post as dictionary:", post1Dict);
console.log("Offer as dictionary:", offer1Dict);

// Step 4: Build the data structure to save (arrays, since there could be many posts/offers)
const dbData = {
  posts: [post1Dict],
  offers: [offer1Dict],
};

// Step 5: Save to tradepost_db.json (convert object -> JSON text first)
fs.writeFileSync('tradepost_db.json', JSON.stringify(dbData, null, 2));
console.log("\n✅ Saved to tradepost_db.json");

// Step 6: Read the file back (comes back as raw text)
const rawData = fs.readFileSync('tradepost_db.json');

// Step 7: Parse text back into a plain JS object
const parsedData = JSON.parse(rawData);

// Step 8: Rebuild real class objects using fromDict()
const rebuiltPost = Post.fromDict(parsedData.posts[0]);
const rebuiltOffer = Offer.fromDict(parsedData.offers[0]);

// Step 9: Confirm the round trip worked
console.log("\nRebuilt Post object:", rebuiltPost);
console.log("Rebuilt Offer object:", rebuiltOffer);