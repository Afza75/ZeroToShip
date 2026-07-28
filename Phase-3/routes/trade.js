const express = require('express');
const fs = require('fs');
const path = require('path');
const Offer = require('../models/offer');
const authGuard = require('../middleware/authGuard');

const router = express.Router();

const POSTS_DB_PATH = path.join(__dirname, '..', 'tradepost_db.json');
const OFFERS_DB_PATH = path.join(__dirname, '..', 'offers_db.json');



function loadPosts() {
  if (!fs.existsSync(POSTS_DB_PATH)) return [];
  const raw = fs.readFileSync(POSTS_DB_PATH);
  return JSON.parse(raw);
}

function loadOffers() {
  if (!fs.existsSync(OFFERS_DB_PATH)) return [];
  const raw = fs.readFileSync(OFFERS_DB_PATH);
  const text = raw.toString().trim();
  return text ? JSON.parse(text) : [];
}

function saveOffers(offers) {
  fs.writeFileSync(OFFERS_DB_PATH, JSON.stringify(offers, null, 2));
}

// ---- GET /api/posts ----
router.get('/api/posts', (req, res) => {
  const posts = loadPosts();
  res.json(posts);
});

// ---- POST /api/offers ----

router.post('/api/offers',authGuard, (req, res) => {
  const { post_id, offered_item_details } = req.body;

  if (!post_id || !offered_item_details) {
    return res.status(400).json({ error: 'post_id and offered_item_details are required' });
  }

  // Step 1: find the post being offered on
  const posts = loadPosts();
  const targetPost = posts.find(p => p.post_id === post_id);

  if (!targetPost) {
    return res.status(404).json({ error: 'Post not found' });
  }

  if (targetPost.status !== 'Open') {
    return res.status(400).json({ error: 'This post is no longer open for offers' });
  }

  // Step 2: proposer_id comes from the verified JWT, NOT from req.body
  // (req.user was attached by authGuard middleware)
  const proposerId = req.user.userId;

  // Step 3: whoever just acted (the proposer) passes the turn to the OTHER side —
  // here, that's the post's owner, since they need to respond next
  const turnHolderId = targetPost.owner_id;

  // Step 4: build the new offer
  const offers = loadOffers();
  const newOfferId = offers.length + 1;

  const newOffer = new Offer(
    newOfferId,
    post_id,
    proposerId,
    offered_item_details,
    turnHolderId
  );

  offers.push(newOffer.toDict());
  saveOffers(offers);

  res.status(201).json({ message: 'Offer submitted successfully', offer: newOffer.toDict() });
});

module.exports = router;