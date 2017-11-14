const request = require("supertest")
const assert = require("chai").assert
const server = require("../index.js")
const tsFn = require("../public/js/test_function.js")
const router = require("../router.js")

const mockReq = {location:"台北市新店區寶中路119號"}
const errMsg = "Calendar Destination is illegal"

describe("POST /getDestination", () => {
  it("should return latlng from google api", (done) => {
    request(server)
      .post("/getDestination")
      .send(mockReq)
      .expect(200)
      .end((err,res)=>{
        assert.notExists(err)
        assert.exists(res.body.position.lat)
        assert.isNumber(res.body.position.lat)
        assert.exists(res.body.position.lng)
        assert.isNumber(res.body.position.lng)
        done();
      })
  })
  it("should deny empty mockreq", (done) => {
    request(server)
    .post("/getDestination")
    .send({})
    .expect(200)
    .end((err,res)=>{
      assert.notExists(err)
      assert.equal(res.body.errMsg,errMsg)
      done();
    })
  })
})

describe('check getDateTime() function', () => {
  it('should convet correct datetime format', () => {
    assert(tsFn.getDateTime("2017/11/14 14:41:16") === "2017-11-14 14:41:16")
    assert(tsFn.getDateTime("2017-11-14 14:41:16") === "2017-11-14 14:41:16")
    assert.isFalse(tsFn.getDateTime("2017:11:14 14:41:16") === "2017-11-14 14:41:16")    
    assert.isFalse(tsFn.getDateTime("2017-11-14 14-41-16") === "2017-11-14 14:41:16")
  })
})

describe('check checkTime() function', () => {
  it('should return expiration or not', () => {
    assert(tsFn.checkTime("2018/11/14 14:41:16") > 0)
    assert(tsFn.checkTime("2200/06/14 14:41:16") > 0)
    assert(tsFn.checkTime(new Date()) === 0)    
    assert(tsFn.checkTime("2016/06/14 14:41:16") < 0)
  })
})