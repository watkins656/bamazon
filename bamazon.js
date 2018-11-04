let dotenv = require("dotenv").config();
let chalk = require("chalk");
let inquirer = require('inquirer');
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
// In this activity, you'll be creating an Amazon-like storefront with the MySQL skills you learned this week. 
// The app will take in orders from customers and deplete stock from the store's inventory.
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


// ## Submission Guide

//  This time, though, you need to include screenshots, a gif, and/or a video showing us that you got the app working with no bugs. You can include these screenshots or a link to a video in a `README.md` file.

// * Include screenshots (or a video) of typical user flows through your application (for the customer and if relevant the manager/supervisor). This includes views of the prompts and the responses after their selection (for the different selection options).

// * Include any other screenshots you deem necessary to help someone who has never been introduced to your application understand the purpose and function of it. This is how you will communicate to potential employers/other developers in the future what you built and why, and to show how it works. 

// * Because screenshots (and well-written READMEs) are extremely important in the context of GitHub, this will be part of the grading.

// If you haven't written a markdown file yet, [click here for a rundown](https://guides.github.com/features/mastering-markdown/), or just take a look at the raw file of these instructions.

// ### Submission on BCS

// * Please submit the link to the Github Repository!

// ## Instructions

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

// ### Challenge #2: Manager View (Next Level)

// * Create a new Node application called `bamazonManager.js`. Running this application will:

//   * List a set of menu options:

//     * View Products for Sale

//     * View Low Inventory

//     * Add to Inventory

//     * Add New Product

//   * If a manager selects `View Products for Sale`, the app should list every available item: the item IDs, names, prices, and quantities.

//   * If a manager selects `View Low Inventory`, then it should list all items with an inventory count lower than five.

//   * If a manager selects `Add to Inventory`, your app should display a prompt that will let the manager "add more" of any item currently in the store.

//   * If a manager selects `Add New Product`, it should allow the manager to add a completely new product to the store.

// - - -

// * If you finished Challenge #2 and put in all the hours you were willing to spend on this activity, then rest easy! Otherwise continue to the next and final challenge.

// - - -

// ### Challenge #3: Supervisor View (Final Level)

// 1. Create a new MySQL table called `departments`. Your table should include the following columns:

//    * department_id

//    * department_name

//    * over_head_costs (A dummy number you set for each department)

// 2. Modify the products table so that there's a product_sales column, and modify your `bamazonCustomer.js` app so that when a customer purchases anything from the store, the price of the product multiplied by the quantity purchased is added to the product's product_sales column.

//    * Make sure your app still updates the inventory listed in the `products` column.

// 3. Create another Node app called `bamazonSupervisor.js`. Running this application will list a set of menu options:

//    * View Product Sales by Department

//    * Create New Department

// 4. When a supervisor selects `View Product Sales by Department`, the app should display a summarized table in their terminal/bash window. Use the table below as a guide.

// | department_id | department_name | over_head_costs | product_sales | total_profit |
// | ------------- | --------------- | --------------- | ------------- | ------------ |
// | 01            | Electronics     | 10000           | 20000         | 10000        |
// | 02            | Clothing        | 60000           | 100000        | 40000        |

// 5. The `total_profit` column should be calculated on the fly using the difference between `over_head_costs` and `product_sales`. `total_profit` should not be stored in any database. You should use a custom alias.

// 6. If you can't get the table to display properly after a few hours, then feel free to go back and just add `total_profit` to the `departments` table.

//    * Hint: You may need to look into aliases in MySQL.

//    * Hint: You may need to look into GROUP BYs.

//    * Hint: You may need to look into JOINS.

//    * **HINT**: There may be an NPM package that can log the table to the console. What's is it? Good question :)

// ### Reminder: Submission on BCS

// * Please submit the link to the Github Repository!

// - - -

// ### Minimum Requirements

// Attempt to complete homework assignment as described in instructions. If unable to complete certain portions, please pseudocode these portions to describe what remains to be completed. Adding a README.md as well as adding this homework to your portfolio are required as well and more information can be found below.

// - - -

// ### Create a README.md

// Add a `README.md` to your repository describing the project. Here are some resources for creating your `README.md`. Here are some resources to help you along the way:

// * [About READMEs](https://help.github.com/articles/about-readmes/)

// * [Mastering Markdown](https://guides.github.com/features/mastering-markdown/)

// - - -

// ### Add To Your Portfolio

// After completing the homework please add the piece to your portfolio. Make sure to add a link to your updated portfolio in the comments section of your homework so the TAs can easily ensure you completed this step when they are grading the assignment. To receive an 'A' on any assignment, you must link to it from your portfolio.

// - - -

// ### One More Thing

// If you have any questions about this project or the material we have covered, please post them in the community channels in slack so that your fellow developers can help you! If you're still having trouble, you can come to office hours for assistance from your instructor and TAs.

// **Good Luck!**
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