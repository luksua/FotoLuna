-- MySQL Script generated by MySQL Workbench
-- Fri Apr 25 12:19:19 2025
-- Model: New Model    Version: 1.0
-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema fotoluna
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema fotoluna
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `fotoluna` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci ;
USE `fotoluna` ;

-- -----------------------------------------------------
-- Table `fotoluna`.`cliente`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `fotoluna`.`cliente` (
  `id_cliente` INT NOT NULL,
  `nombre_cliente` VARCHAR(50) NOT NULL,
  `apellido_cliente` VARCHAR(50) NOT NULL,
  `correo_cliente` VARCHAR(100) NOT NULL,
  `telef_cliente` VARCHAR(15) NOT NULL,
  `num_doc_cliente` VARCHAR(15) NOT NULL,
  `tipo_doc` ENUM('C.C', 'C.E', 'PAS') NOT NULL,
  `contraseña_cliente` VARCHAR(255) NOT NULL,
  `estado_cliente` ENUM('Activo', 'Inactivo') NOT NULL,
  PRIMARY KEY (`id_cliente`),
  UNIQUE INDEX `correo_cliente_UNIQUE` (`correo_cliente` ASC) VISIBLE,
  UNIQUE INDEX `num_doc_cliente_UNIQUE` (`num_doc_cliente` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `fotoluna`.`empleado`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `fotoluna`.`empleado` (
  `id_empleado` INT NOT NULL,
  `nombre_empleado` VARCHAR(50) NOT NULL,
  `apellido_empleado` VARCHAR(50) NOT NULL,
  `telef_empleado` VARCHAR(15) NOT NULL,
  `EPS` VARCHAR(30) NOT NULL,
  `num_doc_empleado` VARCHAR(15) NOT NULL,
  `tipo_doc` ENUM('C.C', 'C.E', 'PAS') NOT NULL,
  `correo_empleado` VARCHAR(50) NOT NULL,
  `tipo_empleado` ENUM('Empleado', 'Administrador') NOT NULL,
  `genero` ENUM('Femenino', 'Masculino', 'Otro') NOT NULL,
  `direccion` VARCHAR(50) NOT NULL,
  `contraseña_empleado` VARCHAR(255) NOT NULL,
  `estado_empleado` ENUM('Activo', 'Inactivo') NOT NULL,
  PRIMARY KEY (`id_empleado`),
  UNIQUE INDEX `num_doc_empleado_UNIQUE` (`num_doc_empleado` ASC) VISIBLE,
  UNIQUE INDEX `correo_empleado_UNIQUE` (`correo_empleado` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `fotoluna`.`evento`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `fotoluna`.`evento` (
  `id_evento` INT NOT NULL,
  `tipo_evento` ENUM('Maternidad', 'Cumpleaños', 'Quine Años', 'Bodas', 'Bautizos', 'Familia', 'Grados', 'Otros') NOT NULL,
  PRIMARY KEY (`id_evento`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `fotoluna`.`paquete`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `fotoluna`.`paquete` (
  `id_paquete` INT NOT NULL,
  `nombre_paquete` VARCHAR(20) NOT NULL,
  `cant_fotos` DECIMAL(50,0) NOT NULL,
  `descripcion_paquete` TEXT NOT NULL,
  `valor` FLOAT(8,2) NOT NULL,
  PRIMARY KEY (`id_paquete`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `fotoluna`.`reserva`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `fotoluna`.`reserva` (
  `id_reserva` INT NOT NULL,
  `fecha_reserva` CHAR(10) NOT NULL,
  `fecha_hecha_reserva` DATETIME NOT NULL,
  `hora_inicio` TIME NOT NULL,
  `hora_fin` TIME NOT NULL,
  `comentario` VARCHAR(255) NULL DEFAULT NULL,
  `estado_reserva` ENUM('Pendiente', 'Confirmada', 'Cancelada', 'Finalizada') NOT NULL,
  `cliente_id_cliente` INT NOT NULL,
  `empleado_id_empleado` INT NOT NULL,
  `evento_id_evento` INT NOT NULL,
  `paquete_id_paquete` INT NOT NULL,
  PRIMARY KEY (`id_reserva`, `cliente_id_cliente`, `empleado_id_empleado`, `evento_id_evento`, `paquete_id_paquete`),
  INDEX `fk_reserva_cliente1_idx` (`cliente_id_cliente` ASC) VISIBLE,
  INDEX `fk_reserva_empleado1_idx` (`empleado_id_empleado` ASC) VISIBLE,
  INDEX `fk_reserva_evento1_idx` (`evento_id_evento` ASC) VISIBLE,
  INDEX `fk_reserva_paquete1_idx` (`paquete_id_paquete` ASC) VISIBLE,
  CONSTRAINT `fk_reserva_cliente1`
    FOREIGN KEY (`cliente_id_cliente`)
    REFERENCES `fotoluna`.`cliente` (`id_cliente`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_reserva_empleado1`
    FOREIGN KEY (`empleado_id_empleado`)
    REFERENCES `fotoluna`.`empleado` (`id_empleado`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_reserva_evento1`
    FOREIGN KEY (`evento_id_evento`)
    REFERENCES `fotoluna`.`evento` (`id_evento`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_reserva_paquete1`
    FOREIGN KEY (`paquete_id_paquete`)
    REFERENCES `fotoluna`.`paquete` (`id_paquete`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `fotoluna`.`galeria`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `fotoluna`.`galeria` (
  `id_galeria` INT NOT NULL,
  `nombre_galeria` VARCHAR(30) NOT NULL,
  `estado_galeria` ENUM('Activo', 'Inactivo') NOT NULL,
  `codigo_galeria` VARCHAR(255) NOT NULL,
  `reserva_id_reserva` INT NOT NULL,
  `reserva_cliente_id_cliente` INT NOT NULL,
  `reserva_empleado_id_empleado` INT NOT NULL,
  PRIMARY KEY (`id_galeria`, `reserva_id_reserva`, `reserva_cliente_id_cliente`, `reserva_empleado_id_empleado`),
  UNIQUE INDEX `codigo_galeria_UNIQUE` (`codigo_galeria` ASC) VISIBLE,
  INDEX `fk_galeria_reserva1_idx` (`reserva_id_reserva` ASC, `reserva_cliente_id_cliente` ASC, `reserva_empleado_id_empleado` ASC) VISIBLE,
  CONSTRAINT `fk_galeria_reserva1`
    FOREIGN KEY (`reserva_id_reserva` , `reserva_cliente_id_cliente` , `reserva_empleado_id_empleado`)
    REFERENCES `fotoluna`.`reserva` (`id_reserva` , `cliente_id_cliente` , `empleado_id_empleado`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `fotoluna`.`fotografia`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `fotoluna`.`fotografia` (
  `id_foto` INT NOT NULL,
  `descripcion_foto` TEXT NOT NULL,
  `fecha_foto` DATE NOT NULL,
  `galeria_id_galeria` INT NOT NULL,
  `galeria_reserva_id_reserva` INT NOT NULL,
  `galeria_reserva_cliente_id_cliente` INT NOT NULL,
  `galeria_reserva_empleado_id_empleado` INT NOT NULL,
  PRIMARY KEY (`id_foto`, `galeria_id_galeria`, `galeria_reserva_id_reserva`, `galeria_reserva_cliente_id_cliente`, `galeria_reserva_empleado_id_empleado`),
  INDEX `AK_Identifier_2` (`id_foto` ASC) VISIBLE,
  INDEX `fk_fotografia_galeria1_idx` (`galeria_id_galeria` ASC, `galeria_reserva_id_reserva` ASC, `galeria_reserva_cliente_id_cliente` ASC, `galeria_reserva_empleado_id_empleado` ASC) VISIBLE,
  CONSTRAINT `fk_fotografia_galeria1`
    FOREIGN KEY (`galeria_id_galeria` , `galeria_reserva_id_reserva` , `galeria_reserva_cliente_id_cliente` , `galeria_reserva_empleado_id_empleado`)
    REFERENCES `fotoluna`.`galeria` (`id_galeria` , `reserva_id_reserva` , `reserva_cliente_id_cliente` , `reserva_empleado_id_empleado`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `fotoluna`.`pago`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `fotoluna`.`pago` (
  `id_pago` INT NOT NULL,
  `monto` FLOAT(8,2) NOT NULL,
  `fecha_pago` DATE NOT NULL,
  `metodo_pago` ENUM('Efectivo', 'Tarjeta', 'Transferencia', 'PSE', 'Nequi', 'Daviplata') NOT NULL,
  `estado_pago` ENUM('Pendiente', 'Confirmado') NOT NULL,
  `reserva_id_reserva` INT NOT NULL,
  `reserva_cliente_id_cliente` INT NOT NULL,
  `reserva_empleado_id_empleado` INT NOT NULL,
  PRIMARY KEY (`id_pago`, `reserva_id_reserva`, `reserva_cliente_id_cliente`, `reserva_empleado_id_empleado`),
  INDEX `fk_pago_reserva1_idx` (`reserva_id_reserva` ASC, `reserva_cliente_id_cliente` ASC, `reserva_empleado_id_empleado` ASC) VISIBLE,
  CONSTRAINT `fk_pago_reserva1`
    FOREIGN KEY (`reserva_id_reserva` , `reserva_cliente_id_cliente` , `reserva_empleado_id_empleado`)
    REFERENCES `fotoluna`.`reserva` (`id_reserva` , `cliente_id_cliente` , `empleado_id_empleado`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
