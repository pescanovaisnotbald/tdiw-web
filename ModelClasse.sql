
CREATE TABLE categoria
(
  category_id NUMERIC NOT NULL,
  nom         VARCHAR NULL    ,
  img         VARCHAR NULL    ,
  PRIMARY KEY (category_id)
);

CREATE TABLE comanda
(
  comanda_id      NUMERIC NOT NULL,
  data_creació    DATE    NOT NULL,
  número_elements INT     NULL    ,
  import_total    FLOAT   NULL    ,
  usuari_id       NUMERIC NOT NULL,
  PRIMARY KEY (comanda_id)
);

CREATE TABLE linia_comanda
(
  id           NUMERIC NOT NULL,
  nom_producte VARCHAR NOT NULL,
  quantitat    INT     NOT NULL,
  preu_unitari FLOAT   NOT NULL,
  preu_total   FLOAT   NOT NULL,
  comanda_id   NUMERIC NOT NULL,
  product_id   NUMERIC NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE producte
(
  product_id  NUMERIC NOT NULL,
  nom         VARCHAR NOT NULL,
  imatge      VARCHAR NULL    ,
  preu        FLOAT   NULL    ,
  category_id NUMERIC NOT NULL,
  descripcio  VARCHAR NULL    ,
  PRIMARY KEY (product_id)
);

CREATE TABLE usuari
(
  usuari_id NUMERIC NOT NULL,
  email     VARCHAR NOT NULL,
  password  VARCHAR NOT NULL,
  address   VARCHAR NULL    ,
  location  VARCHAR NULL    ,
  postcode  INT     NULL    ,
  name      VARCHAR NULL    ,
  PRIMARY KEY (usuari_id)
);

ALTER TABLE comanda
  ADD CONSTRAINT FK_usuari_TO_comanda
    FOREIGN KEY (usuari_id)
    REFERENCES usuari (usuari_id);

ALTER TABLE linia_comanda
  ADD CONSTRAINT FK_comanda_TO_linia_comanda
    FOREIGN KEY (comanda_id)
    REFERENCES comanda (comanda_id);

ALTER TABLE producte
  ADD CONSTRAINT FK_categoria_TO_producte
    FOREIGN KEY (category_id)
    REFERENCES categoria (category_id);

ALTER TABLE linia_comanda
  ADD CONSTRAINT FK_producte_TO_linia_comanda
    FOREIGN KEY (product_id)
    REFERENCES producte (product_id);
