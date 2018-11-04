use bamazon;
drop table if exists products;
create table products(
  id INT NOT NULL AUTO_INCREMENT,

item_id varchar(255),
product_name varchar(255),
department_name varchar(255),
price decimal(10,2),
stock_quantity integer(10),
  PRIMARY KEY (id)

);

insert into products (
item_id,
product_name,
department_name,
price,
stock_quantity
)VALUES(
"123",
"Nike Air Jordans",
"Shoes",
100.00,
3
);
insert into products (
item_id,
product_name,
department_name,
price,
stock_quantity
)VALUES(
"312",
"Adidas Superstar",
"Shoes",
80.00,
12
);
insert into products (
item_id,
product_name,
department_name,
price,
stock_quantity
)VALUES(
"102",
"Bag of Rice",
"Food",
12.00,
55
);
insert into products (
item_id,
product_name,
department_name,
price,
stock_quantity
)VALUES(
"823",
"Apple iPhone",
"Electronics",
800.00,
2
);
insert into products (
item_id,
product_name,
department_name,
price,
stock_quantity
)VALUES(
"389",
"Epson Inkjet Printer",
"Electronics",
70.00,
4
);
insert into products (
item_id,
product_name,
department_name,
price,
stock_quantity
)VALUES(
"1023",
"Nike Air Max",
"Shoes",
110.00,
3
);
insert into products (
item_id,
product_name,
department_name,
price,
stock_quantity
)VALUES(
"2",
"Slim Jim Beef Jerky",
"Food",
2.00,
300
);
insert into products (
item_id,
product_name,
department_name,
price,
stock_quantity
)VALUES(
"475",
"Dr. Martin's Boots",
"Shoes",
150.00,
6
);
insert into products (
item_id,
product_name,
department_name,
price,
stock_quantity
)VALUES(
"653",
"Peanut Butter",
"Food",
4.00,
30
);
insert into products (
item_id,
product_name,
department_name,
price,
stock_quantity
)VALUES(
"175",
"Microsoft Surface Pro 6",
"Electronics",
1500.00,
2
);
select * from products;

drop table if exists customerOrders;
create table customerOrders(
 id INT NOT NULL AUTO_INCREMENT,
product varchar(255),
quantity int(10),
department varchar(255),
total decimal(10,2),
  PRIMARY KEY (id)

)


