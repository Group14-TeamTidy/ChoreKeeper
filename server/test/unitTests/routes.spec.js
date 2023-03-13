import Mocha from "mocha";
import chai from "chai";
import chaiHttp from "chai-http";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import makeApp from "../../index.js";
import express from "express";

chai.use(chaiHttp);
chai.use(sinonChai);
chai.should();
const expect = chai.expect;

// describe("Register Route Test", () => {
//   it("should return a success message", (done) => {
//     const app = express();
//     sinon.stub(app, "post").returns({ message: "success" });

//     chai
//       .request(app)
//       .post("/api/signup")
//       .end((err, res) => {
//         expect(res.body).to.be.a("object");
//         expect(res.body).to.have.property("message").eql("success");

//         app.get.restore();
//         done();
//       });
//   });
// });
