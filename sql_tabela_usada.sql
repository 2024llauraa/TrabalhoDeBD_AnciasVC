CREATE TABLE pedidos
(
    id_pedido integer NOT NULL,
    data_pedido date,
    valor_total numeric(10,2),
    id_cliente integer,
    CONSTRAINT pedidos_pkey PRIMARY KEY (id_pedido)
);

INSERT INTO pedidos (id_pedido, data_pedido, valor_total, id_cliente) VALUES
(1, '2025-11-10', 300.00, 1),   
(2, '2025-11-11', 120.50, 2),
(3, '2025-11-12', 85.90, 3),
(4, '2025-11-13', 999.99, 1),
(5, '2025-11-14', 300.00, 2),
(6, '2025-11-14', 500.00, 10),
(7, '2025-11-14', 700.00, 10),
(8, '2025-11-14', 800.00, 10);