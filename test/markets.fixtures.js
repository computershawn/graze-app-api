function makeMarketsArray() {
  return [
    {
      id: 1,
      market_name: 'Market 1',
      hero_image: 'http://images.com/image1.png',
      schedule: 'Monday 9am - 5pm',
      market_location: '123 4th Street in City Town',
      summary: 'Debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
      market_description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid.'
    },
    {
      id: 2,
      market_name: 'Market 2',
      hero_image: 'http://images.com/image2.png',
      schedule: 'Tuesday 9am - 5pm',
      market_location: '456 7th Street in City Town',
      summary: 'Debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
      market_description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid.'
    },
    {
      id: 3,
      market_name: 'Market 3',
      hero_image: 'http://images.com/image3.png',
      schedule: 'Wednesday 9am - 5pm',
      market_location: '789 0th Street in City Town',
      summary: 'Debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
      market_description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid.'
    }
  ]
}

const maliciousMarket = {
  id: 2,
  market_name: 'Malicious Market',
  hero_image: 'http://images.com/image2.png',
  schedule: 'Tuesday 9am - 5pm',
  market_location: 'Naughty naughty very naughty <script>alert("xss");</script>',
  summary: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
  market_description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid.'
}

const sanitizedMarkets = [{
  id: 2,
  market_name: 'Malicious Market',
  hero_image: 'http://images.com/image2.png',
  schedule: 'Tuesday 9am - 5pm',
  market_location: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
  summary: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
  market_description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid.'
}]

module.exports = {
  makeMarketsArray,
  maliciousMarket,
  sanitizedMarkets,
}