const express = require('express')
const crypto = require('crypto')

const server = express()
server.use(express.text())

// The tests exercise the server by requiring it as a module,
// rather than running it in a separate process and listening on a port
module.exports = server



function toSha256Hex(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
}

server.put('/data/:repository', (req, res) => {
    const repository = req.params.repository;
    const content = req.body;

    // Generate the hash for the content.
    const oid = toSha256Hex(content);

    // This function calculates how many bytes the content takes up when it's encoded as UTF-8. 
    const size = Buffer.byteLength(content, 'utf8');

    if (!repositories[repository]) {
        repositories[repository] = {}
    }

    repositories[repository][oid] = content;
    // console.log('Stored repositories:', repositories);

    res.status(201).json({ oid, size });
});

// Downloading the object
server.get('/data/:repository/:objectID', (req, res) => {
    const repository = req.params.repository; 
    const objectID = req.params.objectID;

    // Checking if the repo and objectID exists
    if(repositories[repository] && repositories[repository][objectID]) {
        res.status(200).json(repositories[repository][objectID]); 
    } else {
        res.status(404).send({message: 'Object not found'});
    }
});

server.delete('/data/:repository/:objectID', (req, res) => {
    const repository = req.params.repository; 
    const objectID = req.params.objectID; 

    console.log('Request to get object:', repository, objectID);
    
    if(repositories[repository] && repositories[repository][objectID]) {
        delete repositories[repository][objectID]; 
        res.status(200).send('Object Deleted');
    } else {
        res.status(404).send('Object Not Found');
    }
});

if (require.main === module) {
    // Start server only when we run this on the command line and explicitly ignore this while testing
    const port = process.env.PORT || 3000
    server.listen((port), () => {
        console.log(`App listening at http://localhost:${port}`)
    })
}