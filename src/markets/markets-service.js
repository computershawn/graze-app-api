const MarketsService = {
  getAllMarkets(knexInstance) {
      return knexInstance.select('*').from('markets')
  },

  insertMarket(knexInstance, newMarket) {
      return knexInstance
          .insert(newMarket)
          .into('markets')
          .returning('*')
          .then(rows => {
              return rows[0]
          })
  },

  getById(knexInstance, marketID) {
      return knexInstance
          .from('markets')
          .select('*')
          .where('id', marketID)
          .first()
  }
}

module.exports = MarketsService