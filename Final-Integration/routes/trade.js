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
  const raw = fs.readFileSync(POSTS_DB_PATH).toString().trim();
  return raw ? JSON.parse(raw) : [];
}

function savePosts(posts) {
  fs.writeFileSync(POSTS_DB_PATH, JSON.stringify(posts, null, 2));
}

function loadOffers() {
  if (!fs.existsSync(OFFERS_DB_PATH)) return [];
  const raw = fs.readFileSync(OFFERS_DB_PATH).toString().trim();
  return raw ? JSON.parse(raw) : [];
}

function saveOffers(offers) {
  fs.writeFileSync(OFFERS_DB_PATH, JSON.stringify(offers, null, 2));
}

// ---- GET /api/posts (public) ----
router.get('/api/posts', (req, res) => {
  res.json(loadPosts());
});

// ---- GET /api/offers (protected) — returns only offers relevant to the logged-in user ----
router.get('/api/offers', authGuard, (req, res) => {
  const userId = req.user.userId;
  const offers = loadOffers();
  const posts = loadPosts();

  const myOffers = offers
    .filter(o => {
      const post = posts.find(p => p.post_id === o.post_id);
      return o.proposer_id === userId || (post && post.owner_id === userId);
    })
    .map(o => {
      const post = posts.find(p => p.post_id === o.post_id);
      return {
        ...o,
        post_title: post ? post.title : 'Unknown post',
        is_your_turn: o.turn_holder_id === userId
      };
    });

  res.json(myOffers);
});

// ---- POST /api/offers (protected) ----
router.post('/api/offers', authGuard, (req, res) => {
  const { post_id, offered_item_details } = req.body;
  const proposerId = req.user.userId;

  if (!post_id || !offered_item_details) {
    return res.status(400).json({ error: 'post_id and offered_item_details are required' });
  }

  const posts = loadPosts();
  const targetPost = posts.find(p => p.post_id === post_id);

  if (!targetPost) {
    return res.status(404).json({ error: 'Post not found' });
  }
  if (targetPost.status !== 'Open') {
    return res.status(400).json({ error: 'This post is no longer open for offers' });
  }
  // Validation: can't make an offer on your own post
  if (proposerId === targetPost.owner_id) {
    return res.status(400).json({ error: 'You cannot make an offer on your own post' });
  }

  const offers = loadOffers();
  const newOfferId = offers.length + 1;
  const turnHolderId = targetPost.owner_id;

  const newOffer = new Offer(newOfferId, post_id, proposerId, offered_item_details, turnHolderId);
  offers.push(newOffer.toDict());
  saveOffers(offers);

  res.status(201).json({ message: 'Offer submitted successfully', offer: newOffer.toDict() });
});

// ---- POST /api/offers/:id/counter (protected) ----
router.post('/api/offers/:id/counter', authGuard, (req, res) => {
  const offerId = parseInt(req.params.id);
  const { offered_item_details } = req.body;
  const requesterId = req.user.userId;

  if (!offered_item_details) {
    return res.status(400).json({ error: 'offered_item_details is required' });
  }

  const offers = loadOffers();
  const offer = offers.find(o => o.offer_id === offerId);
  if (!offer) return res.status(404).json({ error: 'Offer not found' });

  if (offer.turn_holder_id !== requesterId) {
    return res.status(403).json({ error: 'It is not your turn to act on this offer' });
  }

  const posts = loadPosts();
  const post = posts.find(p => p.post_id === offer.post_id);
  const otherParty = (offer.turn_holder_id === offer.proposer_id) ? post.owner_id : offer.proposer_id;

  offer.offered_item_details = offered_item_details;
  offer.turn_holder_id = otherParty;

  saveOffers(offers);
  res.json({ message: 'Counter-offer submitted, turn flipped', offer });
});

// ---- POST /api/offers/:id/accept (protected) ----
router.post('/api/offers/:id/accept', authGuard, (req, res) => {
  const offerId = parseInt(req.params.id);
  const requesterId = req.user.userId;

  const offers = loadOffers();
  const offer = offers.find(o => o.offer_id === offerId);
  if (!offer) return res.status(404).json({ error: 'Offer not found' });

  if (offer.turn_holder_id !== requesterId) {
    return res.status(403).json({ error: 'It is not your turn to act on this offer' });
  }
  // Validation: can't accept your own offer
  // if (requesterId === offer.proposer_id) {
  //   return res.status(400).json({ error: 'You cannot accept your own offer' });
  // }

  offer.status = 'Accepted';

  const posts = loadPosts();
  const post = posts.find(p => p.post_id === offer.post_id);
  if (post) post.status = 'Traded';

  offers.forEach(o => {
    if (o.post_id === offer.post_id && o.offer_id !== offer.offer_id) {
      o.status = 'Declined';
    }
  });

  saveOffers(offers);
  savePosts(posts);

  res.json({ message: 'Offer accepted, rivals auto-declined', offer, post });
});

module.exports = router;