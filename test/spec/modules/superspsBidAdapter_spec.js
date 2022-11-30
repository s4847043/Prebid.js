import { expect } from 'chai';
import { URL, SSSPUID, spec } from '../../../modules/superspsBidAdapter.js';
import { newBidder } from '../../../src/adapters/bidderFactory.js';

describe('adapter', () => {
  const adapter = newBidder(spec);

  describe('inherited functions', () => {
    it('exists and is a function', () => {
      expect(adapter.callBids).to.exist.and.to.be.a('function');
    });
  });

  describe('buildRequests', function () {
    const bidRequest = {
      adUnitCode: 'adunitcode',
      auctionId: 'randomActionId',
      bidId: 'randomBidId',
      mediaTypes: { banner: { sizes: [[300, 250]] } },
    };

    const bidRequestWithUser = {
      adUnitCode: 'adunitcode22',
      auctionId: 'randomActionId22',
      bidId: 'randomBidId22',
      mediaTypes: { banner: { sizes: [[300, 250]] } },
      userId: {
        pubProvidedId: [
          {
            source: 'example.com',
            uids: [
              {
                id: 'id1',
                atype: 1,
                ext: {
                  stype: 'ppuid',
                },
              },
              {
                id: 'id2',
                atype: 1,
                ext: {
                  stype: 'ppuid',
                },
              },
            ],
          },
        ],
      },
    };

    let bidderRequests = {
      auctionId: '123',
      refererInfo: {
        page: 'http://mypage.org?pbjs_debug=true',
        domain: 'mypage.org',
      },
    };

    const requests = spec.buildRequests(
      [bidRequest, bidRequestWithUser],
      bidderRequests
    );


    it('has 2 requests', function () {
      expect(requests).has.lengthOf(2)
    });

    it('sends bid to defined url via POST', function () {
      expect(requests[0].method).to.equal('POST');
      expect(requests[0].url).to.equal(URL);
    });

    it('data sent are correct', () => {
      expect(requests[0].data.adUnitCode).to.equal(bidRequest.adUnitCode);
      expect(requests[0].data.bidId).to.equal(bidRequest.bidId);
      expect(requests[0].data.auctionId).to.equal(bidderRequests.auctionId);
      expect(requests[0].data.ssspUid).to.equal(SSSPUID);
    });

    it('data with user sent are correct', () => {
      expect(requests[1].data.adUnitCode).to.equal(bidRequestWithUser.adUnitCode);
      expect(requests[1].data.bidId).to.equal(bidRequestWithUser.bidId);
      expect(requests[1].data.auctionId).to.equal(bidderRequests.auctionId);
      expect(requests[1].data.ssspUid).to.equal(SSSPUID);
      expect(requests[1].data.pubProvidedIds).to.haveOwnProperty(bidRequestWithUser.userId.pubProvidedId[0].source);
      expect(requests[1].data.pubProvidedIds[bidRequestWithUser.userId.pubProvidedId[0].source]).has.lengthOf(2)
    });
  });
});
