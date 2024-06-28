const express = require('express')
const d3 = require('d3')

const port = 1234

// create the server object
const server = express()

// set an endpoint
server.get('/', (req, res) => {
  res.send('Hello World!')
})

// start the server
server.listen(port, () => {
  console.log(`Server active on port ${port}`)
})
