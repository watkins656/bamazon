USE bamazon;
drop table if exists users;
CREATE TABLE users(
      id INT NOT NULL AUTO_INCREMENT,
      username varchar(135),
      password varchar(135),
      userType varchar(135),
      PRIMARY KEY (id)
)
