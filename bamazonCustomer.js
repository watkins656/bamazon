let dotenv = require("dotenv").config();
let chalk = require("chalk");
let inquirer = require('inquirer');
let columnify = require('columnify');
let mysql = require('mysql');
// let _ = require('underscore')
let mySQLPassword = process.env.MYSQL_PASSWORD;
let connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: mySQLPassword,
    database: "bamazon"
});
connection.connect(function (err) {
    if (err) throw err;
    console.log("\nSuccessfully Connected to the database! Connection ID:" + connection.threadId + "\n");
    showLogo();
    userAuth.main();
});
let user = '';
let bamazon = {
    products: [],   //Array that gets populated with product objects
    productNames: [],  //Array used for displaying products by title only 
    main: function (userType) {
        let choices = ['customer', 'manager'];
        if (userType === 'supervisor') { choices.push('supervisor') };
        if (userType === 'customer') { this.customer(); }
        else {
            inquirer
                .prompt([
                    // Here we create a basic text prompt.
                    {
                        type: "list",
                        message: "Which interface would you like?",
                        choices: choices,
                        name: "interface"
                    },
                ])
                .then((res) => {
                    switch (res.interface) {
                        case "customer": this.customer();
                            break;
                        case "manager": this.manager();
                            break;
                        case "supervisor": this.supervisor();
                            break;
                    }
                });
        }
    },
    customer: function () {
        var query = connection.query(`SELECT * from products GROUP BY product_name ORDER BY product_name`, (err, results) => {
            results.forEach(element => {
                if (element.product_name)
                    this.products.push(element);
                this.productNames.push(element.product_name);
            });
            this.offerProducts();
            return;
        })

    },
    manager: function () {
        console.log("Hello Managerial Friend!");
    },
    offerProducts: function () {
        inquirer
            .prompt([
                // Here we create a basic text prompt.
                {
                    type: "list",
                    message: "Which product would you like to buy?",
                    choices: this.productNames,
                    name: "product_name"
                },
                {
                    type: "list",
                    message: "How many would you like to buy?",
                    choices: ["1", "2", "3", "More"],
                    name: "quantity"
                },
            ])
            .then((res) => {
                if (res.quantity === "More") {
                    console.log("There are not enough items in stock.");
                    this.main();
                }
                var product = this.products.filter(product => {
                    return product.product_name === res.product_name
                });
                let qtyPurchased = parseInt(res.quantity);
                this.purchase(product, qtyPurchased);
            });


    },
    purchase: function (product, qtyPurchased) {
        let purchaseOrder = {
            "product": product[0].product_name,
            "department": product[0].department_name,
            "quantity": qtyPurchased,
            "total": qtyPurchased * product[0].price,
        };
        let newStock = (product[0].stock_quantity) - (qtyPurchased);
        let query = connection.query(`UPDATE products
         SET ?
         WHERE ?;`, [{ "stock_quantity": newStock }, { "product_name": product[0].product_name }], (err, results) => {
                if (err) { console.log(err); }
            })
        let query2 = connection.query(`INSERT INTO customerOrders SET ?;`, purchaseOrder, (err, results) => {
            if (err) { console.log(err); }
        })
        this.main();

    },
    supervisor: function () {
        console.log("Hello Super Supervisor!");
    },
    trackSalesAcrossDepartments: function () {
        // provide a summary of the highest-grossing departments in the store.


        // get sql data and add totals for each department


        let query = connection.query(`SELECT * from customerOrders `, (err, results) => {
            results.forEach(element => {
                console.log(element.product);

            });


        })
    },
}





// ### Challenge #1: Customer View (Minimum Requirement)

// 1. Create a MySQL Database called `bamazon`.

// 2. Then create a Table inside of that database called `products`.

// 3. The products table should have each of the following columns:

//    * item_id (unique id for each product)
//    * product_name (Name of product)
//    * department_name
//    * price (cost to customer)
//    * stock_quantity (how much of the product is available in stores)
// 4. Populate this database with around 10 different products. (i.e. Insert "mock" data rows into this database and table).

// 5. Then create a Node application called `bamazonCustomer.js`. Running this application will first display all of the items available for sale. Include the ids, names, and prices of products for sale.

// 6. The app should then prompt users with two messages.

