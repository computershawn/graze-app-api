const PricelistService = {
  getAllPrices(knexInstance) {
      return knexInstance.select('*').from('price_list')
  },

  insertPrice(knexInstance, newProduct) {
      return knexInstance
          .insert(newProduct)
          .into('price_list')
          .returning('*')
          .then(rows => {
              return rows[0]
          })
  },

  getById(knexInstance, productID) {
      return knexInstance
          .from('price_list')
          .select('*')
          .where('id', productID)
          .first()
  }
}

module.exports = PricelistService