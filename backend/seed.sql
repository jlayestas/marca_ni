-- ============================================================
-- Admin user: admin@marcasni.com / Admin1234!
-- ============================================================
INSERT INTO admin_users (email, password_hash) VALUES
('admin@marcasni.com', '$2b$10$EglkeeanlhayLVkRCBDiquhl878uknPMhcOXRUSpCkCtBouNx0A8G')
ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- Approved / published trademarks (20 records)
-- ============================================================
INSERT INTO trademarks (nombre_marca, marca_denominativa, status, nice_class, dueno, contactos, redes_sociales, direccion, published, approval_status) VALUES

('Café Dorado', 'CAFÉ DORADO', 'Registrada', 30, 'Exportaciones del Norte S.A.',
 '["+(505) 8888-1234", "+(505) 2270-5500"]',
 '{"instagram": "cafedorado.ni", "facebook": "cafedoradoni", "website": "cafedorado.com.ni"}',
 'Km 12 Carretera Norte, Managua, Nicaragua', true, 'approved'),

('Nica Brew', 'NICA BREW', 'Registrada', 32, 'Carlos Méndez Castillo',
 '["+(505) 7777-5678"]',
 '{"instagram": "nicabrew", "website": "nicabrew.com"}',
 'Calle El Progreso, Granada, Nicaragua', true, 'approved'),

('Volcán Azul', 'VOLCÁN AZUL', 'Cancelada', 33, 'Destilería Nacional S.A.',
 '["+(505) 8900-0001"]',
 '{"facebook": "volcanazulni"}',
 'León, Nicaragua', false, 'approved'),

('Pura Tierra', 'PURA TIERRA', 'Registrada', 31, 'Agro Nica Corp.',
 '["+(505) 8900-0002", "+(505) 2272-1100"]',
 '{"instagram": "puratierra.ni", "website": "puratierra.com.ni"}',
 'Matagalpa, Nicaragua', true, 'approved'),

('Café Selva Negra', 'CAFÉ SELVA NEGRA', 'Registrada', 30, 'Hacienda Selva Negra',
 '["+(505) 8765-4321"]',
 '{"instagram": "selvanegrani", "facebook": "selvanegranicaragua", "website": "selvanegra.com.ni"}',
 'Matagalpa, km 140 Carretera a Jinotega, Nicaragua', true, 'approved'),

('Ron Flor de Caña', 'FLOR DE CAÑA', 'Registrada', 33, 'Compañía Licorera de Nicaragua S.A.',
 '["+(505) 2311-3636"]',
 '{"instagram": "flordecana", "facebook": "flordecanaofficial", "website": "flordecana.com"}',
 'Chichigalpa, Chinandega, Nicaragua', true, 'approved'),

('Toña Cerveza', 'CERVEZA TOÑA', 'Registrada', 32, 'Compañía Cervecera de Nicaragua S.A.',
 '["+(505) 2249-7000"]',
 '{"instagram": "cervecerani", "facebook": "cervecerianicaragua", "website": "ccn.com.ni"}',
 'Managua, Nicaragua', true, 'approved'),

('La Colonia', 'LA COLONIA', 'Registrada', 35, 'Supermercados La Colonia S.A.',
 '["+(505) 2277-3900"]',
 '{"facebook": "supermercadoslacolonia", "website": "lacolonia.com.ni"}',
 'Carretera Masaya km 4.5, Managua, Nicaragua', true, 'approved'),

('Eskimo Nicaragua', 'ESKIMO', 'Registrada', 30, 'PROLACSA S.A.',
 '["+(505) 2248-2222"]',
 '{"instagram": "eskimoni", "facebook": "eskimonicaragua"}',
 'Managua, Nicaragua', true, 'approved'),

('Café Nicaragua Premium', 'CAFÉ NICARAGUA PREMIUM', 'En Tramite', 30, 'Cooperativa Cafetalera del Norte',
 '["+(505) 8654-3210"]',
 '{"instagram": "cafenicaraguapremium"}',
 'Jinotega, Nicaragua', true, 'approved'),

('Nica Gold Coffee', 'NICA GOLD', 'En Tramite', 30, 'Jorge Ramírez Exportaciones',
 '["+(505) 8555-9999"]',
 '{"website": "nicagold.com"}',
 'Managua, Nicaragua', true, 'approved'),

