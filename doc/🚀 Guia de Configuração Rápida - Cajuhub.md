# 🚀 Guia de Configuração Rápida - Cajuhub

## ⚡ Início Rápido (5 minutos)

### Passo 1: Instalar Dependências

```bash
cd /home/ubuntu/cajuhub
npm install
```

### Passo 2: Criar Arquivo .env

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais MySQL:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=cajuhub
SESSION_SECRET=minha_chave_super_secreta_12345
PORT=3000
NODE_ENV=development
```

### Passo 3: Criar Banco de Dados

Se estiver usando MySQL localmente:

```bash
mysql -u root -p -e "CREATE DATABASE cajuhub;"
```

### Passo 4: Executar Migrations

```bash
mysql -u root -p cajuhub < server/migrations.sql
```

### Passo 5: Inserir Dados Iniciais

```bash
mysql -u root -p cajuhub < server/seed.sql
```

### Passo 6: Iniciar o Servidor

```bash
npm start
```

Você verá:
```
╔════════════════════════════════════════════════════════════╗
║                   CAJUHUB - SERVIDOR INICIADO              ║
╠════════════════════════════════════════════════════════════╣
║  Servidor rodando em: http://localhost:3000                ║
║  Ambiente: development                                     ║
║  Banco de dados: localhost                                 ║
╚════════════════════════════════════════════════════════════╝
```

### Passo 7: Acessar a Aplicação

Abra seu navegador e acesse:
- **Página Inicial**: http://localhost:3000
- **Login Usuário**: http://localhost:3000/login.html
- **Login Admin**: http://localhost:3000/admin-login.html

## 🔑 Credenciais de Teste

### Usuário Normal
```
Email: usuario@example.com
Senha: user123
```

### Administrador
```
Email: admin@cajuhub.com
Senha: admin123
```

## 🗄️ Usando FreeSQLDatabase (Banco Remoto)

Se quiser usar o FreeSQLDatabase em produção:

1. Crie uma conta em https://www.freesqldatabase.com
2. Crie um novo banco de dados
3. Copie as credenciais fornecidas
4. Atualize o arquivo `.env`:

```env
DB_HOST=sql12.freesqldatabase.com
DB_PORT=3306
DB_USER=seu_usuario_freesql
DB_PASSWORD=sua_senha_freesql
DB_NAME=seu_banco_freesql
SESSION_SECRET=sua_chave_secreta
PORT=3000
NODE_ENV=production
```

5. Execute as migrations e seed no painel do FreeSQLDatabase

## 📋 Checklist de Configuração

- [ ] Node.js instalado (`node --version`)
- [ ] npm instalado (`npm --version`)
- [ ] MySQL instalado e rodando
- [ ] Arquivo `.env` criado e preenchido
- [ ] Banco de dados criado
- [ ] Migrations executadas
- [ ] Seed executado
- [ ] Servidor iniciado sem erros
- [ ] Página inicial carrega em http://localhost:3000
- [ ] Login funciona com credenciais de teste

## 🔧 Gerar Novos Hashes de Senha (bcrypt)

Se quiser criar novos usuários com senhas diferentes:

```bash
node -e "const bcrypt = require('bcrypt'); console.log(bcrypt.hashSync('sua_nova_senha', 10));"
```

Copie o hash gerado e insira no banco de dados:

```sql
INSERT INTO users (email, password, name, role, phone) VALUES
('novo@email.com', 'hash_gerado_acima', 'Novo Usuário', 'user', '(79) 99999-9999');
```

## 🐛 Problemas Comuns

### "Cannot find module 'express'"
```bash
npm install
```

### "Error: connect ECONNREFUSED 127.0.0.1:3306"
- Verifique se MySQL está rodando
- Confirme as credenciais no `.env`

### "Error: Access denied for user 'root'@'localhost'"
- Verifique a senha no `.env`
- Resete a senha do MySQL se necessário

### "Error: Unknown database 'cajuhub'"
```bash
mysql -u root -p -e "CREATE DATABASE cajuhub;"
```

### Calendário não aparece na página
- Verifique se `js/calendar.js` está sendo carregado
- Abra o console do navegador (F12) para ver erros

## 📚 Estrutura de Arquivos Importantes

```
cajuhub/
├── server/app.js          ← Servidor Express (lógica backend)
├── js/app.js              ← Lógica frontend (API calls)
├── js/calendar.js         ← Componente calendário
├── css/styles.css         ← Todos os estilos
├── index.html             ← Página inicial
├── login.html             ← Login usuário
├── admin-login.html       ← Login admin
├── user-dashboard.html    ← Painel usuário
├── admin-dashboard.html   ← Painel admin
├── server/migrations.sql  ← Criar tabelas
├── server/seed.sql        ← Dados iniciais
├── .env                   ← Variáveis de ambiente
└── package.json           ← Dependências
```

## 🎯 Próximos Passos

1. **Customizar cores**: Edite `:root` em `css/styles.css`
2. **Adicionar logo**: Coloque imagem em `assets/logo.png`
3. **Adicionar mais salas**: Use o painel admin
4. **Criar novos usuários**: Use o painel admin ou SQL direto
5. **Fazer deploy**: Siga o guia de deployment (veja README.md)

## 📞 Suporte Rápido

Se tiver dúvidas sobre:
- **Express.js**: https://expressjs.com
- **MySQL**: https://dev.mysql.com/doc
- **JavaScript**: https://developer.mozilla.org/pt-BR/docs/Web/JavaScript

---

**Pronto! Seu Cajuhub está configurado e rodando! 🎉**
