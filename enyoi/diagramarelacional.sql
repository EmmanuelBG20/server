-- Creación de la tabla Personas
CREATE TABLE Personas (
    Id INT PRIMARY KEY IDENTITY,
    Nombre VARCHAR(50),
    Apellido VARCHAR(50),
    Edad INT,
    Cedula VARCHAR(10)
);

-- Creación de la tabla Veterinaria
CREATE TABLE Veterinaria (
    Id INT PRIMARY KEY IDENTITY,
    Nombre VARCHAR(50),
    Direccion VARCHAR(100),
    Telefono VARCHAR(20)
);

-- Creación de la tabla Animales
CREATE TABLE Animales (
    Id INT PRIMARY KEY IDENTITY,
    Nombre VARCHAR(50),
    Genero VARCHAR(10),
    Raza VARCHAR(50),
    PropietarioId INT,
    VeterinariaId INT,
    FOREIGN KEY (PropietarioId) REFERENCES Personas(Id),
    FOREIGN KEY (VeterinariaId) REFERENCES Veterinaria(Id)
);