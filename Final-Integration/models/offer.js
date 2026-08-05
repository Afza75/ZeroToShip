class Offer {
  constructor(offerId, postId, proposerId, offeredItemDetails, turnHolderId) {
    this.offerId = offerId;
    this.postId = postId;
    this.proposerId = proposerId;
    this.offeredItemDetails = offeredItemDetails;
    this.turnHolderId = turnHolderId;
  }

  toDict() {
    return {
      offer_id: this.offerId,
      post_id: this.postId,
      proposer_id: this.proposerId,
      offered_item_details: this.offeredItemDetails,
      turn_holder_id: this.turnHolderId,
    };
  }

  static fromDict(data) {
    return new Offer(
      data.offer_id,
      data.post_id,
      data.proposer_id,
      data.offered_item_details,
      data.turn_holder_id
    );
  }
}

module.exports = Offer; 