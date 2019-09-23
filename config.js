const dev = {
    elastic: {
        host: 'localhost',
        port: 9200,
        log: 'trace'
    }
}

const test = {
    elastic: {
        host: 'localhost',
        port: 9200,
        log: 'trace'
    }
}

const config = {
    dev,
    test
}

module.exports = config