('Café Armonía', 'CAFÉ ARMONÍA', 'Registrada', 30, 'Finca Armonía S.A.',
 '["+(505) 8444-1111"]',
 '{"instagram": "cafearmoniani", "facebook": "cafearmoniani"}',
 'Dipilto, Nueva Segovia, Nicaragua', true, 'approved'),

('Pinolero Beer', 'PINOLERO BEER', 'En Tramite', 32, 'Cervecería Artesanal Pinolero',
 '["+(505) 8333-7777"]',
 '{"instagram": "pinolerobeer", "facebook": "pinolerobeer"}',
 'Masaya, Nicaragua', true, 'approved'),

('Café Momotombo', 'CAFÉ MOMOTOMBO', 'Registrada', 30, 'Productores del Pacífico S.A.',
 '["+(505) 2311-0000"]',
 '{"website": "momotombocafe.com"}',
 'León, Nicaragua', true, 'approved'),

('Nica Rum Co.', 'NICA RUM', 'En Tramite', 33, 'Destilados Artesanales de Nicaragua',
 '["+(505) 8222-4444"]',
 '{"instagram": "nicarum", "website": "nicarum.com"}',
 'Granada, Nicaragua', true, 'approved'),

('Tierra Nica Organics', 'TIERRA NICA', 'Registrada', 31, 'Exportaciones Orgánicas de Nicaragua',
 '["+(505) 8111-5555"]',
 '{"instagram": "tierranicaorganics", "website": "tierranica.com"}',
 'Estelí, Nicaragua', true, 'approved'),

('Café Jalapa', 'CAFÉ JALAPA', 'Registrada', 30, 'Cooperativa Agropecuaria de Jalapa',
 '["+(505) 8000-6666"]',
 '{"facebook": "cafejalapa"}',
 'Jalapa, Nueva Segovia, Nicaragua', true, 'approved'),

('Nica Cacao', 'NICA CACAO', 'En Tramite', 30, 'Cacaotera del Caribe S.A.',
 '["+(505) 7999-7777"]',
 '{"instagram": "nicacacao", "website": "nicacacao.com"}',
 'Bluefields, RACCS, Nicaragua', true, 'approved'),

('Café Bosawás', 'CAFÉ BOSAWÁS', 'Registrada', 30, 'Productores Indígenas Miskitu',
 '["+(505) 7888-8888"]',
 '{"facebook": "cafebosawas"}',
 'Wiwilí, Jinotega, Nicaragua', true, 'approved'),

('Nicaragua Craft Coffee', 'NICARAGUA CRAFT COFFEE', 'En Tramite', 30, 'Innovación Cafetalera NI S.A.',
 '["+(505) 7777-9999"]',
 '{"instagram": "nicraftcoffee", "facebook": "nicaraguacraftcoffee", "website": "nicraftcoffee.com"}',
 'Managua, Nicaragua', true, 'approved');

-- ============================================================
-- Pending submissions (for testing the approval workflow)
-- ============================================================
INSERT INTO trademarks (nombre_marca, marca_denominativa, status, nice_class, dueno, contactos, redes_sociales, direccion, published, approval_status) VALUES

('Nica Spirits', 'NICA SPIRITS', 'En Tramite', 33, 'Roberto Gutiérrez Lara',
 '["+(505) 8123-4567"]',
 '{"instagram": "nicaspirits"}',
 'Managua, Nicaragua', false, 'pending'),

('Verde Campo', 'VERDE CAMPO', 'En Tramite', 31, 'Agrícola Verde Campo S.A.',
 '["+(505) 8234-5678", "+(505) 2270-9900"]',
 '{"facebook": "verdecamponi", "website": "verdecampo.com.ni"}',
 'Chontales, Nicaragua', false, 'pending'),

('Madera & Fuego', 'MADERA Y FUEGO', 'En Tramite', 43, 'Restaurantes Nica Group',
 '["+(505) 8345-6789"]',
 '{"instagram": "maderayfuego", "facebook": "maderayfuegoni"}',
 'Plaza Inter, Managua, Nicaragua', false, 'pending'),

('Café Tepeyac', 'CAFÉ TEPEYAC', 'En Tramite', 30, 'Luis Obando Hernández',
 '["+(505) 8456-7890"]',
 '{"instagram": "cafetepeyac"}',
 'Ocotal, Nueva Segovia, Nicaragua', false, 'pending');
