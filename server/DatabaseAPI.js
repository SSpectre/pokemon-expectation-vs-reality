import sqlite3 from "sqlite3";

export default class DatabaseAPI {
    constructor() {
        this.db = new sqlite3.Database('./pokemon.db');
    }

    addPokemon(list) {
        return new Promise((resolve, reject) => {
            for (const pokemon of list) {
                try {
                    let sql = `INSERT INTO pokemon (id, name, hp, hp_match_number, hp_reached_threshold, attack, attack_match_number, attack_reached_threshold, 
                        defense, defense_match_number, defense_reached_threshold, special_attack, special_attack_match_number, special_attack_reached_threshold, 
                        special_defense, special_defense_match_number, special_defense_reached_threshold, speed, speed_match_number, speed_reached_threshold)
                        VALUES (${pokemon.id}, "${pokemon.name}", 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0)`;

                    this.db.run(sql, (err) => {
                            if(err['code'] != 'SQLITE_CONSTRAINT') {
                                reject(err);
                            }
                            else
                                resolve();
                        }
                    );
                } catch (err) {
                    
                }
            }
        });
    }

    getPokemonById(id) {
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT * FROM pokemon WHERE id = (?)`, id, (err, rows) => {
                if(err)
                    reject(err);
                else
                    resolve(rows);
            });
        });
    }

    getAllPokemon(sortingStat) {
        return new Promise((resolve, reject) => {
            let sql = `SELECT id, name, hp, attack, defense, special_attack, special_defense, speed
                FROM pokemon
                ORDER BY ${sortingStat} DESC, hp + attack + defense + special_attack + special_defense + speed DESC`;

            this.db.all(sql, (err, rows) => {
                if(err)
                    reject(err);
                else
                    resolve(rows);
            });
        });
    }

    getPokemonStatElo(id, stat, matchNumber, reachedThreshold) {
        return new Promise((resolve, reject) => {
            let sql = `SELECT ${stat}, ${matchNumber}, ${reachedThreshold}
                FROM pokemon
                WHERE id = ${id}`;

            this.db.get(sql, (err, rows) => {
                if(err)
                    reject(err);
                else
                    resolve(rows);
            });
        });
    }

    updatePokemonStatElo(id, stat, elo, matchNumber, matchNumberName, reachedThreshold, reachedThresholdName) {
        return new Promise((resolve, reject) => {
            let sql = `UPDATE pokemon
                SET ${stat} = ${elo}, ${matchNumberName} = ${matchNumber}, ${reachedThresholdName} = ${reachedThreshold}
                WHERE id = ${id}`;

            this.db.run(sql, (err) => {
                if(err)
                    reject(err);
                else
                    resolve();
            });
        });
    }
}