const VendorsService = {
  getAllVendors(knexInstance) {
      return knexInstance.select('*').from('vendors')
  },

  insertVendor(knexInstance, newVendor) {
      return knexInstance
          .insert(newVendor)
          .into('vendors')
          .returning('*')
          .then(rows => {
              return rows[0]
          })
  },

  getById(knexInstance, vendorID) {
      return knexInstance
          .from('vendors')
          .select('*')
          .where('id', vendorID)
          .first()
  }
}

module.exports = VendorsService