//    * The first should ask them the ID of the product they would like to buy.
//    * The second message should ask how many units of the product they would like to buy.

// 7. Once the customer has placed the order, your application should check if your store has enough of the product to meet the customer's request.

//    * If not, the app should log a phrase like `Insufficient quantity!`, and then prevent the order from going through.

// 8. However, if your store _does_ have enough of the product, you should fulfill the customer's order.
//    * This means updating the SQL database to reflect the remaining quantity.
//    * Once the update goes through, show the customer the total cost of their purchase.

// - - -

// * If this activity took you between 8-10 hours, then you've put enough time into this assignment. Feel free to stop here -- unless you want to take on the next challenge.

// - - -

let userAuth = {
    logIn: function () {
        inquirer
            .prompt([
                // Here we create a basic text prompt.
                {
                    type: "input",
                    message: "Enter your username",
                    name: "username"
                },
                {
                    type: "password",
                    message: "Enter your password",
                    name: "password"
                }
            ])
            .then((response) => {
                user = new this.User(response.username, response.password);
                let query = connection.query("SELECT * FROM users WHERE ?", { username: user.username }, (err, res) => {
                    if (user.password === res[0].password) {
                        console.log('Log-in Successful!');
                        bamazon.main(user.userType);
                    }
                    else {
                        console.log("\nForget your password?\n");
                    }
                })
            })
    },
    newUser: function () {

        inquirer
            .prompt([
                // Here we create a basic text prompt.
                {
                    type: "input",
                    message: "Choose A Username",
                    name: "username"
                },
                {
                    type: "password",
                    message: "Choose A Password",
                    name: "password"
                },
                {
                    type: "list",
                    message: "Choose A User Tyoe",
                    choices: ["customer", "manager", "supervisor"],
                    name: "type"
                },
            ])
            .then((response) => {
                let user = new this.User(response.username, response.password, response.type);
                let query = connection.query("SELECT username FROM users WHERE ?", { username: user.username }, (err, res) => {
                    if (res.length == 0) {
                        this.addUser(user);

                    }
                    else {
                        console.log("\nUsername already exists!\n");

                    }
                }
                )
            });
    },
    addUser: function (user) {
        let query = connection.query(
            "INSERT INTO users SET ?",
            user,
            (err, res) => {
                console.log(res.affectedRows + " new user added!\n");
                this.main();
            })
    },
    main: function () {
        inquirer
            .prompt([
                // Here we create a basic text prompt.
                {
                    type: "list",
                    message: "New or Existing User?",
                    choices: ["EXISTING USER", "NEW USER"],
                    name: "newUser"
                },
            ])
            .then((res) => {
                if (res.newUser === "NEW USER") { this.newUser(); }
                else { this.logIn(); }
            });
    },
    User: function (name, pass, type) {
        this.username = name;
        this.password = pass;
        this.userType = type;
    }
}

