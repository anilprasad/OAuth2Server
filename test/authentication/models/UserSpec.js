/**
 * Test dependencies
 */

var cwd = process.cwd()
  , path = require('path')
  , chai = require('chai')
  , User = require(path.join(cwd, 'models/User'))
//  , Backend = require(path.join(cwd, 'models/UserBackend'))  
  , expect = chai.expect
  ;


/**
 * Should style assertions
 */

chai.should();


/**
 * Model specification
 */

describe('User', function () {

  var err, user, info, validation, validUser = {
    first: 'John',
    last: 'Coltrane',
    username: 'trane',
    email: 'trane@example.com',
    password: 'secret'
  };

  beforeEach(function () { 
    User.backend.reset(); 
  });

  describe('schema', function () {

    beforeEach(function () {
      user = new User();
      validation = user.validate();
    });

    it('should have _id', function () {
      User.schema._id.should.be.an('object');
    });

    it('should require info', function () {
      validation.errors.info.attribute.should.equal('required');
    });

    describe('info', function () {

      beforeEach(function () {
        user = new User({ info: {} });
        validation = user.validate();
      });

      it('should have id', function () {
        User.schema.info.properties.id.type.should.equal('any');
      });

      it('should have first name', function () {
        User.schema.info.properties.first.type.should.equal('string');
      });
      
      it('should have last name', function () {
        User.schema.info.properties.last.type.should.equal('string');
      });
      
      it('should have username', function () {
        User.schema.info.properties.username.type.should.equal('string');
      });
      
      it('should require email', function () {
        validation.errors.email.attribute.should.equal('required');
      });
      
      it('should require email to be valid', function () {
        validation = (new User({ info: { email: 'not-valid' } })).validate();
        validation.errors.email.attribute.should.equal('format');        
      });
      
      it('should have "created" timestamp', function () {
        User.schema.info.properties.created.should.be.an('object');
      });
      
      it('should have "modified" timestamp', function () {
        User.schema.info.properties.modified.should.be.an('object');
      });
    });


    it('should have salt', function () {
      User.schema.salt.type.should.equal('string');
    });

    it('should have hash', function () {
      User.schema.hash.type.should.equal('string');
    });


    describe('tokens', function () {
      it('should have "local" access_token');
      it('should have "facebook" access_token');
    });

    describe('credentials', function () {
      describe('local', function () {
        it('should have access_token');
        it('should have secret')
      });

      describe('facebook', function () {
        it('should have access_token');
        it('should have secret')
      });
    });

  });


  describe('constructor', function () {
    it('should initialize id if none is provided', function () {
      user = new User();
      (typeof user._id).should.equal('string');

      user = new User({});
      (typeof user._id).should.equal('string');
    });

    it('should set attrs defined in schema', function () {
      var id = '1234abcd'
        , info = { first: 'John', last: 'Coltrane' };
      user = new User({ _id: id, info: info });
      user._id.should.equal(id);
      user.info.first.should.equal(info.first);
      user.info.last.should.equal(info.last);
    });
    
    it('should ignore attrs not defined in schema', function () {
      user = new User({ hacker: 'p0wn3d' });
      expect(user.hacker).equals(undefined);
    });
  });


  describe('creation', function () {

    describe('with valid data', function () {

      beforeEach(function (done) {
        User.create(validUser, function (error, instance) {
          err = error; 
          user = instance; 
          done();
        });
      });

      it('should provide a null error', function () {
        expect(err).equals(null);
      });

      it('should provide a User instance', function () {
        (user instanceof User).should.equal(true);
      });

      it('should hash the password', function () {
        user.salt.should.be.a('string');
        user.hash.should.be.a('string');
      });

      it('should discard the password', function () {
        var json = JSON.stringify(user);
        json.should.not.contain('password');
        json.should.not.contain(validUser.password);
      });

      it('should set the "created" timestamp', function () {
        user.info.created.should.be.defined;
      });

      it('should set the "modified" timestamp', function () {
        user.info.modified.should.be.defined;
      });

    });

    describe('with invalid data', function () {

      beforeEach(function (done) {
        User.create({}, function (error, instance) {
          err = error; 
          user = instance; 
          done();
        });
      });

      it('should provide a validation error', function () {
        err.name.should.equal('ValidationError');
      });

      it('should not provide a user', function () {
        expect(user).equals(undefined);
      });

    });
    
    describe('with a registered email', function () {
      
      beforeEach(function (done) {
        User.create(validUser, function (e, i) {
          User.create(validUser, function (error, instance) {
            err = error;
            user = instance;
            done();
          });
        })
      });

      it('should provide a "registered email" error', function () {
        err.name.should.equal('RegisteredEmailError');
      });

    });

    describe('with a registered username', function () {

      beforeEach(function (done) {
        User.create(validUser, function () {
          User.create({
            username: validUser.username,
            email: 'valid@example.com',
            password: 'secret'
          }, function (error, instance) {
            err = error;
            user = instance;
            done();
          });
        })
      });

      it('should provide a "registered username" error', function () {
        err.name.should.equal('RegisteredUsernameError');
      });

    });

    describe('with a weak password', function () {
      it('should provide a "insecure password" error');
    });

    describe('without a password', function () {
      
      beforeEach(function (done) {
        User.create({
          email: 'valid@example.com'
        }, function (error, instance) {
          err = error; 
          user = instance; 
          done();
        });
      });

      it('should provide a "Password required" error', function () {
        err.name.should.equal('PasswordRequiredError');
      });
    });

  });


  describe('retrieval', function () {

    describe('by id', function () {

      before(function (done) {
        User.create(validUser, function (e) {
          User.find({ _id: '1234abcd' }, function (error, instance) {
            err = error;
            user = instance;
            done();
          });
        });        
      });

      it('should provide a null error', function () {
        expect(err).equals(null);
      })

      it('should provide a User instance', function () {
        (user instanceof User).should.equal(true);
      });

    });

    describe('by username', function () {

      before(function (done) {
        User.create(validUser, function (e) {
          User.find({ 'info.username': validUser.username }, function (error, instance) {
            err = error;
            user = instance;
            done();
          });
        });        
      });

      it('should provide a null error', function () {
        expect(err).equals(null);
      })

      it('should provide a User instance', function () {
        (user instanceof User).should.equal(true);
      });

    });

    describe('by email', function () {

      before(function (done) {
        User.create(validUser, function (e) {
          User.find({ 'info.email': validUser.email }, function (error, instance) {
            err = error;
            user = instance;
            done();
          });
        });        
      });

      it('should provide a null error', function () {
        expect(err).equals(null);
      })

      it('should provide a User instance', function () {
        (user instanceof User).should.equal(true);
      });

    });

  });


  describe('password verification', function () {

    it('should verify a correct password', function (done) {
      User.create(validUser, function (err, user) {
        user.verifyPassword('secret', function (err, match) {
          match.should.equal(true);
          done();
        });
      });
    });
    
    it('should not verify an incorrect password', function (done) {
      User.create(validUser, function (err, user) {
        user.verifyPassword('wrong', function (err, match) {
          match.should.equal(false);
          done();
        });
      });
    });

    it('should not verify against an undefined hash', function (done) {
      user = new User({});
      expect(user.hash).equals(undefined);
      user.verifyPassword('secret', function (err, match) {
        match.should.equal(false);
        done();
      });
    });

  });


  describe('authentication', function () {

    describe('with valid email and password credentials', function () {

      before(function (done) {
        User.create(validUser, function (err, user) {
          User.authenticate(validUser.email, validUser.password, function (error, instance, information) {
            err = error;
            user = instance;
            info = information;
            done();
          });
        });
      });

      it('should provide a null error', function () {
        expect(err).equals(null);
      });

      it('should provide a User instance', function () {
        (user instanceof User).should.equal(true);
      });

      it('should provide a message', function () {
        info.message.should.equal('Authenticated successfully!');
      });

    });

    describe('with unknown user', function () {

      before(function (done) {
        User.authenticate(validUser.email, validUser.password, function (error, instance, information) {
          err = error;
          user = instance;
          info = information;
          done();
        });
      });

      it('should provide a null error', function () {
        expect(err).equals(null);
      });

      it('should provide a false user', function () {
        expect(user).equals(false);
      });

      it('should provide a message', function () {
        info.message.should.equal('Unknown user.');
      });

    });

    describe('with incorrect password', function () {

      before(function (done) {
        User.create(validUser, function (err, user) {
          User.authenticate(validUser.email, 'wrong', function (error, instance, information) {
            err = error;
            user = instance;
            info = information;
            done();
          });
        });
      });

      it('should provide a null error', function () {
        expect(err).equals(null);
      });

      it('should provide a false user', function () {
        expect(user).equals(false);
      });

      it('should provide a message', function () {
        info.message.should.equal('Incorrect password.');
      });

    });

  });


  describe('password reset', function () {});


  describe('account verification', function () {});

});