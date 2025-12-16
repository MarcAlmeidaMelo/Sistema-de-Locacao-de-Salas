# Cajuhub - Sistema de Gerenciamento de Locação de Salas

Um sistema web completo para gerenciamento de reservas de salas, desenvolvido com HTML, CSS, JavaScript puro no frontend e Node.js + Express no backend.

## 📋 Características

- ✅ **Autenticação de usuários** com dois perfis (usuário e administrador)
- ✅ **Sistema de reservas** por dia e turno (manhã, tarde, noite)
- ✅ **Calendário interativo** com disponibilidade em tempo real
- ✅ **Painel do usuário** para gerenciar suas reservas
- ✅ **Painel administrativo** para gerenciar salas e todas as reservas
- ✅ **Design responsivo** e minimalista
- ✅ **Banco de dados MySQL** com validações de conflito
- ✅ **API REST** completa

## 🛠️ Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript puro
- **Backend**: Node.js + Express.js
- **Banco de Dados**: MySQL
- **Autenticação**: express-session + bcrypt
- **Conexão BD**: mysql2/promise

## 📁 Estrutura do Projeto

```
cajuhub/
├── assets/              # Imagens e recursos
├── css/
│   └── styles.css       # Estilos globais
├── js/
│   ├── app.js           # Lógica principal da aplicação
│   └── calendar.js      # Componente de calendário
|   ├── carousel.js
|   ├── hash_generator.js
├── server/
│   ├── server.js           # Servidor Express
│   ├── db.js            # Configuração do banco de dados
├── index.html           # Página inicial
├── login.html           # Login de usuário
├── admin-login.html     # Login de administrador
├── user-dashboard.html  # Painel do usuário
├── admin-dashboard.html # Painel do administrador
├── package.json         # Dependências do projeto
├── .env                 # variáveis de ambiente

```

## 🚀 Instalação e Configuração

### 1. Pré-requisitos

- Node.js (v14 ou superior)
- npm ou yarn
- MySQL Server (local ou remoto)

### 2. Clonar/Preparar o Projeto

```bash
cd cajuhub
```

### 3. Instalar Dependências

```bash
npm install
```

### 4. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` e preencha com suas credenciais:

```bash
cp .env.example .env
```

Edite o arquivo `.env`:

```env
DB_HOST=seu_host_mysql
DB_PORT=3306
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=cajuhub
SESSION_SECRET=uma_string_super_secreta_aqui
PORT=3000
NODE_ENV=development
```

### 5. Criar Banco de Dados

Acesse seu MySQL e crie o banco de dados:

```sql
CREATE DATABASE cajuhub;
USE cajuhub;
```

### 6. Executar Migrations

Importe o arquivo de migrations para criar as tabelas:

```bash
mysql -u seu_usuario -p cajuhub < server/migrations.sql
```

### 7. Inserir Dados Iniciais (Seed)

Para adicionar dados de teste:

```bash
mysql -u seu_usuario -p cajuhub < server/seed.sql
```

**Nota**: Os hashes de senha no seed.sql são placeholders. Para gerar hashes bcrypt reais, use:

```bash
node -e "const bcrypt = require('bcrypt'); console.log(bcrypt.hashSync('sua_senha', 10));"
```

Depois atualize o arquivo `seed.sql` com os hashes gerados.

## 📝 Dados de Teste

Após executar o seed.sql, você pode usar:

### Usuário Normal
- **Email**: usuario@example.com
- **Senha**: user123

### Administrador
- **Email**: admin@cajuhub.com
- **Senha**: admin123

## ▶️ Executar o Servidor

```bash
npm start
```

O servidor iniciará em `http://localhost:3000`

## 🌐 Acessar a Aplicação

- **Página Inicial**: http://localhost:3000
- **Login Usuário**: http://localhost:3000/login.html
- **Login Admin**: http://localhost:3000/admin-login.html

## 📚 API Endpoints

### Autenticação

```
POST /api/auth/login              # Login de usuário
POST /api/auth/admin-login        # Login de administrador
POST /api/auth/logout             # Logout
GET  /api/auth/session            # Verificar sessão
```

### Espaços/Salas

```
GET  /api/spaces                  # Listar todas as salas
GET  /api/spaces/:id              # Obter sala específica
POST /api/spaces                  # Criar nova sala (admin)
PUT  /api/spaces/:id              # Atualizar sala (admin)
```

### Reservas

```
GET  /api/reservations            # Listar reservas
POST /api/reservations            # Criar nova reserva
DELETE /api/reservations/:id      # Cancelar reserva
GET  /api/availability/:spaceId/:date  # Verificar disponibilidade
```

## 🔐 Segurança

- Senhas são criptografadas com bcrypt
- Sessões são gerenciadas com express-session
- Validação de conflito de reservas no banco de dados (UNIQUE constraint)
- Proteção contra acesso não autorizado nas rotas

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- Desktop (1920px+)
- Tablet (768px - 1024px)
- Mobile (até 480px)

## 🎨 Customização

### Cores

As cores principais estão definidas em `css/styles.css` como variáveis CSS:

```css
:root {
  --primary-color: #2c3e50;
  --secondary-color: #3498db;
  --accent-color: #e74c3c;
  /* ... mais cores ... */
}
```

### Turnos

Os turnos estão definidos em `js/app.js`:
- **morning**: Manhã (08:00 - 12:00)
- **afternoon**: Tarde (13:00 - 17:00)
- **evening**: Noite (18:00 - 22:00)

## 🐛 Troubleshooting

### Erro de conexão com banco de dados

1. Verifique se o MySQL está rodando
2. Confirme as credenciais no arquivo `.env`
3. Verifique se o banco de dados foi criado

### Erro ao fazer login

1. Certifique-se de que o seed.sql foi executado
2. Verifique se os hashes de senha estão corretos
3. Limpe os cookies do navegador

### Calendário não aparece

1. Verifique se `calendar.js` está sendo carregado
2. Confirme que há um elemento com id `calendar-container`

## 📞 Suporte

Para dúvidas ou problemas, consulte:
- Documentação do Express: https://expressjs.com
- Documentação do MySQL: https://dev.mysql.com/doc
- Documentação do Node.js: https://nodejs.org/docs

## 📄 Licença

MIT

---


