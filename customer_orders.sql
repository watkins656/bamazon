DROP TABLE IF EXISTS `customerorders`; 
CREATE TABLE `customerorders` (
   `id` int(11) NOT NULL AUTO_INCREMENT,
   `product` varchar(255) DEFAULT NULL,
   `quantity` varchar(255) DEFAULT NULL,
   `department` varchar(255) DEFAULT NULL,
   `total` decimal(10,2),
   PRIMARY KEY (`id`)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci