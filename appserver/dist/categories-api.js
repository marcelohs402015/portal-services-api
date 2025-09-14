import express from 'express';
import cors from 'cors';
import pkg from 'pg';
const { Pool } = pkg;
console.log('🚀 Iniciando Categories API...');
const app = express();
const PORT = 3001;
// Database config
const dbConfig = {
    host: 'localhost',
    port: 5432,
    database: 'portalservicesdb',
    user: 'admin',
    password: 'admin',
    ssl: false
};
const pool = new Pool(dbConfig);
console.log('🔧 Configuração do banco:', dbConfig);
// Middleware
app.use(cors());
app.use(express.json());
console.log('✅ Middlewares configurados');
// Test database connection
pool.query('SELECT 1').then(() => {
    console.log('✅ Banco de dados conectado');
}).catch(err => {
    console.log('❌ Erro na conexão com banco:', err.message);
});
// Health check
app.get('/api/health', (req, res) => {
    console.log('📋 Health check solicitado');
    res.json({
        success: true,
        message: 'Categories API is running',
        timestamp: new Date().toISOString(),
        version: '2.0.0'
    });
});
// GET /api/categories - Lista todas as categorias
app.get('/api/categories', async (req, res) => {
    try {
        console.log('📋 Listando categorias...');
        const result = await pool.query('SELECT * FROM categories ORDER BY name ASC');
        console.log(`✅ Encontradas ${result.rows.length} categorias`);
        res.json({
            success: true,
            data: result.rows,
            count: result.rows.length
        });
    }
    catch (error) {
        console.error('❌ Erro ao listar categorias:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
// GET /api/categories/:id - Obter categoria por ID
app.get('/api/categories/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                error: 'ID deve ser um número válido'
            });
        }
        console.log(`🔍 Buscando categoria ID: ${id}`);
        const result = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Categoria não encontrada'
            });
        }
        console.log(`✅ Categoria encontrada: ${result.rows[0].name}`);
        res.json({
            success: true,
            data: result.rows[0]
        });
    }
    catch (error) {
        console.error('❌ Erro ao buscar categoria:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
// POST /api/categories - Criar nova categoria
app.post('/api/categories', async (req, res) => {
    try {
        const { name, description, color = '#3B82F6', active = true } = req.body;
        if (!name || !description) {
            return res.status(400).json({
                success: false,
                error: 'Nome e descrição são obrigatórios'
            });
        }
        console.log(`➕ Criando categoria: ${name}`);
        const result = await pool.query('INSERT INTO categories (name, description, color, active) VALUES ($1, $2, $3, $4) RETURNING *', [name, description, color, active]);
        console.log(`✅ Categoria criada com ID: ${result.rows[0].id}`);
        res.status(201).json({
            success: true,
            data: result.rows[0],
            message: 'Categoria criada com sucesso'
        });
    }
    catch (error) {
        console.error('❌ Erro ao criar categoria:', error);
        if (error.message.includes('duplicate key')) {
            return res.status(409).json({
                success: false,
                error: 'Categoria com este nome já existe'
            });
        }
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
// PUT /api/categories/:id - Atualizar categoria
app.put('/api/categories/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                error: 'ID deve ser um número válido'
            });
        }
        const { name, description, color, active } = req.body;
        console.log(`✏️  Atualizando categoria ID: ${id}`);
        const result = await pool.query('UPDATE categories SET name = $1, description = $2, color = $3, active = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *', [name, description, color, active, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Categoria não encontrada'
            });
        }
        console.log(`✅ Categoria atualizada: ${result.rows[0].name}`);
        res.json({
            success: true,
            data: result.rows[0],
            message: 'Categoria atualizada com sucesso'
        });
    }
    catch (error) {
        console.error('❌ Erro ao atualizar categoria:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
// DELETE /api/categories/:id - Deletar categoria (soft delete)
app.delete('/api/categories/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                error: 'ID deve ser um número válido'
            });
        }
        console.log(`🗑️  Desativando categoria ID: ${id}`);
        const result = await pool.query('UPDATE categories SET active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING name', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Categoria não encontrada'
            });
        }
        console.log(`✅ Categoria desativada: ${result.rows[0].name}`);
        res.json({
            success: true,
            message: 'Categoria desativada com sucesso'
        });
    }
    catch (error) {
        console.error('❌ Erro ao desativar categoria:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
// Start server
app.listen(PORT, () => {
    console.log(`🎉 Categories API rodando em http://localhost:${PORT}`);
    console.log(`📋 Endpoints disponíveis:`);
    console.log(`   GET    /api/health`);
    console.log(`   GET    /api/categories`);
    console.log(`   GET    /api/categories/:id`);
    console.log(`   POST   /api/categories`);
    console.log(`   PUT    /api/categories/:id`);
    console.log(`   DELETE /api/categories/:id`);
    console.log(`\n🧪 Para testar no Bruno:`);
    console.log(`   Health: GET http://localhost:${PORT}/api/health`);
    console.log(`   List:   GET http://localhost:${PORT}/api/categories`);
});
// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n👋 Encerrando servidor...');
    await pool.end();
    process.exit(0);
});
//# sourceMappingURL=categories-api.js.map