# The RESTFUL API for the Chinese Restaurant

## Usage

`git clone`
`node index.js`

------------------------------
## /user
Accept methods: GET, POST, PUT, DELETE
**POST(Create User)** required fields: 
body: firstName, lastName, phone, email, agreement(true), address

**GET(Query User)** required fields:
header: user token
queryString: phone

**PUT(Edit User)** required fields:
header: user token
body: phone (to validate), firstName | lastName | phone | email | address(to update)

**DELETE(Delete User)** required fields:
header: user token
queryString: phone

------------------------------
## /token
accept methods: GET, POST, PUT, DELETE
**POST(Login)** required fields: 
body: phone, password

**GET** required fields:
header: user token

**PUT(Extend Login Time)** required fields:
header: user token
body: extendTokenTime(true)

**DELETE(Log out)** required fields:
header: user token


------------------------------
## /menu
accept methods: GET
**GET** required fields:
header: user token


------------------------------
## /cart
accept methods: POST GET
**POST** required fields:
header: user token
body: cart: [name, price, id, amount]

**GET** required fields:
header: user token

------------------------------
## /charge
accept methods: POST
**POST** required fields:
header: user token
