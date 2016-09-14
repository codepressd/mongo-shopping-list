global.DATABASE_URL = 'mongodb://localhost/shopping-list-test';

var chai = require('chai');
var chaiHttp = require('chai-http');

var server = require('../server.js');
var Item = require('../models/item');

var should = chai.should();
var app = server.app;

chai.use(chaiHttp);

describe('Shopping List', function() {
     this.timeout(30000);
    var items =[];
    before(function(done) {
        server.runServer(function() {
            Item.create([{name: 'Broad beans'},
                        {name: 'Tomatoes'},
                        {name: 'Peppers'}], function(err, veggies) {
                            if(err){
                               return console.error(err);
                            }
                            items = veggies;
                done();
            });
        });
    });
    
   
    
     it('should list items on GET', function(done) {
        chai.request(app)
            .get('/items')
            .end(function(err, res) {
                should.equal(err, null);
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('array');
                res.body.should.have.length(3);
                res.body[0].should.be.a('object');
                res.body[0].should.have.property('_id');
                res.body[0].should.have.property('name');
                res.body[0].name.should.be.a('string');
                /*console.log(res.body);
                res.body[0].name.should.equal('Broad beans');
                res.body[1].name.should.equal('Tomatoes');
                res.body[2].name.should.equal('Peppers');*/
                done();
            });
    });
    it('should add an item on POST', function(done) {
        chai.request(app)
            .post('/items')
            .send({'name': 'Kale'})
            .end(function(err, res) {
                should.equal(err, null);
                res.should.have.status(201);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('name');
                res.body.should.have.property('_id');
                res.body.name.should.be.a('string');
                res.body._id.should.be.a('string');
                res.body.name.should.equal('Kale');
                done();
            });
    });
    it('should edit an item on put', function(done) {
     
        var editItemId = items[0]._id;
        var newItem = {name : 'black beans', _id : editItemId};
           chai.request(app)
            .put('/items/' + editItemId)
            .send(newItem)
            .end(function(err, res) {
                should.equal(err, null);
                res.should.have.status(201);
                res.should.be.json;
                done();
            });
    });
    it('should delete an item on delete', function(done) {
        var editItemId = items[0]._id;
        var deleteItem = {'name': 'Broad beans', '_id': editItemId};
        chai.request(app)
            .delete('/items/' + deleteItem._id)
            .send(deleteItem)
            .end(function(err, res) {
                should.equal(err, null);
                res.should.have.status(201);
                res.should.be.json;
                console.log('deleted', res.body);
                res.body.name.should.equal('Broad beans');
                res.body._id.should.be.a('string');
                    chai.request(app)
                    .get('/items')
                    .end(function(err, res) {
                        should.equal(err,null);
                        res.body.should.have.length(2);
                    });
                done();
            });
    });

    after(function(done) {
        Item.remove(function() {
            done();
        });
    });
});
