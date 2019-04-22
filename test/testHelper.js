const objectMongoService = {
    collection: () => ({
      find: () => ({
        toArray: () => Promise.resolve([]),
        sort: () => ({
          toArray: () => Promise.resolve(),
          limit: () => ({
            skip: () => ({
              toArray: () =>  Promise.resolve()
            })
          })
        })      
      }),
      distinct: () => Promise.resolve(),
      remove: () => Promise.resolve(),
      update: () => Promise.resolve(),
      insert: () => Promise.resolve({ops: []}),
    })
  }


module.exports = objectMongoService;