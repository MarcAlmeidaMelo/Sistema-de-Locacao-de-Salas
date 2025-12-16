const bcrypt = require('bcrypt');

async function generateHashes() {
    const userPassword = 'user123';
    const adminPassword = 'admin123';
    const saltRounds = 10;

    const userHash = await bcrypt.hash(userPassword, saltRounds);
    const adminHash = await bcrypt.hash(adminPassword, saltRounds);

    console.log(`Hash para 'user123': ${userHash}`);
    console.log(`Hash para 'admin123': ${adminHash}`);
}

generateHashes();
