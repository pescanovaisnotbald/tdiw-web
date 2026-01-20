-- Para versiones anteriores a PostgreSQL 13, necesitas habilitar la extensión:
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE categoria (
    category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom VARCHAR NULL,
    img VARCHAR NULL
);

CREATE TABLE usuari (
    usuari_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR NOT NULL,
    password VARCHAR NOT NULL,
    address VARCHAR NULL,
    location VARCHAR NULL,
    postcode INT NULL,
    name VARCHAR NULL
);

CREATE TABLE comanda (
    comanda_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data_creació DATE NOT NULL,
    número_elements INT NULL,
    import_total FLOAT NULL,
    usuari_id UUID NOT NULL,
    FOREIGN KEY (usuari_id) REFERENCES usuari(usuari_id)
);

CREATE TABLE producte (
    product_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom VARCHAR NOT NULL,
    imatge VARCHAR NULL,
    preu FLOAT NULL,
    category_id UUID NOT NULL,
    descripcio VARCHAR NULL,
    FOREIGN KEY (category_id) REFERENCES categoria(category_id)
);

CREATE TABLE linia_comanda (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom_producte VARCHAR NOT NULL,
    quantitat INT NOT NULL,
    preu_unitari FLOAT NOT NULL,
    preu_total FLOAT NOT NULL,
    comanda_id UUID NOT NULL,
    product_id UUID NOT NULL,
    FOREIGN KEY (comanda_id) REFERENCES comanda(comanda_id),
    FOREIGN KEY (product_id) REFERENCES producte(product_id)
);
