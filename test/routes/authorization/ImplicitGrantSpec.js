/**
 * Implicit Grant
 *
 * The OAuth 2.0 Authorization Framework
 * http://tools.ietf.org/html/rfc6749#section-4.2
 */

/**
 * Test dependencies
 */

var cwd = process.cwd()
  , path = require('path')
  , chai = require('chai')
  , expect = chai.expect
  , request = require('supertest')
  , app = require(path.join(cwd, 'app'))
  , User = require(path.join(cwd, 'models/User'))   
  , Client = require(path.join(cwd, 'models/Client'))   
  ;


describe('implicit grant', function () {


  var credentials = { email: 'smith@anvil.io', password: 'secret' }

  before(function (done) {
    User.backend.reset();
    Client.backend.reset();
    User.create(credentials, function () {
      Client.create({ 
        _id: 'thirdparty', 
        type: 'confidential',
        redirect_uri: 'https://app.tld/callback'
      }, function (e, c) {
        done()
      });      
    })
  });


  describe('GET /authorize', function () {

    it('should require SSL');


    describe('with text/html content-type', function () {

      before(function (done) {
        request(app)
          .get('/authorize')
          .end(function (error, response) {
            err = error;
            res = response;
            done();
          });
      });

      it('should respond 200', function () {
        res.statusCode.should.equal(200);
      });

      it('should respond with HTML', function () {
        res.headers['content-type'].should.contain('text/html');
      });

    });



    describe('with application/json content-type', function () {

      describe('with valid request', function () {

        before(function (done) {
          request(app)
            .get('/authorize?client_id=thirdparty&response_type=token&redirect_uri=https://app.tld/callback')
            .set('Content-type', 'application/json')            
            .end(function (error, response) {
              err = error;
              res = response;
              done();
            });
        });

        it('should respond 200', function () {
          res.statusCode.should.equal(200);
        });

        it('should respond with JSON', function () {
          res.headers['content-type'].should.contain('application/json');
        });

        it('should respond with client info');
        it('should respond with scope descriptions');

      });
  
      describe('with unsupported response type', function () {

        before(function (done) {
          request(app)
            .get('/authorize?client_id=thirdparty&response_type=invalid')
            .set('Content-type', 'application/json')            
            .end(function (error, response) {
              err = error;
              res = response;
              done();
            });
        });

        it('should respond 501', function () {
          res.statusCode.should.equal(501);
        });

        it('should respond with JSON', function () {
          res.headers['content-type'].should.contain('application/json');
        });

        it('should redirect to the redirect uri');

        it('should respond with an "unsupported_response_type" error', function () {
          res.body.error.should.equal('unsupported_response_type');
        });

        it('should respond with an error description', function () {
          res.body.error_description.should.equal('Unsupported response type');
        });

        it('should respond with an error uri');
        it('should respond with "state" provided by the client');
      });
  
      describe('with missing response type', function () {

        before(function (done) {
          request(app)
            .get('/authorize?client_id=thirdparty')
            .set('Content-type', 'application/json')            
            .end(function (error, response) {
              err = error;
              res = response;
              done();
            });
        });

        it('should respond 501', function () {
          res.statusCode.should.equal(501);
        });

        it('should respond with JSON', function () {
          res.headers['content-type'].should.contain('application/json');
        });

        it('should redirect to the redirect uri');

        it('should respond with an "invalid request" error', function () {
          res.body.error.should.equal('invalid_request');
        });

        it('should respond with an error description', function () {
          res.body.error_description.should.equal('Missing response type');
        });

        it('should respond with an error uri');
        it('should respond with "state" provided by the client');

      });
  
  
      describe('with invalid client id', function () {

        before(function (done) {
          request(app)
            .get('/authorize?client_id=unknown')
            .set('Content-type', 'application/json')            
            .end(function (error, response) {
              err = error;
              res = response;
              done();
            });
        });

        it('should respond 403', function () {
          res.statusCode.should.equal(403);
        });

        it('should respond with JSON', function () {
          res.headers['content-type'].should.contain('application/json');
        });

        it('should NOT redirect', function () {
          res.statusCode.should.not.equal(302);
        });

        it('should respond with an "unauthorized_client" error', function () {
          res.body.error.should.equal('unauthorized_client');
        });
        
        it('should respond with an error description', function () {
          res.body.error_description.should.equal('Unknown client');
        });

        it('should respond with an error uri');
        it('should respond with "state" provided by the client');
      });
  
  
      describe('with missing client id', function () {

        before(function (done) {
          request(app)
            .get('/authorize')
            .set('Content-type', 'application/json')   
            .end(function (error, response) {
              err = error;
              res = response;
              done();
            });
        });

        it('should respond 403', function () {
          res.statusCode.should.equal(403);
        });

        it('should respond with JSON', function () {
          res.headers['content-type'].should.contain('application/json');
        });

        it('should NOT redirect', function () {
          res.statusCode.should.not.equal(302);
        });

        it('should respond with an "unauthorized_client" error', function () {
          res.body.error.should.equal('unauthorized_client');
        });
        
        it('should respond with an error description', function () {
          res.body.error_description.should.equal('Missing client id');
        });

        it('should respond with an error uri');
        it('should respond with "state" provided by the client');

      });
  
      describe('with mismatching redirect uri', function () {

        before(function (done) {
          request(app)
            .get('/authorize?client_id=thirdparty&response_type=token&redirect_uri=wrong')
            .set('Content-type', 'application/json')            
            .end(function (error, response) {
              err = error;
              res = response;
              done();
            });
        });

        it('should respond 400', function () {
          res.statusCode.should.equal(400);
        });

        it('should respond with JSON', function () {
          res.headers['content-type'].should.contain('application/json');
        });

        it('should NOT redirect', function () {
          res.statusCode.should.not.equal(302);
        });
        
        it('should respond with an "invalid request" error', function () {
          res.body.error.should.equal('invalid_request');
        });

        it('should respond with an error description', function () {
          res.body.error_description.should.equal('Mismatching redirect uri');
        });

        it('should respond with an error uri');
        it('should respond with "state" provided by the client');      
      });
  
      describe('with missing redirect uri', function () {

        before(function (done) {
          request(app)
            .get('/authorize?client_id=thirdparty&response_type=token')
            .set('Content-type', 'application/json')            
            .end(function (error, response) {
              err = error;
              res = response;
              done();
            });
        });

        it('should respond 400', function () {
          res.statusCode.should.equal(400);
        });

        it('should respond with JSON', function () {
          res.headers['content-type'].should.contain('application/json');
        });

        it('should NOT redirect', function () {
          res.statusCode.should.not.equal(302);
        });

        it('should respond with an "invalid request" error', function () {
          res.body.error.should.equal('invalid_request');
        });

        it('should respond with an error description', function () {
          res.body.error_description.should.equal('Missing redirect uri');
        });

        it('should respond with an error uri');
        it('should respond with "state" provided by the client');   

      });
  
      describe('with invalid redirect uri', function () {
        it('should NOT redirect');
        it('should respond with an "invalid_request" error');
        it('should respond with an error description');
        it('should respond with an error uri');
        it('should respond with "state" provided by the client');
      });
  
      describe('with missing state', function () {
        it('should redirect to the redirect uri');
        it('should respond with an "invalid request" error');
        it('should respond with an error description');
        it('should respond with an error uri');
      });
  
      describe('when scope is required', function () {
  
        describe('with invalid scope', function () {
          it('should redirect to the redirect uri');
          it('should respond with an "invalid_scope" error');
          it('should respond with an error description');
          it('should respond with an error uri');
          it('should respond with "state" provided by the client');        
        });
  
        describe('with missing scope', function () {
          it('should redirect to the redirect uri');
          it('should respond with an "invalid_scope" error');
          it('should respond with an error description');
          it('should respond with an error uri');
          it('should respond with "state" provided by the client');        
        });
  
        describe('with excess scope', function () {
          it('should ???')
        });
  
      });
  
    });

  });





  describe('POST /authorize', function () {

    var agent = request.agent()

    it('should require SSL');


    describe('when authorization granted', function () {

      before(function (done) {
        request(app)
          .post('/login')
          .send(credentials)
          .end(function (e,r) {
            agent.saveCookies(r);
            var req = request(app).post('/authorize')
            agent.attachCookies(req);
            req.set('Content-type', 'application/json')
            req.send({
              authorized: true,
              client_id: 'thirdparty',
              response_type: 'token',                
              redirect_uri: 'https://app.tld/callback' 
            })
            req.end(function (error, response) {
              err = error;
              res = response;

              console.log(res.body)

              done();
            });
          });
      });

      it('should respond 302', function () {
        res.statusCode.should.equal(302);
      });

      it('should redirect to the redirect uri', function () {
        res.headers.location.should.contain('https://app.tld/callback');
      });

      it('should respond with an access token', function () {
        res.headers.location.should.contain('access_token='); // can we use a regexp to match the token?
      });
      
      it('should respond with a token type', function () {
        res.headers.location.should.contain('token_type=bearer');
      });
      
      it('should respond with an expiration', function () {
        //res.headers.location.should.contain('expires_in=3600');
      });

      it('should respond with a scope', function () {
        //res.headers.location.should.contain('scope=');
      });
      
      it('should respond with state');
    });

    describe('with "access denied" request', function () {

      before(function (done) {
        request(app)
          .post('/login')
          .send(credentials)
          .end(function (e,r) {
            agent.saveCookies(r);
            var req = request(app).post('/authorize')
            agent.attachCookies(req);
            req.set('Content-type', 'application/json')
            req.send({ 
              authorized: false,
              client_id: 'thirdparty',
              response_type: 'token',                
              redirect_uri: 'https://app.tld/callback'
            })
            req.end(function (error, response) {
              err = error;
              res = response;
              done();
            });
          });
      });

      it('should respond 302', function () {
        res.statusCode.should.equal(302);
      });

      it('should redirect to the redirect uri', function () {
        res.headers.location.should.contain('https://app.tld/callback');
      });

      it('should respond with an "access denied" error', function () {
        res.headers.location.should.contain('error=access_denied');
      });

      it('should respond with an error description');
      it('should respond with an error uri');
      it('should respond with "state" provided by the client');  
    });

    describe('with unauthenticated user', function () {

      before(function (done) {
        request(app)
          .post('/authorize')
          .end(function (error, response) {
            err = error;
            res = response;
            done()
          });
      });

      it('should respond 401', function () {
        res.statusCode.should.equal(401);
      });

      it('should respond "Unauthorized"', function () {
        res.text.should.equal('Unauthorized');
      });

    });


    describe('with unsupported response type', function () {

      before(function (done) {
        request(app)
          .post('/login')
          .send(credentials)
          .end(function (e,r) {
            agent.saveCookies(r);
            var req = request(app).post('/authorize')
            agent.attachCookies(req);
            req.set('Content-type', 'application/json')
            req.send({ 
              client_id: 'thirdparty',
              response_type: 'invalid',                
              redirect_uri: 'https://localhost:3001/callback.html'
            })
            req.end(function (error, response) {
              err = error;
              res = response;
              done();
            });
          });
      });

      it('should respond 501', function () {
        res.statusCode.should.equal(501);
      });

      it('should respond with JSON', function () {
        res.headers['content-type'].should.contain('application/json');
      });

      it('should redirect to the redirect uri');

      it('should respond with an "unsupported_response_type" error', function () {
        res.body.error.should.equal('unsupported_response_type');
      });

      it('should respond with an error description', function () {
        res.body.error_description.should.equal('Unsupported response type');
      });

      it('should respond with an error uri');
      it('should respond with "state" provided by the client');

    });


    describe('with missing response type', function () {

      before(function (done) {
        request(app)
          .post('/login')
          .send(credentials)
          .end(function (e,r) {
            agent.saveCookies(r);
            var req = request(app).post('/authorize')
            agent.attachCookies(req);
            req.set('Content-type', 'application/json')
            req.send({ 
              client_id: 'thirdparty',               
              redirect_uri: 'https://localhost:3001/callback.html'
            })
            req.end(function (error, response) {
              err = error;
              res = response;
              done();
            });
          });
      });

      it('should respond 501', function () {
        res.statusCode.should.equal(501);
      });

      it('should respond with JSON', function () {
        res.headers['content-type'].should.contain('application/json');
      });

      it('should redirect to the redirect uri');

      it('should respond with an "invalid request" error', function () {
        res.body.error.should.equal('invalid_request');
      });

      it('should respond with an error description', function () {
        res.body.error_description.should.equal('Missing response type');
      });

      it('should respond with an error uri');
      it('should respond with "state" provided by the client');

    });


    describe('with invalid client id', function () {

      before(function (done) {
        request(app)
          .post('/login')
          .send(credentials)
          .end(function (e,r) {
            agent.saveCookies(r);
            var req = request(app).post('/authorize')
            agent.attachCookies(req);
            req.set('Content-type', 'application/json')
            req.send({ 
              client_id: 'unknown'
            })
            req.end(function (error, response) {
              err = error;
              res = response;
              done();
            });
          });
      });

      it('should respond 403', function () {
        res.statusCode.should.equal(403);
      });

      it('should respond with JSON', function () {
        res.headers['content-type'].should.contain('application/json');
      });

      it('should NOT redirect', function () {
        res.statusCode.should.not.equal(302);
      });

      it('should respond with an "unauthorized_client" error', function () {
        res.body.error.should.equal('unauthorized_client');
      });
      
      it('should respond with an error description', function () {
        res.body.error_description.should.equal('Unknown client');
      });

      it('should respond with an error uri');
      it('should respond with "state" provided by the client');

    });


    describe('with missing client id', function () {

      before(function (done) {
        request(app)
          .post('/login')
          .send(credentials)
          .end(function (e,r) {
            agent.saveCookies(r);
            var req = request(app).post('/authorize')
            agent.attachCookies(req);
            req.set('Content-type', 'application/json')
            req.send({              
              redirect_uri: 'https://localhost:3001/callback.html'
            })
            req.end(function (error, response) {
              err = error;
              res = response;
              done();
            });
          });
      });

      it('should respond 403', function () {
        res.statusCode.should.equal(403);
      });

      it('should respond with JSON', function () {
        res.headers['content-type'].should.contain('application/json');
      });

      it('should NOT redirect', function () {
        res.statusCode.should.not.equal(302);
      });

      it('should respond with an "unauthorized_client" error', function () {
        res.body.error.should.equal('unauthorized_client');
      });
      
      it('should respond with an error description', function () {
        res.body.error_description.should.equal('Missing client id');
      });

      it('should respond with an error uri');
      it('should respond with "state" provided by the client');

    });


    describe('with invalid redirect uri', function () {
      it('should NOT redirect');
      it('should respond with an "invalid_request" error');
      it('should respond with an error description');
      it('should respond with an error uri');
      it('should respond with "state" provided by the client');      
    });

    describe('with missing redirect uri', function () {

      before(function (done) {
        request(app)
          .post('/login')
          .send(credentials)
          .end(function (e,r) {
            agent.saveCookies(r);
            var req = request(app).post('/authorize')
            agent.attachCookies(req);
            req.set('Content-type', 'application/json')
            req.send({ 
              client_id: 'thirdparty',
              response_type: 'token'
            })
            req.end(function (error, response) {
              err = error;
              res = response;
              done();
            });
          });
      });

      it('should respond 400', function () {
        res.statusCode.should.equal(400);
      });

      it('should respond with JSON', function () {
        res.headers['content-type'].should.contain('application/json');
      });

      it('should NOT redirect', function () {
        res.statusCode.should.not.equal(302);
      });

      it('should respond with an "invalid request" error', function () {
        res.body.error.should.equal('invalid_request');
      });

      it('should respond with an error description', function () {
        res.body.error_description.should.equal('Missing redirect uri');
      });

      it('should respond with an error uri');
      it('should respond with "state" provided by the client');   

    });


    describe('with mismatching redirect uri', function () {

      before(function (done) {
        request(app)
          .post('/login')
          .send(credentials)
          .end(function (e,r) {
            agent.saveCookies(r);
            var req = request(app).post('/authorize')
            agent.attachCookies(req);
            req.set('Content-type', 'application/json')
            req.send({ 
              client_id: 'thirdparty',
              response_type: 'token',
              redirect_uri: 'wrong'
            })
            req.end(function (error, response) {
              err = error;
              res = response;
              done();
            });
          });
      });

      it('should respond 400', function () {
        res.statusCode.should.equal(400);
      });

      it('should respond with JSON', function () {
        res.headers['content-type'].should.contain('application/json');
      });

      it('should NOT redirect', function () {
        res.statusCode.should.not.equal(302);
      });
      
      it('should respond with an "invalid request" error', function () {
        res.body.error.should.equal('invalid_request');
      });

      it('should respond with an error description', function () {
        res.body.error_description.should.equal('Mismatching redirect uri');
      });

      it('should respond with an error uri');
      it('should respond with "state" provided by the client');

    });



    describe('when scope is required', function () {

      describe('with invalid scope', function () {
        it('should redirect to the redirect uri');
        it('should respond with an "invalid_scope" error');
        it('should respond with an error description');
        it('should respond with an error uri');
        it('should respond with "state" provided by the client');        
      });

      describe('with missing scope', function () {
        it('should redirect to the redirect uri');
        it('should respond with an "invalid_scope" error');
        it('should respond with an error description');
        it('should respond with an error uri');
        it('should respond with "state" provided by the client');        
      });

      describe('with excess scope', function () {
        it('should ???')
      });

    });

  });


});