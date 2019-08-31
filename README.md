# Graze App API
A Node, Express, PostgreSQL back-end for the Graze farmer’s market app. The Graze database contains tables relating to farmers markets, their vendors, and the items that the vendors sell. The API endpoints in this back-end application enable CRUD operations on the database.<br>
[Live App Demo](https://graze-app.computershawn.now.sh) | [Front-end Client Repo](https://github.com/computershawn/graze-app)

## Tech Stack
Graze API uses a number of open source projects to work properly:
* [node.js](https://nodejs.org/en/) - evented I/O for the back-end
* [Express](https://expressjs.com/) - fast node.js network app framework
* [Postgrator-CLI](https://www.npmjs.com/package/postgrator-cli) - A command line runner for [Postgrator](https://www.npmjs.com/package/postgrator)
* [Dotenv](https://www.npmjs.com/package/dotenv) - loads environment variables from a .env file
* [Helmet](http://helmetjs.github.io) - helps you secure your Express apps
* [Knex](https://www.npmjs.com/package/knex) - query builder for Node.js
* [Morgan](https://www.npmjs.com/package/morgan/v/1.1.1) - logging middleware for node.js http apps
* [Pg](https://www.npmjs.com/package/pg) - non-blocking PostgreSQL client for Node.js
* [Winston](https://www.npmjs.com/package/) - a logger for just about everything
* [Xss](https://www.npmjs.com/package/xss) - sanitize untrusted HTML to prevent XSS
* [Chai](https://www.npmjs.com/package/chai) - a BDD / TDD assertion library for Node.js
* [Mocha](https://www.npmjs.com/package/mocha) - simple, flexible, fun JavaScript test framework for Node.js
* [Nodemon](https://www.npmjs.com/package/nodemon) - auto-restarts the node app when file changes are detected.
* [Supertest](https://www.npmjs.com/package/supertest) - HTTP assertions made easy via [superagent](https://www.npmjs.com/package/superagent)


# Setup

Clone this repository to your local machine:
```sh
$ git clone https://github.com/computershawn/graze-app-api NEW-PROJECTS-NAME
```

`cd` into the cloned repository. Make a fresh start of the git history for this project:

```sh
$ rm -rf .git && git init
```

Install the node dependencies:

```sh
$ npm install
```

Move the example Environment file to `.env` that will be ignored by git and read by the express server:

```sh
$ mv example.env .env
```

Edit the name field in package.json to use `NEW-PROJECT-NAME` instead of `graze-app-api`

## Database
The API relies a PSQL database. You will need to create and configure the database, and optionally seed it with data.
### Create
Use PSQL to create 2 new local databases, 'graze-app' and 'graze-app-test'. Both should have a superuser 'todd-nobdy'.
```sh
$ createdb -U todd-nobdy graze-app
$ createdb -U todd-nobdy graze-app-test
```
If you choose to use different database name, username and password, be sure to update your 'config.js' and '.env' files accordingly.

### Migrate
The app uses a Postgrator script to handle migration. To add schema:
```sh
$ npm run migrate
```

### Seed
The above migration step creates four tables in your database: Markets, Products, Vendors and Price List. The Price List table references the Vendosr and Products tables. The Vendors table references Markets. These dependencies between tables mean that they should be seeded in a particular order:
```sh
$ psql -U todd-nobdy -d graze-app -f ./seeds/seed.graze_markets.sql
$ psql -U todd-nobdy -d graze-app -f ./seeds/seed.graze_products.sql
$ psql -U todd-nobdy -d graze-app -f ./seeds/seed.graze_vendors.sql
$ psql -U todd-nobdy -d graze-app -f ./seeds/seed.graze_price_list.sql
```


## Scripts
Start the application
```sh
npm start
```
Start nodemon for the application 
```sh
npm run dev
```
Run the tests
```sh
npm test
```


# Using the API
The API has endpoints for handling various CRUD operations for the markets, vendors, products and price list tables. Start the server, and then use (Postman)[https://www.getpostman.com/] or other similar desktop/CLI tool to test out the Graze endpoints.

## Markets Endpoints
**GET** `/markets`<br>
Returns an array of all _market_ JSON objects in database. Example response body:
```
[
    {
        "id": 1,
        "market_name": "Mar Vista Farmers Market",
        "hero_image": "https://image-website.com/mar-vista-farmers-market.jpg",
        "schedule": "Sundays from 9 AM until 2 PM",
        "market_location": "3826 Grand View Blvd, Los Angeles, CA 90066****https://www.google.com/maps/@34.0043946,-118.4324719,17z",
        "summary": "Natus consequuntur deserunt commodi, nobis qui.",
        "market_description": "Natus consequuntur deserunt commodi, nobis qui..."
    },
    {
        "id": 2,
        "market_name": "West Hollywood Farmers Market",
        "hero_image": "https://image-website.com/west-hollywood-farmers-market.jpg",
        "schedule": "Sundays from 9 AM until 4 PM",
        "market_location": "1200 N Vista St, West Hollywood, CA 90046****https://www.google.com/maps/@34.0923774,-118.3536229,17z",
        "summary": "Dolor sit amet consectetur adipisicing elit.",
        "market_description": "Dolor sit amet consectetur adipisicing elit. Earum..."
    }
    ...
]
```

**GET** `/markets/:market_id`<br>
Returns a _market_ JSON object with id _market_id_. Example response body:
```
{
    "id": 1,
    "market_name": "Mar Vista Farmers Market",
    "hero_image": "https://image-website.com/mar-vista-farmers-market.jpg",
    "schedule": "Sundays from 9 AM until 2 PM",
    "market_location": "3826 Grand View Blvd, Los Angeles, CA 90066****https://www.google.com/maps/@34.0043946,-118.4324719,17z",
    "summary": "Natus consequuntur deserunt commodi, nobis qui.",
    "market_description": "Natus consequuntur deserunt commodi, nobis qui..."
}
```

## Products Endpoints
**POST** `/products`<br>
Returns an array of all _product_ JSON objects in database. The `product_category` must be one of _fruit_, _vegetable_, _nuts and grains_, _poultry_, _meat_, _seafood_, or _other_. Example Products POST request body:
```
{
    "product_name": "apple",
    "product_description": "Et harum quidem rerum facilis est et...",
    "product_category": "fruit"
}
```
Example Products POST response body:
```
{
    "id": 9,
    "product_name": "apple",
    "product_description": "Et harum quidem rerum facilis est et...",
    "product_category": "fruit"
}
```

**GET** `/products`<br>
Returns an array of all _product_ JSON objects in database. Example response body:
```
[
    {
        "id": 1,
        "product_name": "apple",
        "product_description": "Et harum quidem rerum facilis est et...",
        "product_category": "fruit"
    },
    {
        "id": 2,
        "product_name": "orange",
        "product_description": "Itaque earum rerum hic tenetur a...",
        "product_category": "fruit"
    }
    ...
]
```

**GET** `/products/:product_id`<br>
Returns a _product_ JSON object with id _product_id_. Example response body:
```
{
    "id": 1,
    "product_name": "apple",
    "product_description": "Et harum quidem rerum facilis est et...",
    "product_category": "fruit"
}
```

**PATCH** `/products/:product_id`<br>
Update product with id _product_id_ in the database. Example Products PATCH request URL:
```
http://localhost:8000/api/products/7
```
Example Products PATCH request body:
```
{
    "product_name": "yellow peach",
    "product_description": "Updated text enim ad minima veniam quis nostrum exercitationem...",
    "product_category": "fruit"
}
```
The patch operation will not yield a response. Inclusion of _product_category_ is optional.

**DELETE** `/products/:product_id`<br>
Delete product with id _product_id_ from the database. The delete operation will not yield a response. Example Products DELETE request:
```
http://localhost:8000/api/products/7
```

## Vendors Endpoints
**GET** `/vendors`<br>
Returns an array of all _vendor_ JSON objects in database. Example response body:
```
[
    {
        "id": 1,
        "vendor_name": "Qui Farms",
        "vendor_description": "Et harum quidem rerum facilis est et...",
        "market_stall": "MV-1",
        "market_id": 1
    },
    {
        "id": 2,
        "vendor_name": "Repellat Ranch",
        "vendor_description": "At vero eos et accusamus et iusto odio....",
        "market_stall": "MV-2",
        "market_id": 1
    }
    ...
]
```

**GET** `/vendors/:vendor_id`<br>
Returns a _vendor_ JSON object with id _market_id_. Example response body:
```
{
    "id": 1,
    "vendor_name": "Qui Farms",
    "vendor_description": "Et harum quidem rerum facilis est et...",
    "market_stall": "MV-1",
    "market_id": 1
}
```

## Prices Endpoints
**GET** `/prices`<br>
Returns an array of all _price_ JSON objects in database. Example response body:
```
[
    {
        "id": 1,
        "product_id": "70",
        "vendor_id": "1",
        "price": "14.99",
        "units": "lb"
    },
    {
        "id": 2,
        "product_id": "66",
        "vendor_id": "1",
        "price": "2.99",
        "units": "ea"
    }
    ...
]
```

**GET** `/price/:price_id`<br>
Retuns a _price_ JSON object with id _price_id_. Example response body:
```
{
    "id": 1,
    "product_id": "70",
    "vendor_id": "1",
    "price": "14.99",
    "units": "lb"
}
```

# Deploy the API
When your project is ready for deployment, add a new Heroku application with `heroku create`. This will make a new git remote called "heroku" and you can then `npm run deploy` which will push to this remote's master branch.