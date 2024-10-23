const express = require('express')
const crypto = require('crypto'); 
const server = express()
server.use(express.text())

// The tests exercise the server by requiring it as a module,
// rather than running it in a separate process and listening on a port
module.exports = server

const repositories = {};

const generateHash = (content) => {
    return crypto.createHash('sha256').update(content).digest('hex');
}

server.put('/data/:repository', async (req, res) => {
    try {
        const repository = req.params.repository; 
        const content = req.body; 
    
        const oid = generateHash(content); 
        const size = Buffer.byteLength(content, 'utf-8');
    
        if(!repositories[repository]) {
            repositories[repository] = {};  
        }
        // await saveToDB(rep, oid, content); // Promise. 
        repositories[repository][oid] = content;
        
        // Return to the client. Use return if want to return before. 
        res.status(201).json({oid, size}); 

    } catch (Error) {
        console.error(Error);
        res.status(500).send({message: 'Something went wrong when creating a Repository Object'})
    }
});

server.get('/data/:repository/:objectID', async (req, res) => {
    try {
        const repository = req.params.repository; 
        const oid = req.params.objectID; 

        if(repositories[repository] && repositories[repository][oid]){
            res.status(200).json(repositories[repository][oid]); 
        } else {
            res.status(404).send({message: 'Object not found'});
        }

    } catch(Error) {
        console.log(Error); 
        res.status(500).send({message: 'Something went wrong when getting data'});
    }
});

server.delete('/data/:repository/:objectID', async (req, res) => {
    try {
        const repository = req.params.repository; 
        const oid = req.params.objectID; 

        if(repositories[repository] && repositories[repository][oid]){
            delete repositories[repository][oid];
            res.status(200).send({message: 'The object ID has been deleted successfully'});
        } else {
            res.status(404).send({message: 'Object not found'});
        }

    } catch(Error) {
        console.error(Error);
        res.status(500).send({message: 'Something went wrong when deleting the data'})
    }
});

if (require.main === module) {
  // Start server only when we run this on the command line and explicitly ignore this while testing

  const port = process.env.PORT || 3000
  server.listen((port), () => {
    console.log(`App listening at http://localhost:${port}`)
  })
};