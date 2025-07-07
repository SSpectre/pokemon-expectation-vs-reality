import sqlite3 from "sqlite3";

/**
 * A class for interfacing with a SQL database containing Pokemon stat Elo information.
 */
export default class DatabaseAPI {
    /**
     * Initializes the API with the database.
     * @constructor
     */
    constructor() {
        this.db = new sqlite3.Database('./pokemon.db');
    }

    /**
     * Adds new Pokemon to the database with default information.
     * @param {Object[]} list Array of Pokemon objects to be added.
     * @returns {Promise} A Promise which is resolved when an attempt to add every Pokemon in the list has been made.
     */
    addPokemon(list) {
        return new Promise((resolve, reject) => {
            for (const pokemon of list) {
                let sql = `INSERT INTO pokemon (id, name, hp, hp_match_number, hp_reached_threshold, attack, attack_match_number, attack_reached_threshold, 
                    defense, defense_match_number, defense_reached_threshold, special_attack, special_attack_match_number, special_attack_reached_threshold, 
                    special_defense, special_defense_match_number, special_defense_reached_threshold, speed, speed_match_number, speed_reached_threshold)
                    VALUES (${pokemon.id}, "${pokemon.name}", 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0, 1000, 0, 0)`;

                this.db.run(sql, (err) => {
                    try {
                        if(err['code'] != 'SQLITE_CONSTRAINT') {
                            //Pokemon already exists in the database
                            reject(err);
                        }
                        else
                            resolve();
                    } catch (e) {
                        if (e instanceof TypeError) {
                            console.log(sql);
                        }
                    }
                });
            }
        });
    }

    /**
     * Creates a temporary table that stores the real rankings of Pokemon by one stat, to be used for tiebreakers.
     * @param {number[]} realRank The sorted list of IDs to create a table from.
     * @returns {Promise} A Promise which is resolved when the table is created and populated.
     */
    createTempRank(realRank) {
        return new Promise ((resolve, reject) => {
            let sql = `DROP TABLE IF EXISTS temp_rank;
                CREATE TEMPORARY TABLE temp_rank (
                    id INT,
                    rank INT
                );`;

            this.db.exec(sql, (err) => {
                if(err)
                    reject(err);
                else
                    resolve();
            });

            for (const id of realRank) {
                sql = `INSERT INTO temp_rank (id, rank)
                    VALUES (${id}, ${realRank.indexOf(id)});`;

                this.db.run(sql, (err) => {
                    if(err)
                        reject(err);
                    else
                        resolve();
                });
            }
        })
    }

    /**
     * Retrieves the list of Pokemon and their Elo scores for each stat from the database.
     * @param {string} sortingStat The stat to sort the Pokemon by.
     * @param {string} ascending The sort order. Should be '1' for true or '' for false.
     * @returns {Promise<Object[]>} A Promise representing an array of Pokemon Objects.
     */
    getAllPokemon(sortingStat, ascending) {
        return new Promise((resolve, reject) => {
            //real rank is used as a tiebreaker
            let sql = `SELECT pokemon.id, pokemon.name, pokemon.hp, pokemon.attack, pokemon.defense, pokemon.special_attack, pokemon.special_defense, pokemon.speed,
                        temp_rank.rank
                    FROM pokemon
                    JOIN temp_rank ON pokemon.id=temp_rank.id
                    ORDER BY ${sortingStat} ${ascending ? 'ASC' : 'DESC'}, temp_rank.rank ${ascending ? 'DESC' : 'ASC'}`;

            this.db.all(sql, (err, rows) => {
                if(err)
                    reject(err);
                else
                    resolve(rows);
            });
        });
    }

    /**
     * Retrieves the number of matches that a specific Pokemon has been involved in.
     * @param {number} id 
     * @returns {Promise<Object>} A Promise representing an Object containing the match number.
     */
    getPokemonMatchNumber(id) {
        return new Promise((resolve, reject) => {
            let sql = `SELECT (pokemon.hp_match_number + pokemon.attack_match_number + pokemon.defense_match_number + pokemon.special_attack_match_number +
                pokemon.special_defense_match_number + pokemon.speed_match_number) AS match_number
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

    /**
     * Retrieves the Elo score and related information for a single stat of a specific Pokemon from the database.
     * @param {number} id The Pokemon/form's unique id.
     * @param {string} stat The stat to retrieve.
     * @returns {Promise<Object>} A Promise representing an Object containing the requested record.
     */
    getPokemonStatElo(id, stat) {
        return new Promise((resolve, reject) => {
            let matchNumber = stat + "_match_number";
	        let reachedThreshold = stat + "_reached_threshold";

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

    /**
     * Update a Pokemon's Elo and related numbers for a single stat in the database.
     * @param {number} id The Pokemon's unique id.
     * @param {string} stat The stat to update.
     * @param {number} elo The new Elo score.
     * @param {number} matchNumber How many votes have been made regarding this stat for this Pokemon.
     * @param {number} reachedThreshold Whether the Elo for this stat has ever reached >= 2400 or <= -400. Should be 1 for true and 0 for false.
     * @returns {Promise} A Promise that resolves when the database has been updated.
     */
    updatePokemonStatElo(id, stat, elo, matchNumber, reachedThreshold) {
        return new Promise((resolve, reject) => {
            let matchNumberName = stat + "_match_number";
	        let reachedThresholdName = stat + "_reached_threshold";

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