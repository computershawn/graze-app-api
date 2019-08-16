const ProductsService = {
  getAllProducts(knexInstance) {
      return knexInstance.select('*').from('products')
  },

  insertProduct(knexInstance, newProduct) {
      return knexInstance
          .insert(newProduct)
          .into('products')
          .returning('*')
          .then(rows => {
              return rows[0]
          })
  },

  getById(knexInstance, productID) {
      return knexInstance
          .from('products')
          .select('*')
          .where('id', productID)
          .first()
  },

  deleteProduct(knex, id) {
    return knex('products')
      .where({ id })
      .delete()
  },

  updateProduct(knex, id, newProductFields) {
    return knex('products')
      .where({ id })
      .update(newProductFields)
  },
}

module.exports = ProductsService