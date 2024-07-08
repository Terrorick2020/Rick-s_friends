const { Client } = require('pg');
const axios = require('axios');



async function connectToDatabase() {
    const client = new Client({
        user: 'admin',
        host: '185.218.0.150',
        database: 'rick_db',
        password: '083Hdwd3',
        port: 5432,
    });

    await client.connect();
    return client;
}

async function createTable(client) {
    try {
        await client.query(`
            DROP TABLE IF EXISTS rick;
            CREATE TABLE rick (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255),
                data JSONB
            );
        `);
        console.log("Таблица успешно создана");
    } catch (error) {
        console.error("Ошибка при создании таблицы:", error.stack);
    }
}

async function fetchDataFromAPI() {
    try {
        const response = await axios.get('https://rickandmortyapi.com/api/character');
        return response.data.results;
    } catch (error) {
        console.error("Ошибка при получении данных от API:", error.message);
    }
}

async function main() {
    const client = await connectToDatabase();
    await createTable(client);

    const characters = await fetchDataFromAPI();

    for (let character of characters) {
        const queryText = `
            INSERT INTO rick (id, name, data)
            VALUES ($1, $2, $3)
            ON CONFLICT (id) DO NOTHING;
        `;
        try {
            await client.query(queryText, [character.id, character.name, character]);
            console.log(`Добавлен персонаж ${character.name}`);
        } catch (error) {
            console.error("Ошибка при добавлении данных:", error.stack);
        }
    }

    client.end(); 
}

main().catch(console.error);