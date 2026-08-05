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

function savePosts(posts) {
  fs.writeFileSync(POSTS_DB_PATH, JSON.stringify(posts, null, 2));
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



// POST /api/offers/:id/counter
router.post('/api/offers/:id/counter', authGuard, (req, res) => {
  const offerId = parseInt(req.params.id);
  const { offered_item_details } = req.body;
  const requesterId = req.user.userId;

  if (!offered_item_details) {
    return res.status(400).json({ error: 'offered_item_details is required' });
  }

  const offers = loadOffers();
  const offer = offers.find(o => o.offer_id === offerId);

  if (!offer) {
    return res.status(404).json({ error: 'Offer not found' });
  }

  // Enforce turn rule: only the current turn holder can counter
  if (offer.turn_holder_id !== requesterId) {
    return res.status(403).json({ error: 'It is not your turn to act on this offer' });
  }

  // Find the post to know the two parties involved
  const posts = loadPosts();
  const post = posts.find(p => p.post_id === offer.post_id);

  // Flip the turn: whichever party isn't the current turn holder
  const otherParty = (offer.turn_holder_id === offer.proposer_id)
    ? post.owner_id
    : offer.proposer_id;

  // Update the offer in place
  offer.offered_item_details = offered_item_details;
  offer.turn_holder_id = otherParty;

  saveOffers(offers);

  res.json({ message: 'Counter-offer submitted, turn flipped', offer });
});

// POST /api/offers/:id/accept
router.post('/api/offers/:id/accept', authGuard, (req, res) => {
  const offerId = parseInt(req.params.id);
  const requesterId = req.user.userId;

  const offers = loadOffers();
  const offer = offers.find(o => o.offer_id === offerId);

  if (!offer) {
    return res.status(404).json({ error: 'Offer not found' });
  }

  // Only the current turn holder can accept
  if (offer.turn_holder_id !== requesterId) {
    return res.status(403).json({ error: 'It is not your turn to act on this offer' });
  }

  // Mark this offer as accepted
  offer.status = 'Accepted';

  // Mark the post as traded
  const posts = loadPosts();
  const post = posts.find(p => p.post_id === offer.post_id);
  if (post) {
    post.status = 'Traded';
  }

  // Auto-decline every OTHER offer on the same post
  offers.forEach(o => {
    if (o.post_id === offer.post_id && o.offer_id !== offer.offer_id) {
      o.status = 'Declined';
    }
  });

  saveOffers(offers);
  savePosts(posts); // need a savePosts helper — see note below

  res.json({ message: 'Offer accepted, rivals auto-declined', offer, post });
});
module.exports = router;