function showLogo(){
console.log(chalk.black.bgYellow("......................................................................................................................................"));
console.log(chalk.black.bgYellow(".BBBBBBBBBBBBBBBB....................................................................................................................."));
console.log(chalk.black.bgYellow(".BBBBBBBBBBBBBBBBBB..................................................................................................................."));
console.log(chalk.black.bgYellow(".BBBBBBBBBBBBBBBBBB..................................................................................................................."));
console.log(chalk.black.bgYellow(".BBBBBBBBBBBBBBBBBBB.................................................................................................................."));
console.log(chalk.black.bgYellow(".BBBBBB.....BBBBBBBB.................................................................................................................."));
console.log(chalk.black.bgYellow(".BBBBBB.......BBBBBB.................................................................................................................."));
console.log(chalk.black.bgYellow(".BBBBBB.......BBBBBB.....aaaaaaaaaa....ammmmmmmmmmmmm.mmmmmmmm......aaaaaaaaaa....azzzzzzzzzzzzz.....oooooooooo.....onnnnnnnnnnnnn...."));
console.log(chalk.black.bgYellow(".BBBBBB.......BBBBBB....aaaaaaaaaaaa...ammmmmmmmmmmmmmmmmmmmmmm....aaaaaaaaaaaaa..azzzzzzzzzzzzz....oooooooooooo....onnnnnnnnnnnnnn..."));
console.log(chalk.black.bgYellow(".BBBBBB.....BBBBBBBB...aaaaaaaaaaaaaa..ammmmmmmmmmmmmmmmmmmmmmm...maaaaaaaaaaaaa..azzzzzzzzzzzzz...oooooooooooooo...onnnnnnnnnnnnnnn.."));
console.log(chalk.black.bgYellow(".BBBBBBBBBBBBBBBBBB....aaaaaaaaaaaaaa..ammmmmmmmmmmmmmmmmmmmmmmm..maaaaaaaaaaaaa.........zzzzzzz..oooooooooooooooo..onnnnnnn.nnnnnnn.."));
console.log(chalk.black.bgYellow(".BBBBBBBBBBBBBBBBB.....aaaaa...aaaaaa..ammmmmm..mmmmmmm...mmmmmm..maaaa...aaaaaa........zzzzzzzz..oooooo....oooooo..onnnnnn...nnnnnn.."));
console.log(chalk.black.bgYellow(".BBBBBBBBBBBBBBBBBB.............aaaaa..ammmmm....mmmmmm...mmmmmm...........aaaaa.......zzzzzzzz..zooooo......oooooo.onnnnn....nnnnnn.."));
console.log(chalk.black.bgYellow(".BBBBBBBBBBBBBBBBBBB........aaaaaaaaa..ammmmm....mmmmmm...mmmmmm.......aaaaaaaaa......zzzzzzzz...zooooo......oooooo.onnnnn....nnnnnn.."));
console.log(chalk.black.bgYellow(".BBBBBB.....BBBBBBBBB...aaaaaaaaaaaaa..ammmmm....mmmmm....mmmmmm...aaaaaaaaaaaaa......zzzzzzz....zooooo......oooooo.onnnnn....nnnnnn.."));
console.log(chalk.black.bgYellow(".BBBBBB........BBBBBB..aaaaaaaaaaaaaa..ammmmm....mmmmm....mmmmmm..maaaaaaaaaaaaa.....zzzzzzz.....zooooo......oooooo.onnnnn....nnnnnn.."));
console.log(chalk.black.bgYellow(".BBBBBB........BBBBBB.Baaaaaaaaaaaaaa..ammmmm....mmmmm....mmmmmm..maaaaaaaaaaaaa....zzzzzzzz.....zooooo......oooooo.onnnnn....nnnnnn.."));
console.log(chalk.black.bgYellow(".BBBBBB........BBBBBB.Baaaaa...aaaaaa..ammmmm....mmmmm....mmmmmm.mmaaaaa...aaaaa...zzzzzzzz......zooooo......oooooo.onnnnn....nnnnnn.."));
console.log(chalk.black.bgYellow(".BBBBBB......BBBBBBBB.Baaaaa...aaaaaa..ammmmm....mmmmm....mmmmmm.mmaaaa...aaaaaa..azzzzzzz........oooooo....oooooo..onnnnn....nnnnnn.."));
console.log(chalk.black.bgYellow(".BBBBBBBBBBBBBBBBBBBB.Baaaaaaaaaaaaaa..ammmmm....mmmmm....mmmmmm.mmaaaaaaaaaaaaa..azzzzzz.........oooooooooooooooo..onnnnn....nnnnnn.."));
console.log(chalk.black.bgYellow(".BBBBBBBBBBBBBBBBBBB..Baaaaaaaaaaaaaa..ammmmm....mmmmm....mmmmmm.mmaaaaaaaaaaaaaa.azzzzzzzzzzzzzz..oooooooooooooo...onnnnn....nnnnnn.."));
console.log(chalk.black.bgYellow(".BBBBBBBBBBBBBBBBBB....aaaaaaaaaaaaaaa.ammmmm....mmmmm....mmmmmm..maaaaaaaaaaaaaa.azzzzzzzzzzzzzz...oooooooooooo....onnnnn....nnnnnn.."));
console.log(chalk.black.bgYellow(".BBBBBBBBBBBBBBBBB......aaaaaaaaaaaaaa.ammmmm....mmmmm....mmmmmm...aaaaaaaaaaaaaa.azzzzzzzzzzzzzz....oooooooooo.....onnnnn....nnnnnn.."));
console.log(chalk.black.bgYellow("......................................................................................................................................"));
}