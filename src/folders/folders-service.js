const FoldersService = {
  getAllFolders(knexInstance) {
      return knexInstance.select('*').from('folders')
  },

  insertFolder(knexInstance, newFolder) {
      return knexInstance
          .insert(newFolder)
          .into('folders')
          .returning('*')
          .then(rows => {
              return rows[0]
          })
  },

  getById(knexInstance, foldersID) {
      return knexInstance
          .from('folders')
          .select('*')
          .where('id', foldersID)
          .first()
  }
}

module.exports = FoldersService